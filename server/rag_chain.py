import os
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.embeddings import JinaEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from pinecone import Pinecone, ServerlessSpec
from utils import fetch_news_articles
from redis_client import get_chat_history
from langchain_pinecone import PineconeVectorStore
# Load environment variables
load_dotenv()

# Initialize Jina Embeddings (for converting text to vectors)
embeddings = JinaEmbeddings(
    model_name="jina-clip-v2",  # Using Jina's CLIP model for embeddings
    use_api=True,               # Using API mode instead of local model
    jina_api_key=os.getenv("JINA_API_KEY")  # Get API key from .env
)

# Initialize Pinecone client for vector database
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = "topnews2"  # Name of our vector index

# Create Pinecone index if it doesn't exist
if index_name not in pc.list_indexes().names():
    # Configure index with optimal settings
    pc.create_index(
        name=index_name,
        dimension=1024,         # Must match Jina embedding dimension
        metric="cosine",        # Best for semantic similarity
        spec=ServerlessSpec(
            cloud="aws",        # Using AWS cloud
            region="us-east-1"  # US East region
        ) 
    )
    print('Creating new Pinecone index...')
    
    # Fetch and index news articles
    documents = fetch_news_articles()
    print(f'Indexing {len(documents)} news articles...')
    
    # Initialize vector store with documents
    # Note: Actual implementation depends on your PineconeVectorStore class
    vectorstore = PineconeVectorStore.from_documents(
        documents,
        index_name=index_name,
        embedding=embeddings
    )
    print('Vector store created successfully')

# Initialize the index for querying
index = pc.Index(index_name)
print('Vector store ready for queries')

def retriever(query: str, k: int = 5) -> str:
    """
    Retrieve relevant news context for a query.
    
    Args:
        query: User's question
        k: Number of relevant chunks to return
        
    Returns:
        Combined relevant text chunks
    """
    # Convert query to vector embedding
    q_vec = embeddings.embed_query(query)
    
    # Query Pinecone index
    query_results = index.query(
        top_k=k,
        vector=q_vec,
        include_metadata=True  # Need metadata for source text
    )
    
    # Extract and combine the relevant text chunks
    contexts = [x.metadata['text'] for x in query_results.matches]
    return "\n\n".join(contexts)  # Combine with double newlines

def get_answer(query: str, session_id: str) -> str:
    """
    Generate answer using RAG pipeline with chat history.
    
    Args:
        query: User's question
        session_id: For retrieving chat history
        
    Returns:
        Generated answer from Gemini
    """
    # Get recent chat history (last 3 messages)
    chat_history = get_chat_history(session_id)
    chat_str = "\n".join(
        f"{m.role.capitalize()}: {m.content}" 
        for m in chat_history[-3:]  # Limit history to prevent overload
    )
    
    # Retrieve relevant news context
    context = retriever(query)
    
    # Improved prompt template
    prompt_template = """You are a helpful AI news assistant. Answer the question 
    based only on the following context and chat history. Be concise (3-5 sentences) 
    and factual. If unsure, say "I couldn't find recent information on this."

    Previous conversation:
    {chat_str}

    Relevant news context:
    {context}

    Question: {question}

    Helpful answer:"""
    
    prompt = ChatPromptTemplate.from_template(prompt_template)
    
    # Initialize Gemini with optimized settings
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",  # Fast and cost-effective model
        temperature=0.3,           # Slightly creative but mostly factual
        max_retries=2              # Retry failed requests
    )
    
    # Chain the components together
    chain = prompt | llm
    
    # Generate and return response
    return chain.invoke({
        "chat_str": chat_str,
        "context": context,
        "question": query
    }).content