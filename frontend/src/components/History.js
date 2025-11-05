import React, { useEffect, useState } from "react";
import { fetchQuizHistory } from "../services/api";

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchQuizHistory("test_user").then(res => setHistory(res.data.history || []));
  }, []);

  return (
    <div style={{ padding: "0" }}>
      <h2 style={{
        fontSize: "2.5rem",
        fontWeight: "700",
        marginBottom: "32px",
        letterSpacing: "-0.02em",
        color: "#1d1d1f"
      }}>
        📘 Quiz History
      </h2>
      
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        border: "1px solid #d2d2d7"
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          <thead>
            <tr style={{
              background: "linear-gradient(to right, #f5f5f7, #fbfbfd)",
              borderBottom: "2px solid #d2d2d7"
            }}>
              <th style={headerStyle}>Topic</th>
              <th style={headerStyle}>Your Answer</th>
              <th style={headerStyle}>Correct Answer</th>
              <th style={headerStyle}>Result</th>
              <th style={headerStyle}>Time (s)</th>
              <th style={headerStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} style={{
                borderBottom: "1px solid #e5e5ea",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f7"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={cellStyle}>{h.topic}</td>
                <td style={cellStyle}>{h.user_answer}</td>
                <td style={cellStyle}>{h.correct_answer}</td>
                <td style={cellStyle}>
                  <span style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    background: h.is_correct ? "rgba(52, 199, 89, 0.15)" : "rgba(255, 59, 48, 0.15)",
                    color: h.is_correct ? "#34c759" : "#ff3b30",
                    display: "inline-block"
                  }}>
                    {h.is_correct ? "✅ Correct" : "❌ Incorrect"}
                  </span>
                </td>
                <td style={cellStyle}>{h.time_spent_seconds}</td>
                <td style={cellStyle}>{new Date(h.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {history.length === 0 && (
          <div style={{
            padding: "48px",
            textAlign: "center",
            color: "#6e6e73",
            fontSize: "1.1rem"
          }}>
            No quiz history yet. Start taking quizzes to see your progress!
          </div>
        )}
      </div>
    </div>
  );
}

const headerStyle = {
  padding: "16px 20px",
  textAlign: "left",
  fontSize: "0.95rem",
  fontWeight: "600",
  color: "#1d1d1f",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const cellStyle = {
  padding: "16px 20px",
  fontSize: "1rem",
  color: "#1d1d1f",
  fontWeight: "500"
};

export default History;