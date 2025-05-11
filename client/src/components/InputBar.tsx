import { useState, FormEvent, ChangeEvent } from "react";

// Type definitions for message object
interface Message {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

// Type definitions for component props
interface InputBarProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  sessionId: string;
}

const InputBar = ({ isLoading, setIsLoading, setMessages, sessionId }: InputBarProps) => {
  const [currentMessage, setCurrentMessage] = useState<string>('');

  /**
   * Handles sending a new message:
   * 1. Adds user message to chat
   * 2. Adds temporary assistant placeholder
   * 3. Sends to backend API
   * 4. Updates with actual response or error
   */
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isLoading) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now(),
      content: currentMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    // Create temporary assistant message (loading state)
    const tempAssistantMessage: Message = {
      id: Date.now() + 1,
      content: '',
      role: 'assistant',
      timestamp: new Date().toISOString()
    };

    // Update messages state
    setMessages(prev => [...prev, userMessage, tempAssistantMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {  
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentMessage,
          session_id: sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Replace temporary message with actual response
        setMessages(prev => prev.map(msg => 
          msg.id === tempAssistantMessage.id 
            ? { ...msg, content: data.content }
            : msg
        ));
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Update temporary message with error
      setMessages(prev => prev.map(msg => 
        msg.id === tempAssistantMessage.id 
          ? { ...msg, content: 'Sorry, there was an error processing your request.' }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentMessage(e.target.value);
  };

  return (
    <form className="p-4 bg-white" onSubmit={handleSendMessage}>
      <div className="flex items-center bg-[#F9F9F5] rounded-full p-3 shadow-md border border-gray-200">
        {/* Emoji button placeholder */}
        <button
          type="button"
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </button>

        {/* Message input */}
        <input
          type="text"
          placeholder={isLoading ? "Sending..." : "Type a message"}
          value={currentMessage}
          onChange={handleChange}
          disabled={isLoading}
          className="flex-grow px-4 py-2 bg-transparent focus:outline-none text-gray-700 disabled:opacity-50"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={!currentMessage.trim() || isLoading}
          className="bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 rounded-full p-3 ml-2 shadow-md transition-all duration-200 group disabled:opacity-50"
        >
          <svg className="w-6 h-6 text-white transform rotate-45 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default InputBar;
