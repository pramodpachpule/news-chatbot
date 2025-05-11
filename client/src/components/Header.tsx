import { useState } from 'react';

// Type definitions for component props
interface HeaderProps {
  setMessages: (messages: any[]) => void;  // Callback to clear messages
  sessionId: string;                      // Current session ID
  setSessionId: (id: string) => void;     // Callback to update session ID
  generateSessionId: () => string;        // Function to generate new session ID
}

const Header = ({ 
  setMessages, 
  sessionId, 
  setSessionId, 
  generateSessionId 
}: HeaderProps) => {
  // State for reset loading status and error messages
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles session reset by:
   * 1. Clearing current session on backend
   * 2. Creating new session
   * 3. Resetting local state
   */
  const handleResetSession = async () => {
    setIsResetting(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8000/session/${sessionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to reset session');
      }
      
      // Generate and set new session
      const newSessionId = generateSessionId();
      localStorage.setItem('newsChatSessionId', newSessionId);
      setSessionId(newSessionId);
      setMessages([]); // Clear chat messages
    } catch (error) {
      console.error('Error resetting session:', error);
      setError('Failed to start new chat. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="relative flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#4A3F71] to-[#5E507F] shadow-md">
      {/* App title with decorative element */}
      <div className="flex items-center">
        <div className="w-1.5 h-6 bg-teal-400 rounded-full mr-3 opacity-80"></div>
        <h1 className="font-bold text-white text-xl tracking-tight">News Chatbot</h1>
      </div>

      {/* Reset session button with loading state */}
      <div className="flex items-center gap-2">
        {error && (
          <span className="text-red-300 text-sm mr-2">{error}</span>
        )}
        <button
          onClick={handleResetSession}
          disabled={isResetting}
          className="relative flex items-center text-white bg-white/10 text-sm px-4 py-2 font-medium hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg transition-all duration-200"
          aria-label="Start new chat session"
        >
          {isResetting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              RESETTING...
            </>
          ) : (
            'NEW CHAT'
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;