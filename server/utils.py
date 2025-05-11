import feedparser
from bs4 import BeautifulSoup
import requests
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from typing import List

def fetch_news_articles(limit: int = 100) -> List[Document]:
    """Fetch news articles from RSS feed and chunk them with contextual awareness.
    
    Args:
        limit: Maximum number of articles to fetch
        
    Returns:
        List of Document objects with chunked content and metadata
    """
    rss_url = "https://timesofindia.indiatimes.com/rssfeedstopstories.cms"
    
    # Configure text splitter with parameters that preserve context
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]  # Try to split at paragraph boundaries first
    )
    
    feed = feedparser.parse(rss_url)
    documents = []
    
    for entry in feed.entries[:limit]:
        try:
            title = entry.title
            link = entry.link
            published = entry.published
            summary = entry.summary
            
            # Fetch article content
            response = requests.get(link, timeout=10)
            response.raise_for_status()  # Raise exception for bad status codes
            
            soup = BeautifulSoup(response.content, "html.parser")
            article_element = soup.find('div', class_="_s30J clearfix")
            
            if not article_element:
                continue
                
            article_full_text = article_element.get_text(separator="\n", strip=True)
            
            # Create a structured document with clear sections
            structured_content = f"""
            ARTICLE TITLE: {title}
            PUBLISH DATE: {published}
            
            SUMMARY:
            {summary}
            
            FULL CONTENT:
            {article_full_text}
            """
            
            # Clean up excessive whitespace
            structured_content = "\n".join([line.strip() for line in structured_content.splitlines() if line.strip()])
            
            # Split the content while trying to preserve context
            chunks = text_splitter.split_text(structured_content)
            
            metadata = {
                "title": title,
                "link": link,
                "published": published,
            }
            
            for i, chunk in enumerate(chunks):
                # Add chunk-specific metadata
                chunk_metadata = metadata.copy()
                chunk_metadata["chunk_number"] = i + 1
                chunk_metadata["total_chunks"] = len(chunks)
                
                documents.append(Document(
                    page_content=chunk, 
                    metadata=chunk_metadata
                ))
                
        except Exception as e:
            print(f"Error processing article {link}: {str(e)}")
            continue
          
    return documents