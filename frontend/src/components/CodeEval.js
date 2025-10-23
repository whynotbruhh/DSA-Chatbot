import React, { useState } from "react";
import { sendCodeEval } from "../services/api";

function CodeEval() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("C");
  const [topic, setTopic] = useState("");
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim() || !topic.trim()) return;
    try {
      const res = await sendCodeEval({
        mode: "code_eval",
        user_id: "test_user",
        topic,
        language,
        user_input: code,
      });
      setFeedback(res.data);
    } catch (err) {
      console.error(err);
      setFeedback({ error: "Failed to evaluate code." });
    }
  };

  return (
    <div className="codeeval-container">
      <h2 className="codeeval-title">💻 Code Evaluation</h2>

      <div className="codeeval-card">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter topic"
          className="codeeval-input"
        />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="codeeval-select"
        >
          <option value="C">C</option>
          <option value="C++">C++</option>
          <option value="Python">Python</option>
        </select>

        <div className="codeeval-editor-wrapper">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="codeeval-textarea"
            placeholder="Write your code here..."
          />
        </div>

        <button className="codeeval-btn" onClick={handleSubmit}>
          Evaluate
        </button>
      </div>

      {feedback && (
        <div className="codeeval-output">
          <h3>Feedback:</h3>
          {Object.entries(feedback).map(([key, val]) => (
            <div key={key} className="codeeval-output-card">
              <strong>{key}:</strong> <pre>{val}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CodeEval;
