import requests

BASE_URL = "http://127.0.0.1:5000"

USER_ID = "test_user"

# -------- Test Chat --------
chat_data = {"mode": "chat", "user_input": "What is a stack?", "user_id": USER_ID}
chat_resp = requests.post(f"{BASE_URL}/dsa", json=chat_data)
print("CHAT RESPONSE:", chat_resp.json())

# -------- Test Quiz (unlocked first topic) --------
quiz_data = {"mode": "quiz", "topic": "Fundamentals of algorithm analysis: Space and time complexity of an algorithm", "user_id": USER_ID}
quiz_resp = requests.post(f"{BASE_URL}/dsa", json=quiz_data)
print("QUIZ RESPONSE:", quiz_resp.json())

# -------- Test Code Eval --------
code_data = {"mode": "code_eval", "topic": "Stack", "language": "C", "user_input": "int main(){return 0;}", "user_id": USER_ID}
code_resp = requests.post(f"{BASE_URL}/dsa", json=code_data)
print("CODE EVAL RESPONSE:", code_resp.json())

# -------- Test Quiz History --------
history_resp = requests.get(f"{BASE_URL}/quiz_history", params={"user_id": USER_ID})
print("QUIZ HISTORY:", history_resp.json())
