from models import ChatRequest, ChatResponse
from redis_client import save_message_to_history, get_chat_history, clear_chat_history
from datetime import datetime
from models import Message
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from rag_chain import get_answer

# Initialize FastAPI application
app = FastAPI()

# Configure CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend origin
    allow_credentials=True,                   # Allow cookies/session
    allow_methods=["*"],                      # All HTTP methods
    allow_headers=["*"],                      # All headers
)

@app.get('/')
def home():
    """Health check endpoint"""
    return {'status': 'active', 'service': 'news-chatbot-api'}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Handle chat messages via REST API
    
    Args:
        request (ChatRequest): Contains message content and session ID
        
    Returns:
        ChatResponse: Bot's response with same session ID
    
    Flow:
        1. Save user message to history
        2. Generate bot response using RAG
        3. Save and return bot response
    """
    # Save user message to chat history
    user_message = Message(
        content=request.content,
        role="user",
        timestamp=datetime.now().isoformat()
    )
    save_message_to_history(request.session_id, user_message)

    # Generate response using RAG chain
    bot_response = get_answer(request.content, request.session_id)

    # Save bot response to history
    bot_message = Message(
        content=bot_response,
        role="assistant",
        timestamp=datetime.now().isoformat()
    )
    save_message_to_history(request.session_id, bot_message)

    return ChatResponse(
        content=bot_response,
        session_id=request.session_id
    )

@app.get("/history/{session_id}", response_model=List[Message])
async def get_history(session_id: str):
    """
    Retrieve chat history for a session
       
    Args:
        session_id (str): Unique session identifier
        
    Returns:
        List[Message]: Chronological list of messages
    """
    return get_chat_history(session_id)

@app.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """
    Clear chat history for a session   
    Args:
        session_id (str): Session to clear
        
    Returns:
        dict: Confirmation message
    """
    clear_chat_history(session_id)
    return {"message": "Session cleared successfully"}


if __name__ == "__main__":
    import uvicorn
    # Start server with production-ready settings
    uvicorn.run(
        app,
        host="0.0.0.0",  # Listen on all interfaces
        port=8000,       # Default FastAPI port
        reload=True      # Auto-reload during development
    )