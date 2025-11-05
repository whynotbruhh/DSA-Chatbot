import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/api";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [keywords, setKeywords] = useState([]); // now stores objects { word, index }
  const [showKeywords, setShowKeywords] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null); // ✅ for glowing effect
  const messagesEndRef = useRef(null);
  const messageRefs = useRef([]); // ✅ refs for scrolling

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ✅ Keyword Extractor (multi-word phrases, stopword removal, 3–4 words max)
  const extractKeywords = (text) => {
    const stopwords = [
      "the", "is", "at", "which", "on", "a", "an", "and", "to", "for", "of",
      "in", "with", "that", "me", "my", "your", "you", "are", "was", "were",
      "it", "this", "those", "these", "as", "by", "be", "from", "about", "or",
      "can", "could", "would", "should", "do", "did", "does", "has", "have",
      "had", "like", "please", "give", "show", "write"
    ];

    const phrases = text.split(/,|and|or/gi).map(p => p.trim()).filter(Boolean);
    const extracted = [];

    for (let phrase of phrases) {
      const cleanWords = phrase
        .split(/\s+/)
        .filter(
          w =>
            w.length > 1 &&
            !stopwords.includes(w.toLowerCase()) &&
            isNaN(w)
        )
        .slice(0, 4);

      if (cleanWords.length > 0) {
        const keyPhrase = cleanWords.join(" ");
        extracted.push(keyPhrase);
      }
    }

    return extracted;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    const currentIndex = messages.length;
    setMessages((prev) => [...prev, userMessage]);

    const newKeywords = extractKeywords(input).map((word) => ({
      word,
      index: currentIndex, // ✅ link keyword to message index
    }));
    setKeywords((prev) => [...prev, ...newKeywords]);

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

  // ✅ Enhanced Code Block Detector
  const isCodeBlock = (text) => {
    const codeIndicators = [
      "```", "#include", "int main", "class ", "def ", "public static void main",
      "{", "}", "print(", "return ", ";", "System.out", "cout", "cin"
    ];
    return codeIndicators.some((kw) => text.includes(kw));
  };

  // ✅ Scroll + highlight when keyword clicked
  const handleKeywordClick = (kw) => {
    const latestIndex = [...messages]
      .map((m, i) => (m.sender === "user" && m.text.includes(kw) ? i : -1))
      .filter(i => i !== -1)
      .pop(); // latest user message containing keyword

    if (latestIndex !== undefined && latestIndex !== -1 && messageRefs.current[latestIndex]) {
      messageRefs.current[latestIndex].scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedIndex(latestIndex);
      setTimeout(() => setHighlightedIndex(null), 1000); // glow for 1s
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">🤖 DSA TutorBot</h2>

      {/* ✅ Floating toggle button */}
      <button
        className="keyword-toggle-btn"
        onClick={() => setShowKeywords(!showKeywords)}
        title={showKeywords ? "Hide Keywords" : "Show Keywords"}
      >
        🗝️
      </button>

      {/* ✅ Collapsible Keyword Window */}
      <div className={`keyword-window ${showKeywords ? "open" : "closed"}`}>
        <h4>🗝️ Recent Keywords</h4>
        {keywords.length > 0 ? (
          <ul>
            {keywords.slice(-10).map((k, i) => (
              <li
                key={i}
                onClick={() => handleKeywordClick(k.word)}
                style={{ cursor: "pointer" }}
              >
                {k.word}
              </li>
            ))}
          </ul>
        ) : (
          <p>No keywords yet</p>
        )}
      </div>

      <div className="chat-messages">
        {messages.map((m, i) => (
          <div
            key={i}
            ref={(el) => (messageRefs.current[i] = el)}
            className={`chat-message ${
              m.sender === "user" ? "user-msg" : "bot-msg"
            } ${highlightedIndex === i ? "highlight" : ""}`}
          >
            {isCodeBlock(m.text) ? (
              <pre
                className="code-block"
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
                <code>
                  {m.text.replace(/```/g, "").replace(/\\n/g, "\n").trim()}
                </code>
              </pre>
            ) : (
              m.text
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
