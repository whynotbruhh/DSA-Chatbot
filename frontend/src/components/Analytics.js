import React, { useEffect, useState } from "react";
import { fetchQuizHistory } from "../services/api";
import { Line, Pie, Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

function Analytics() {
  const [data, setData] = useState([]);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalIncorrect, setTotalIncorrect] = useState(0);
  const [difficultyCounts, setDifficultyCounts] = useState({ 2: 0, 3: 0, 4: 0, 5: 0 });

  useEffect(() => {
    fetchQuizHistory("test_user").then((res) => {
      const history = res.data.history || [];
      setData(history);

      const correct = history.filter((d) => d.is_correct).length;
      const incorrect = history.filter((d) => !d.is_correct).length;
      setTotalCorrect(correct);
      setTotalIncorrect(incorrect);

      const topicMap = {};
      history.forEach((d) => {
        if (!topicMap[d.topic]) topicMap[d.topic] = { correct: 0, total: 0 };
        topicMap[d.topic].total += 1;
        if (d.is_correct) topicMap[d.topic].correct += 1;
      });

      const diffCounts = { 2: 0, 3: 0, 4: 0, 5: 0 };
      Object.values(topicMap).forEach((t) => {
        const acc = (t.correct / t.total) * 100;
        let diff = 2;
        if (acc >= 90) diff = 5;
        else if (acc >= 80) diff = 4;
        else if (acc >= 70) diff = 3;
        diffCounts[diff] += 1;
      });
      setDifficultyCounts(diffCounts);
    });
  }, []);

  const groupedData = data.reduce((acc, entry) => {
    const key = entry.timestamp;
    if (!acc[key]) acc[key] = { topic: entry.topic, correct: 0, total: 0, timestamp: entry.timestamp };
    acc[key].total += 1;
    if (entry.is_correct) acc[key].correct += 1;
    return acc;
  }, {});

  const accuracyPoints = Object.values(groupedData).map((quiz) => ({
    date: new Date(quiz.timestamp).toLocaleDateString(),
    accuracy: Math.round((quiz.correct / quiz.total) * 100),
  }));

  const accuracyData = {
    labels: accuracyPoints.map((d) => d.date),
    datasets: [{
      label: "Accuracy (%)",
      data: accuracyPoints.map((d) => d.accuracy),
      borderColor: "#0071e3",
      backgroundColor: "rgba(0, 113, 227, 0.1)",
      tension: 0.4,
      borderWidth: 3,
      pointBackgroundColor: "#0071e3",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7,
    }],
  };

  const topicCounts = data.reduce((acc, cur) => {
    acc[cur.topic] = (acc[cur.topic] || 0) + 1;
    return acc;
  }, {});

  const topicData = {
    labels: Object.keys(topicCounts),
    datasets: [{
      data: Object.values(topicCounts),
      backgroundColor: [
        "rgba(0, 113, 227, 0.8)",
        "rgba(52, 199, 89, 0.8)",
        "rgba(255, 204, 0, 0.8)",
        "rgba(255, 59, 48, 0.8)",
        "rgba(175, 82, 222, 0.8)",
        "rgba(255, 149, 0, 0.8)"
      ],
      borderWidth: 0,
    }]
  };

  const correctIncorrectData = {
    labels: ["Correct", "Incorrect"],
    datasets: [{
      data: [totalCorrect, totalIncorrect],
      backgroundColor: ["rgba(52, 199, 89, 0.8)", "rgba(255, 59, 48, 0.8)"],
      borderWidth: 0,
    }]
  };

  const difficultyData = {
    labels: ["2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [{
      label: "Number of Topics",
      data: [difficultyCounts[2], difficultyCounts[3], difficultyCounts[4], difficultyCounts[5]],
      backgroundColor: [
        "rgba(255, 204, 0, 0.8)",
        "rgba(52, 199, 89, 0.8)",
        "rgba(255, 149, 0, 0.8)",
        "rgba(175, 82, 222, 0.8)"
      ],
      borderRadius: 8,
      borderWidth: 0,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          padding: 15,
          font: { size: 13, family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
          usePointStyle: true,
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div style={{ padding: "0" }}>
      <h2 style={{
        fontSize: "2.5rem",
        fontWeight: "700",
        marginBottom: "32px",
        letterSpacing: "-0.02em",
        color: "#1d1d1f"
      }}>
        📊 Quiz Analytics
      </h2>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))",
        gap: "24px",
        marginTop: "24px"
      }}>
        <div style={{
          background: "#fff",
          padding: "28px",
          borderRadius: "20px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          border: "1px solid #d2d2d7",
          transition: "all 0.3s ease"
        }}>
          <h4 style={{
            fontSize: "1.3rem",
            marginBottom: "20px",
            color: "#1d1d1f",
            fontWeight: "600"
          }}>Accuracy Over Time</h4>
          <Line data={accuracyData} options={chartOptions} />
        </div>

        <div style={{
          background: "#fff",
          padding: "28px",
          borderRadius: "20px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          border: "1px solid #d2d2d7",
          transition: "all 0.3s ease"
        }}>
          <h4 style={{
            fontSize: "1.3rem",
            marginBottom: "20px",
            color: "#1d1d1f",
            fontWeight: "600"
          }}>Topic Distribution</h4>
          <Pie data={topicData} options={{ ...chartOptions, scales: undefined }} />
        </div>

        <div style={{
          background: "#fff",
          padding: "28px",
          borderRadius: "20px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          border: "1px solid #d2d2d7",
          transition: "all 0.3s ease"
        }}>
          <h4 style={{
            fontSize: "1.3rem",
            marginBottom: "20px",
            color: "#1d1d1f",
            fontWeight: "600"
          }}>Performance Summary</h4>
          <Pie data={correctIncorrectData} options={{ ...chartOptions, scales: undefined }} />
        </div>

        <div style={{
          background: "#fff",
          padding: "28px",
          borderRadius: "20px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          border: "1px solid #d2d2d7",
          transition: "all 0.3s ease"
        }}>
          <h4 style={{
            fontSize: "1.3rem",
            marginBottom: "20px",
            color: "#1d1d1f",
            fontWeight: "600"
          }}>Difficulty Distribution</h4>
          <Bar data={difficultyData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default Analytics;