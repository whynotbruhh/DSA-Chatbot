import React, { useEffect, useState, useRef } from "react";
import { fetchQuizTopics, sendQuizRequest, submitQuizAnswers } from "../services/api";

function Quiz() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitMsg, setSubmitMsg] = useState("");
  const [error, setError] = useState("");

  const questionSectionRef = useRef(null);
  const topSectionRef = useRef(null);

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
        setTimeout(() => {
          questionSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 200);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch quiz.");
    }
  };

  const handleCheckboxChange = (qIndex, option) =>
    setAnswers((prev) => ({ ...prev, [qIndex]: option }));

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
        loadTopics();
        setTimeout(() => {
          topSectionRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 200);
      }
    } catch (err) {
      console.error(err);
      setSubmitMsg("Failed to submit quiz.");
    }
  };

  return (
    <div className="quiz-container">
      <div ref={topSectionRef}>
        <h2>🧩 Take a Quiz</h2>
        <div>
          {topics.map((t, i) => (
            <div key={i} className="quiz-topic">
              <span>{t.topic}</span>
              <button
                onClick={() => handleFetchQuiz(t.topic)}
                disabled={t.status === "Locked"}
              >
                {t.status}
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div ref={questionSectionRef}>
        <ul>
          {questions.map((q, i) => (
            <li key={i} className="quiz-question">
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
          <button className="submit-btn" onClick={handleSubmitQuiz}>
            Submit Quiz
          </button>
        )}
        {submitMsg && <p style={{ color: "green" }}>{submitMsg}</p>}
      </div>
    </div>
  );
}

export default Quiz;
