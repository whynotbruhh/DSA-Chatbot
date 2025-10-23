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

      // --- Total Correct / Incorrect ---
      const correct = history.filter((d) => d.is_correct).length;
      const incorrect = history.filter((d) => !d.is_correct).length;
      setTotalCorrect(correct);
      setTotalIncorrect(incorrect);

      // --- Difficulty distribution per topic ---
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

  // --- Group quiz attempts by timestamp ---
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
    datasets: [
      { label: "Accuracy (%)", data: accuracyPoints.map((d) => d.accuracy), borderColor: "blue", backgroundColor: "lightblue", tension: 0.3 },
    ],
  };

  const topicCounts = data.reduce((acc, cur) => {
    acc[cur.topic] = (acc[cur.topic] || 0) + 1;
    return acc;
  }, {});
  const topicData = { labels: Object.keys(topicCounts), datasets: [{ data: Object.values(topicCounts), backgroundColor: ["#36A2EB","#FF6384","#FFCE56","#8BC34A","#FF9800","#9C27B0"] }]};

  const correctIncorrectData = { labels: ["Correct", "Incorrect"], datasets: [{ data: [totalCorrect, totalIncorrect], backgroundColor: ["#36A2EB","#FF6384"] }]};

  const difficultyData = { labels: ["2","3","4","5"], datasets: [{ label: "Number of Topics", data: [difficultyCounts[2],difficultyCounts[3],difficultyCounts[4],difficultyCounts[5]], backgroundColor: ["#FFCE56","#8BC34A","#FF9800","#9C27B0"] }]};

  const gridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginTop: "20px" };
  const cardStyle = { background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Quiz Analytics</h2>
      <div style={gridStyle}>
        <div style={cardStyle}><h4>Accuracy (%)</h4><Line data={accuracyData} /></div>
        <div style={cardStyle}><h4>Topic Distribution</h4><Pie data={topicData} /></div>
        <div style={cardStyle}><h4>Total Correct / Incorrect</h4><Pie data={correctIncorrectData} /></div>
        <div style={cardStyle}><h4>Difficulty Distribution</h4><Bar data={difficultyData} /></div>
      </div>
    </div>
  );
}

export default Analytics;
