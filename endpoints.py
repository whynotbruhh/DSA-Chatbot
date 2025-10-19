# endpoints.py
from fastapi import APIRouter
from pydantic import BaseModel
import requests
from app_config import OPENROUTER_API_KEY, OPENROUTER_BASE_URL, MODEL_NAME

router = APIRouter()

# In-memory response storage
response_history = []

class QuestionRequest(BaseModel):
    question: str

class CodeEvalRequest(BaseModel):
    code: str
    language: str = "C"
    topic: str = ""

class QuizRequest(BaseModel):
    topic: str = ""

def call_openrouter(prompt: str):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You are a DSA tutor bot. Answer in structured JSON as per the mode."},
            {"role": "user", "content": prompt}
        ]
    }
    try:
        response = requests.post(OPENROUTER_BASE_URL, json=data, headers=headers, timeout=20)
        response.raise_for_status()
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        return content
    except Exception as e:
        return {"error": str(e)}

# /question endpoint
@router.post("/question")
def ask_question(request: QuestionRequest):
    prompt = f"""
    Mode: chat
    Question: {request.question}
    Respond in JSON:
    {{
      "mode": "chat",
      "user_question": "<original question>",
      "detected_topic": "<topic detected by LLM>",
      "response": "<short explanation>",
      "complexity": "<if applicable>"
    }}
    """
    result = call_openrouter(prompt)
    response_history.append(result)
    return result

# /quiz endpoint
@router.post("/quiz")
def generate_quiz(request: QuizRequest):
    topic_text = f"Topic: {request.topic}" if request.topic else "Use pre-entered topic from system."
    prompt = f"""
    Mode: quiz
    {topic_text}
    Generate 3–5 MCQs in JSON format exactly like:
    {{
      "mode": "quiz",
      "topic": "<topic>",
      "questions": [
        {{
          "question": "...",
          "options": ["...","...","...","..."],
          "correct_option": "...",
          "explanation": "..."
        }}
      ]
    }}
    """
    result = call_openrouter(prompt)
    response_history.append(result)
    return result

# /code-eval endpoint
@router.post("/code-eval")
def code_evaluation(request: CodeEvalRequest):
    prompt = f"""
    Mode: code_eval
    Language: {request.language}
    Topic: {request.topic if request.topic else 'Detect topic from code'}
    Code: {request.code}
    Respond in JSON format exactly like:
    {{
      "mode": "code_eval",
      "language": "<language>",
      "topic": "<topic detected>",
      "analysis": {{
        "syntax_errors": "...",
        "logic_feedback": "...",
        "time_complexity": "...",
        "space_complexity": "..."
      }},
      "suggestion": "..."
    }}
    """
    result = call_openrouter(prompt)
    response_history.append(result)
    return result

# Optional: /history endpoint to view stored responses
@router.get("/history")
def get_history():
    return response_history
