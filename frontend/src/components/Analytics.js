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

  const accuracyData = {
    labels: data.map((d) => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: "Accuracy (%)",
        data: data.map((d) => (d.is_correct ? 100 : 0)),
        borderColor: "blue",
        backgroundColor: "lightblue",
      },
    ],
  };

  const topicCounts = data.reduce((acc, cur) => {
    acc[cur.topic] = (acc[cur.topic] || 0) + 1;
    return acc;
  }, {});
  const topicData = {
    labels: Object.keys(topicCounts),
    datasets: [
      {
        data: Object.values(topicCounts),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#8BC34A", "#FF9800", "#9C27B0"],
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
