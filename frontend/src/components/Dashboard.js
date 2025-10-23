import React, { useState } from "react";
import Quiz from "./Quiz";
import Chat from "./Chat";
import CodeEval from "./CodeEval";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("quiz");

  const renderTab = () => {
    switch (activeTab) {
      case "quiz":
        return <Quiz />;
      case "chat":
        return <Chat />;
      case "code":
        return <CodeEval />;
      default:
        return <Quiz />;
    }
  };

  return (
    <div>
      <nav style={{ display: "flex", gap: "10px", padding: "10px", borderBottom: "1px solid #ccc" }}>
        <button onClick={() => setActiveTab("quiz")} style={{ fontWeight: activeTab === "quiz" ? "bold" : "normal" }}>Quiz</button>
        <button onClick={() => setActiveTab("chat")} style={{ fontWeight: activeTab === "chat" ? "bold" : "normal" }}>Chatbot</button>
        <button onClick={() => setActiveTab("code")} style={{ fontWeight: activeTab === "code" ? "bold" : "normal" }}>Code Eval</button>
      </nav>

      <div style={{ padding: "20px" }}>
        {renderTab()}
      </div>
    </div>
  );
}

export default Dashboard;
