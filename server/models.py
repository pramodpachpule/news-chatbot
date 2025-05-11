from pydantic import BaseModel
from datetime import datetime
from typing import Literal

class Message(BaseModel):
    """
    Represents a single message in the chat system.
    
    Attributes:
        content (str): The text content of the message
        role (Literal['user', 'assistant']): The sender role (user or assistant)
        timestamp (str): ISO 8601 formatted timestamp of when message was created
    """
    content: str
    role: Literal['user', 'assistant']  # Strictly only these two values allowed
    timestamp: str

class ChatRequest(BaseModel):
    """
    Request model for chat endpoint.
    
    Attributes:
        content (str): User's message content
        session_id (str): Unique identifier for the chat session
    """
    content: str
    session_id: str

class ChatResponse(BaseModel):
    """
    Response model for chat endpoint.
    
    Attributes:
        content (str): Assistant's response content
        session_id (str): Same session ID from the request
    """
    content: str
    session_id: str
