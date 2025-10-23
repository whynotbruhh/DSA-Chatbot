import React, { useEffect, useState } from "react";
import { fetchQuizTopics, sendQuizRequest, submitQuizAnswers } from "../services/api";

function Quiz() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitMsg, setSubmitMsg] = useState("");
  const [error, setError] = useState("");

  const loadTopics = async () => {
    try {
      const res = await fetchQuizTopics("test_user");
      setTopics(res.data.topics || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleFetchQuiz = async (topic) => {
    setSelectedTopic(topic);
    setError("");
    setSubmitMsg("");
    try {
      const res = await sendQuizRequest({ mode: "quiz", user_id: "test_user", topic });
      if (res.data.error) {
        setError(res.data.error);
        setQuestions([]);
      } else {
        setQuestions(res.data.questions || []);
        setAnswers({});
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch quiz.");
    }
  };

  const handleCheckboxChange = (qIndex, option) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitMsg("");
    try {
      const res = await submitQuizAnswers({
        mode: "quiz_submit",
        user_id: "test_user",
        topic: selectedTopic,
        answers,
      });
      if (res.data.error) setSubmitMsg(res.data.error);
      else {
        setSubmitMsg("✅ Quiz submitted successfully!");
        setQuestions([]);
        setAnswers({});
        loadTopics(); // refresh topic status after submission
      }
    } catch (err) {
      console.error(err);
      setSubmitMsg("Failed to submit quiz.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🧩 Take a Quiz</h2>

      <div>
        {topics.map((t, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            {t.topic}{" "}
            <button
              onClick={() => handleFetchQuiz(t.topic)}
              disabled={t.status === "Locked"}
            >
              {t.status}
            </button>
          </div>
        ))}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {questions.map((q, i) => (
          <li key={i} style={{ marginBottom: "15px" }}>
            <strong>{q.question}</strong>
            <ul>
              {q.options.map((opt, j) => (
                <li key={j}>
                  <label>
                    <input
                      type="checkbox"
                      checked={answers[i] === opt}
                      onChange={() => handleCheckboxChange(i, opt)}
                    />{" "}
                    {opt}
                  </label>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {questions.length > 0 && (
        <button onClick={handleSubmitQuiz}>Submit Quiz</button>
      )}
      {submitMsg && <p style={{ color: "green" }}>{submitMsg}</p>}
    </div>
  );
}

export default Quiz;
