import React, { useState } from "react";
import { sendChatMessage } from "../services/api";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await sendChatMessage({ mode: "chat", user_input: input, user_id: "test_user" });
      const botResponse = res.data.response || "Sorry, no response.";
      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "bot", text: "Error fetching response." }]);
    }

    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🤖 DSA TutorBot</h2>
      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.sender === "user" ? "right" : "left" }}>
            <p><strong>{m.sender === "user" ? "You" : "Bot"}:</strong> {m.text}</p>
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your question..."
        style={{ width: "70%" }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default Chat;
