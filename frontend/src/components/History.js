import React, { useEffect, useState } from "react";
import { fetchQuizHistory } from "../services/api";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchQuizHistory("test_user").then((res) => setHistory(res.data.history || []));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📘 Quiz History</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Topic</th>
            <th>User Answer</th>
            <th>Correct Answer</th>
            <th>Correct?</th>
            <th>Time Spent (s)</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i}>
              <td>{h.topic}</td>
              <td>{h.user_answer}</td>
              <td>{h.correct_answer}</td>
              <td>{h.is_correct ? "✅" : "❌"}</td>
              <td>{h.time_spent_seconds}</td>
              <td>{new Date(h.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;
