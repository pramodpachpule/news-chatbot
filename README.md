# News Chatbot

A modern, responsive AI chat interface with retrieval from vector store. News chatbot provides a clean UI similar to Perplexity.ai.

## ✨ Features

- **Real-time AI Responses** - Stream AI responses as they're generated
- **Integrated with knowladge base** - AI searches the vector store for context
- **Conversation Memory** - Maintains context throughout your conversation
- **Responsive Design** - Clean, modern UI that works across devices

## 🏗️ Architecture

News Chatbot follows a client-server architecture:

### Client (Next.js + React)
- Modern React application built with Next.js
- Components for message display, search status, and input handling

### Server (FastAPI + LangGraph)
- Python backend using FastAPI for API endpoints
- LangChain implementation for conversation flow with LLM and Vectorstore
- Integration with vectorstore API for required context


## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Google API key
- Gina API key
- Pinecone API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pramodpachpule/news-chatbot.git
   cd news-chatbot

2. **Set up the server**
   ```bash
   cd server
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt

3. **Configure environment variables**  
   Create a `.env` file in the server directory:
   GOOGLE_API_KEY=your_google_api_key
   JINA_API_KEY=your_jina_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   
4. **Set up the client**
```bash
cd ../client
npm install

## Running the Application

1. **Start the server**
   ```bash
   cd server
   uvicorn app:app --reload

2. **Start the client**
   ```bash
   cd client
   npm run dev

3. **Open your browser and navigate to http://localhost:3000**   

## 🔍 How It Works

1. **User sends a message** through the chat interface
2. **Server retrieve the releated context** from the vectorstore
3. **AI uses that context to answer the user query** 
4. **Response is displayed** back to the client in real-time
5. **Chat history cached** using redis and used for later conversation

## 🙏 Acknowledgments

- Inspired by the UI and functionality of [Perplexity.ai](https://www.perplexity.ai/)
- Built with [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [FastAPI](https://fastapi.tiangolo.com/)
