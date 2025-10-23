import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

export const fetchQuizHistory = (user_id = "test_user") =>
  API.get("/quiz_history", { params: { user_id } });

export const sendQuizRequest = (data) =>
  API.post("/dsa", data);

export const submitQuizAnswers = (data) =>
  API.post("/dsa", data);

export const sendChatMessage = (data) =>
  API.post("/dsa", data);

export const sendCodeEval = (data) =>
  API.post("/dsa", data);

// -------- New API: fetch all topics with status --------
export const fetchQuizTopics = (user_id = "test_user") =>
  API.get("/quiz_topics", { params: { user_id } });
