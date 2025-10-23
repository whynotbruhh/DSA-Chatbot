import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Quiz from "./components/Quiz";
import History from "./components/History";
import Analytics from "./components/Analytics";
import Chat from "./components/Chat";
import CodeEval from "./components/CodeEval";
import "./App.css";

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {collapsed ? "☰" : "⮜"}
          </button>
          <nav className="sidebar-links">
            <Link to="/" className="sidebar-link">Quiz</Link>
            <Link to="/chat" className="sidebar-link">Chatbot</Link>
            <Link to="/code" className="sidebar-link">Code Eval</Link>
            <Link to="/history" className="sidebar-link">History</Link>
            <Link to="/analytics" className="sidebar-link">Analytics</Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className={`content ${collapsed ? "expanded" : ""}`}>
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
