"use client" 

import Header from '@/components/Header';
import InputBar from '@/components/InputBar';
import MessageArea from '@/components/MessageArea';
import React, { useState, useEffect } from 'react';


interface Message {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

const Home = () => {
  // State for chat messages with Message type array
  const [messages, setMessages] = useState<Message[]>([]);
  
  // State for loading status (boolean primitive instead of Boolean object)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for session ID
  const [sessionId, setSessionId] = useState<string>('');  // Changed String to string

  /**
   * Initialize session from localStorage or create new one
   * Runs only once on component mount (empty dependency array)
   */
  useEffect(() => {
    // Check for existing session in localStorage
    const storedSessionId = localStorage.getItem('newsChatSessionId');
    
    if (storedSessionId) {
      setSessionId(storedSessionId);
      fetchChatHistory(storedSessionId); // Load existing chat history
    } else {
      const newSessionId = generateSessionId();
      localStorage.setItem('newsChatSessionId', newSessionId);
      setSessionId(newSessionId); // Start new session
    }
  }, []);

 
  const generateSessionId = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

 
  const fetchChatHistory = async (sessionId: string): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:8000/history/${sessionId}`);
      
      if (response.ok) {
        const history: Message[] = await response.json();
        setMessages(history); // Update state with chat history
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen py-8 px-4">
      {/* Main chat container with fixed dimensions and styling */}
      <div className="w-[70%] bg-white flex flex-col rounded-xl shadow-lg border border-gray-100 overflow-hidden h-[90vh]">
        {/* Header component with session management props */}
        <Header 
          setMessages={setMessages} 
          sessionId={sessionId} 
          setSessionId={setSessionId}
          generateSessionId={generateSessionId}
        />
        
        {/* Message display area with current messages and loading state */}
        <MessageArea messages={messages} isLoading={isLoading}/>
        
        {/* Input component with message submission handling */}
        <InputBar 
          isLoading={isLoading} 
          setIsLoading={setIsLoading} 
          setMessages={setMessages} 
          sessionId={sessionId} 
        />
      </div>
    </div>
  );
};

export default Home;