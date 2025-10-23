// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Quiz from "./components/Quiz";
import History from "./components/History";
import Analytics from "./components/Analytics";
import Chat from "./components/Chat";
import CodeEval from "./components/CodeEval";

function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
          <ul style={{ display: "flex", gap: "20px", listStyle: "none", margin: 0, padding: 0 }}>
            <li>
              <Link to="/">Quiz</Link>
            </li>
            <li>
              <Link to="/chat">Chatbot</Link>
            </li>
            <li>
              <Link to="/code">Code Eval</Link>
            </li>
            <li>
              <Link to="/history">History</Link>
            </li>
            <li>
              <Link to="/analytics">Analytics</Link>
            </li>
          </ul>
        </nav>

        <div style={{ padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Quiz />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/code" element={<CodeEval />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
