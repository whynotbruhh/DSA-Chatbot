import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/api";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await sendChatMessage({
        mode: "chat",
        user_input: input,
        user_id: "test_user",
      });
      const botResponse = res.data.response || "Sorry, no response.";
      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error fetching response." },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // ✅ Detect code-like responses
  const isCodeBlock = (text) => {
    return (
      text.includes("#include") ||
      text.includes("int main") ||
      text.includes("class") ||
      text.includes("def ") ||
      text.includes("public static void main") ||
      text.includes("```")
    );
  };

  return (
    <div className="chat-container" style={{ padding: "20px", textAlign: "left" }}>
      <h2 className="chat-title" style={{ color: "#007bff", fontWeight: "bold" }}>
        🤖 DSA TutorBot
      </h2>

      <div
        className="chat-messages"
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "10px",
          height: "400px",
          overflowY: "auto",
          backgroundColor: "#f8faff",
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`chat-message ${m.sender === "user" ? "user-msg" : "bot-msg"}`}
            style={{
              margin: "10px 0",
              padding: "8px",
              borderRadius: "8px",
              background: m.sender === "user" ? "#007bff" : "#e6f0ff",
              color: m.sender === "user" ? "white" : "black",
              whiteSpace: "pre-wrap",
            }}
          >
            {isCodeBlock(m.text) ? (
              <pre
                style={{
                  background: "#1e1e1e",
                  color: "#dcdcdc",
                  padding: "10px",
                  borderRadius: "8px",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  marginTop: "5px",
                }}
              >
                <code>{m.text.replace(/```/g, "").trim()}</code>
              </pre>
            ) : (
              m.text
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div
        className="chat-input-container"
        style={{
          marginTop: "15px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            marginLeft: "10px",
            padding: "10px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
