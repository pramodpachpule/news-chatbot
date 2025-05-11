from upstash_redis import Redis
from typing import List
from models import Message 
from dotenv import load_dotenv
import os
# Initialize Redis client connection
load_dotenv()
redis_client = Redis.from_env()

# Session management functions
def get_chat_history(session_id: str)-> List[Message]:
    """
    Retrieve the complete chat history for a given session from Redis.
    
    Args:
        session_id (str): Unique identifier for the chat session
        
    Returns:
        List[Message]: List of Message objects representing the chat history
    
    Note:
        - Uses Redis LRANGE to get all messages (index 0 to -1)
        - Validates each message JSON against the Message model
        - Returns empty list if no history exists
    """
    # Get all messages from Redis list (from index 0 to last element)
    history = redis_client.lrange(session_id, 0, -1)
    
    # Convert each message JSON string to Message object using model validation
    history = [Message.model_validate_json(msg) for msg in history if history]
    
    return history


def save_message_to_history(session_id: str, message: Message):
    """
    Save a new message to the chat history in Redis.
    
    Args:
        session_id (str): Unique identifier for the chat session
        message (Message): Message object to be stored
        
    Note:
        - Uses Redis RPUSH to append message to the end of the list
        - Automatically serializes Message object to JSON string
        - Messages are stored in chronological order
    """
    # Append message to Redis list after converting to JSON
    redis_client.rpush(session_id, message.model_dump_json())


def clear_chat_history(session_id: str):
    """
    Completely remove all chat history for a specific session.
    
    Args:
        session_id (str): Unique identifier for the chat session to clear
        
    Note:
        - Permanently deletes the Redis key and all associated messages
        - No confirmation is required - use with caution
        - Returns number of keys deleted (1 if existed, 0 if not)
    """
    # Delete the entire message list for this session
    redis_client.delete(session_id)