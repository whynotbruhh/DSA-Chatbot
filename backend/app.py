from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
import requests
import re
import time
import os  # <-- ADDED
from dotenv import load_dotenv  # <-- ADDED

load_dotenv()  # <-- ADDED

app = Flask(__name__)
CORS(app)

# -------- OpenRouter / GPT-3.5 Turbo Configuration --------
OPENROUTER_KEY = os.getenv("OPENROUTER_KEY")  # <-- CHANGED
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

DB_PATH = "models/progress.db"

# -------- Predefined Quiz Sequence --------
QUIZ_SEQUENCE = [
    "Fundamentals of algorithm analysis: Space and time complexity of an algorithm",
    "Types of asymptotic notations and orders of growth",
    "Algorithm efficiency, best case, worst case, average case",
    "Analysis of non-recursive and recursive algorithms",
    "Asymptotic analysis for recurrence relation: Iteration Method",
    "Substitution Method, Master Method",
    "Recursive Tree Method",
    "Arrays: 1D and 2D array",
    "Stack",
    "Applications of stack: Expression Evaluation, Conversion of Infix to postfix and prefix expression",
    "Tower of Hanoi",
    "Queue, Types of Queue: Circular Queue, Double Ended Queue (deQueue), Applications",
    "List: Singly linked lists, Doubly linked lists, Circular linked lists",
    "Applications: Polynomial Manipulation"
]

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# -------- Initialize DB if not exists --------
def initialize_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_progress (
        user_id TEXT,
        topic TEXT,
        module TEXT,
        correct_answers INTEGER,
        incorrect_answers INTEGER,
        total_time INTEGER,
        accuracy REAL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_doubts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        question TEXT,
        response TEXT,
        detected_topic TEXT,
        complexity TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        topic TEXT,
        question TEXT,
        user_answer TEXT,
        correct_answer TEXT,
        is_correct INTEGER,
        time_spent_seconds INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_code_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        topic TEXT,
        language TEXT,
        code TEXT,
        syntax_errors TEXT,
        logic_feedback TEXT,
        time_complexity TEXT,
        space_complexity TEXT,
        suggestion TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    conn.commit()
    conn.close()

initialize_db()

# -------- Helpers --------
def calculate_difficulty(accuracy):
    if accuracy >= 90:
        return 5
    elif accuracy >= 80:
        return 4
    elif accuracy >= 70:
        return 3
    else:
        return 2

def get_unlocked_quiz_index(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(DISTINCT topic) AS completed FROM user_progress WHERE user_id = ?", (user_id,))
    result = cursor.fetchone()
    conn.close()
    return result["completed"] if result else 0

# -------- LLM Request Handler --------
def generate_llm_response(mode, user_input=None, topic=None, language=None):
    try:
        if mode == "chat":
            prompt = f"""
            You are a DSA TutorBot.
            Mode: chat
            User Question: {user_input}
            Respond only in strict JSON:
            {{
                "detected_topic": "...",
                "response": "...",
                "complexity": "..."
            }}
            """
        elif mode == "quiz":
            prompt = f"""
            You are a DSA TutorBot.
            Mode: quiz
            Topic: {topic}
            Respond only in strict JSON:
            {{
                "topic": "...",
                "questions": [
                    {{"question": "...", "options": ["...", "..."], "answer": "..."}}
                ]
            }}
            """
        elif mode == "code_eval":
            prompt = f"""
            You are a DSA TutorBot.
            Mode: code_eval
            Topic: {topic}
            Language: {language}
            Code: {user_input}
            Respond only in strict JSON:
            {{
                "syntax_errors": "...",
                "logic_feedback": "...",
                "time_complexity": "...",
                "space_complexity": "...",
                "suggestion": "..."
            }}
            """
        else:
            return {"error": "Invalid mode"}

        headers = {"Authorization": f"Bearer {OPENROUTER_KEY}", "Content-Type": "application/json"}
        payload = {"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": prompt}], "temperature": 0}

        r = requests.post(OPENROUTER_URL, headers=headers, json=payload)
        if r.status_code != 200:
            return {"error": f"API call failed with status {r.status_code}"}

        raw_text = r.json()["choices"][0]["message"]["content"]
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)
        return json.loads(match.group()) if match else {"raw_response": raw_text}

    except Exception as e:
        print("LLM Error:", e)
        return {"error": "LLM failed or returned invalid JSON"}

