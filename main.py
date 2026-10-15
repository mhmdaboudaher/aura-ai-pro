import sys
import io
from fastapi import FastAPI
from agent import run_agent

# ضبط الترميز لدعم جميع النصوص والحروف العربية
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

app = FastAPI()

@app.get("/")
def read_root():
    return {"status": "Server is running"}

@app.post("/chat")
def chat(request: dict):
    print("Received request:", request)
    user_message = request.get("message", "")
    history = request.get("history", [])
    
    response = run_agent(user_message, history)
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8008)