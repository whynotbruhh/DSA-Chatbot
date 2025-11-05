import React, { useEffect, useState, useRef } from "react";
import { fetchQuizTopics, sendQuizRequest, submitQuizAnswers } from "../services/api";

function Quiz() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitMsg, setSubmitMsg] = useState("");
  const [error, setError] = useState("");
  const [difficulty, setDifficulty] = useState(null); // ✅ new state for difficulty

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
    setDifficulty(null);
    try {
      const res = await sendQuizRequest({
        mode: "quiz",
        user_id: "test_user",
        topic,
      });

      console.log("Quiz API Full Response:", res.data); // Debugging

      if (res.data.error) {
        setError(res.data.error);
        setQuestions([]);
      } else {
        // ✅ Adjust if backend nests difficulty inside response
        const responseData = res.data.response ? res.data.response : res.data;
        setQuestions(responseData.questions || []);
        setDifficulty(responseData.difficulty || null); // ✅ store difficulty
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
        setDifficulty(null);
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

  const getButtonClass = (status) => {
    switch (status) {
      case "Retake Quiz":
        return "retake-btn";
      case "Take Quiz":
        return "take-btn";
      case "Locked":
        return "locked-btn";
      default:
        return "";
    }
  };

  // ✅ Render stars for difficulty
  const renderStars = (level) => {
    if (!level) return null;
    const filled = "⭐".repeat(level);
    const empty = "☆".repeat(5 - level);
    return (
      <div className="difficulty-stars">
        {filled}
        {empty}
      </div>
    );
  };

  return (
    <div className="quiz-container">
      {/* === Header Section === */}
      <div ref={topSectionRef} className="quiz-header">
        <div className="quiz-header-top">
          <h2>🧩 Take a Quiz</h2>
        </div>

        <div>
          {topics.map((t, i) => (
            <div key={i} className="quiz-topic">
              <span>{t.topic}</span>
              <button
                className={getButtonClass(t.status)}
                onClick={() => handleFetchQuiz(t.topic)}
                disabled={t.status === "Locked"}
              >
                {t.status}
              </button>
            </div>
          ))}
        </div>

        {/* ✅ Difficulty Display Below Topics */}
        {difficulty && (
          <div className="difficulty-section">
            <h4>Difficulty:</h4>
            {renderStars(difficulty)}
          </div>
        )}
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* === Quiz Questions === */}
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