# -------- API: /dsa --------
@app.route("/dsa", methods=["POST"])
def handle_dsa():
    data = request.json
    mode = data.get("mode")
    user_input = data.get("user_input")
    topic = data.get("topic")
    language = data.get("language")
    user_id = data.get("user_id", "default_user")

    # Sequential unlock logic
    if mode == "quiz":
        unlocked_index = get_unlocked_quiz_index(user_id)
        allowed_topic = QUIZ_SEQUENCE[unlocked_index] if unlocked_index < len(QUIZ_SEQUENCE) else None
        if topic not in QUIZ_SEQUENCE:
            return jsonify({"error": "Invalid topic"})
        topic_index = QUIZ_SEQUENCE.index(topic)
        if topic_index > unlocked_index:
            return jsonify({"error": "Quiz locked. Complete previous quiz first.", "unlocked_topic": allowed_topic})

    start_time = time.time()

    # -------- Handle quiz submission --------
    if mode == "quiz_submit" and "answers" in data:
        answers = data["answers"]
        conn = get_db_connection()
        cursor = conn.cursor()

        # Get the last generated questions for this topic
        cursor.execute("""
            SELECT question, correct_answer FROM user_quiz_attempts
            WHERE user_id = ? AND topic = ? AND correct_answer IS NOT NULL
            ORDER BY id ASC
        """, (user_id, topic))
        rows = cursor.fetchall()

        correct_count = 0
        incorrect_count = 0

        # Record answers
        for q_index, user_ans in answers.items():
            if int(q_index) < len(rows):
                question_text = rows[int(q_index)]["question"]
                correct_answer = rows[int(q_index)]["correct_answer"]
                is_correct = 1 if user_ans == correct_answer else 0
                if is_correct:
                    correct_count += 1
                else:
                    incorrect_count += 1
                cursor.execute("""
                    INSERT INTO user_quiz_attempts (user_id, topic, question, user_answer, correct_answer, is_correct, time_spent_seconds)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (user_id, topic, question_text, user_ans, correct_answer, is_correct, 0))

        total_questions = correct_count + incorrect_count
        accuracy = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        difficulty = calculate_difficulty(accuracy)

        # Update progress (replace if already exists)
        cursor.execute("DELETE FROM user_progress WHERE user_id = ? AND topic = ?", (user_id, topic))
        cursor.execute("""
            INSERT INTO user_progress (user_id, topic, module, correct_answers, incorrect_answers, total_time, accuracy)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (user_id, topic, "Module 1", correct_count, incorrect_count, 0, accuracy))

        conn.commit()
        conn.close()

        return jsonify({
            "message": "Quiz submitted successfully",
            "correct_answers": correct_count,
            "incorrect_answers": incorrect_count,
            "accuracy": accuracy,
            "difficulty": difficulty
        })

    # -------- For quiz/chat/code modes --------
    response_json = generate_llm_response(mode, user_input, topic, language)
    end_time = time.time()
    time_spent = int(end_time - start_time)

    conn = get_db_connection()
    cursor = conn.cursor()
    if mode == "chat" and "detected_topic" in response_json:
        cursor.execute("""
            INSERT INTO user_doubts (user_id, question, response, detected_topic, complexity)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, user_input, response_json.get("response", ""), response_json.get("detected_topic", ""), response_json.get("complexity", "")))
    elif mode == "quiz" and "questions" in response_json:
        for q in response_json["questions"]:
            cursor.execute("""
                INSERT INTO user_quiz_attempts (user_id, topic, question, correct_answer, time_spent_seconds)
                VALUES (?, ?, ?, ?, ?)
            """, (user_id, topic, q.get("question", ""), q.get("answer", ""), time_spent))
    elif mode == "code_eval" and "syntax_errors" in response_json:
        cursor.execute("""
            INSERT INTO user_code_attempts (user_id, topic, language, code, syntax_errors, logic_feedback,
                                            time_complexity, space_complexity, suggestion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, topic, language, user_input, response_json.get("syntax_errors", ""),
              response_json.get("logic_feedback", ""), response_json.get("time_complexity", ""),
              response_json.get("space_complexity", ""), response_json.get("suggestion", "")))

    conn.commit()
    conn.close()
    return jsonify(response_json)

# -------- New Endpoint: /quiz_topics --------
@app.route("/quiz_topics", methods=["GET"])
def quiz_topics():
    user_id = request.args.get("user_id", "default_user")
    unlocked_index = get_unlocked_quiz_index(user_id)
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT topic FROM user_progress WHERE user_id = ?", (user_id,))
    completed_topics = [row["topic"] for row in cursor.fetchall()]
    conn.close()

    topics_status = []
    for i, t in enumerate(QUIZ_SEQUENCE):
        if t in completed_topics:
            status = "Retake Quiz"
        elif i == unlocked_index:
            status = "Take Quiz"
        else:
            status = "Locked"
        topics_status.append({"topic": t, "status": status})

    return jsonify({"topics": topics_status})

# -------- Existing Endpoint: /quiz_history --------
@app.route("/quiz_history", methods=["GET"])
def get_quiz_history():
    user_id = request.args.get("user_id", "default_user")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT topic, question, user_answer, correct_answer, is_correct, time_spent_seconds, timestamp
        FROM user_quiz_attempts
        WHERE user_id = ? AND is_correct IS NOT NULL
        ORDER BY timestamp DESC
    """, (user_id,))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({"history": rows})

if __name__ == "__main__":
    app.run(debug=True)