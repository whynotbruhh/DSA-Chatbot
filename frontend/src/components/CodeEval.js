import React, { useState } from "react";
import { sendCodeEval } from "../services/api";

function CodeEval() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("C");
  const [topic, setTopic] = useState("");
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async () => {
    try {
      const res = await sendCodeEval({ mode: "code_eval", user_id: "test_user", topic, language, user_input: code });
      setFeedback(res.data);
    } catch (err) {
      console.error(err);
      setFeedback({ error: "Failed to evaluate code." });
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>💻 Code Evaluation</h2>
      <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter topic" />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="C">C</option>
        <option value="C++">C++</option>
        <option value="Python">Python</option>
      </select>
      <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={10} cols={60} placeholder="Write your code here..."></textarea>
      <br />
      <button onClick={handleSubmit}>Evaluate</button>

      {feedback && (
        <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
          <h3>Feedback:</h3>
          {Object.entries(feedback).map(([key, val]) => (
            <p key={key}><strong>{key}:</strong> {val}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default CodeEval;
