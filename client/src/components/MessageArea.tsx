import React, { useEffect, useRef } from 'react';


const PremiumTypingAnimation = () => {
    return (
        <div className="flex items-center">
            <div className="flex items-center space-x-1.5">

                <div 
                    className="w-1.5 h-1.5 bg-gray-400/70 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "0ms" }}
                />
                <div 
                    className="w-1.5 h-1.5 bg-gray-400/70 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "300ms" }}
                />
                <div 
                    className="w-1.5 h-1.5 bg-gray-400/70 rounded-full animate-pulse"
                    style={{ animationDuration: "1s", animationDelay: "600ms" }}
                />
            </div>
        </div>
    );
};

/**
 * Props interface for MessageArea component
 */
interface MessageAreaProps {
    messages: Array<{
        content: string;
        role: 'user' | 'assistant';
        timestamp?: string;
    }>;
    isLoading: boolean;
}

const MessageArea = ({ messages, isLoading }: MessageAreaProps) => {
    // Reference to the end of messages container for auto-scrolling
    const messagesEndRef = useRef<HTMLDivElement>(null);

    /**
     * Scrolls to the bottom of the messages container
     * Runs whenever messages or loading state changes
     */
    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    /**
     * Smoothly scrolls to the bottom of the messages container
     */
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div 
            className="flex-grow overflow-y-auto bg-[#FCFCF8] border-b border-gray-100" 
            style={{ minHeight: 0 }}
        >
            <div className="max-w-4xl mx-auto p-6">
                {/* Render each message in the messages array */}
                {messages.map((message, idx) => (
                    <div 
                        key={idx} 
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-5`}
                    >
                        <div className="flex flex-col max-w-md">
                            {/* Message bubble with different styling based on sender */}
                            <div
                                className={`rounded-lg py-3 px-5 ${
                                    message.role === 'user'
                                        ? 'bg-gradient-to-br from-[#5E507F] to-[#4A3F71] text-white rounded-br-none shadow-md'
                                        : 'bg-[#F3F3EE] text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                }`}
                            >
                                {/* Show message content or typing animation if empty */}
                                {message?.content || <PremiumTypingAnimation />}
                            </div>
                        </div>
                    </div>
                ))}
                {/* Invisible element at the bottom for auto-scrolling */}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default MessageArea;