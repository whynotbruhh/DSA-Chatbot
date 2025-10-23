import React, { useEffect, useState } from "react";
import { fetchQuizHistory } from "../services/api";
import { Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

function Analytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchQuizHistory("test_user").then((res) => setData(res.data.history || []));
  }, []);

  // --- Group quiz attempts by topic and timestamp ---
  const groupedData = data.reduce((acc, entry) => {
    const key = entry.timestamp; // or a quizId if available
    if (!acc[key]) {
      acc[key] = { topic: entry.topic, correct: 0, total: 0, timestamp: entry.timestamp };
    }
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
    datasets: [
      {
        label: "Accuracy (%)",
        data: accuracyPoints.map((d) => d.accuracy),
        borderColor: "blue",
        backgroundColor: "lightblue",
        tension: 0.3,
      },
    ],
  };

  // --- Topic distribution chart ---
  const topicCounts = data.reduce((acc, cur) => {
    acc[cur.topic] = (acc[cur.topic] || 0) + 1;
    return acc;
  }, {});

  const topicData = {
    labels: Object.keys(topicCounts),
    datasets: [
      {
        data: Object.values(topicCounts),
        backgroundColor: [
          "#36A2EB",
          "#FF6384",
          "#FFCE56",
          "#8BC34A",
          "#FF9800",
          "#9C27B0",
        ],
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Quiz Analytics</h2>

      <div style={{ width: "600px", margin: "auto" }}>
        <Line data={accuracyData} />
      </div>

      <h3 style={{ marginTop: "40px" }}>Topic Distribution</h3>
      <div style={{ width: "400px", margin: "auto" }}>
        <Pie data={topicData} />
      </div>
    </div>
  );
}

export default Analytics;
