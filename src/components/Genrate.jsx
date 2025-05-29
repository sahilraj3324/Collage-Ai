import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'prismjs/themes/prism.css';

// Function to copy text to clipboard
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    // Could add a toast notification here
  });
};

const Genrate = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function sendMessage() {
    if (!currentMessage.trim()) {
      setError("Please enter a message");
      return;
    }
    
    const userMessage = { 
      type: 'user', 
      content: currentMessage, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setLoading(true);
    setError("");
    
    try {
      const Gen = await axios({
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyAykujVMxMkaEbSL-ifeG6gUkN3WMHkMX4",
        method: "post",
        data: { contents: [{ parts: [{ text: currentMessage }] }] },
      });
      
      const aiMessage = {
        type: 'ai',
        content: Gen.data.candidates[0].content.parts[0].text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Collage AI</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">AI Assistant</p>
          </div>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              How can I help you today?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              Ask me anything and I'll do my best to help you. I can assist with writing, analysis, coding, and much more.
            </p>
          </div>
        ) : (
          <div className="px-4 py-6 space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-blue-500 ml-3' 
                      : 'bg-green-500 mr-3'
                  }`}>
                    <span className="text-white font-bold text-sm">
                      {message.type === 'user' ? 'You' : 'AI'}
                    </span>
                  </div>
                  
                  {/* Message Bubble */}
                  <div className={`message-bubble rounded-2xl px-4 py-3 relative group ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}>
                    {/* Copy button for AI messages */}
                    {message.type === 'ai' && (
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        title="Copy response"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                        </svg>
                      </button>
                    )}
                    
                    {message.type === 'user' ? (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                    ) : (
                      <div className="message-content text-sm leading-relaxed">
                        <ReactMarkdown 
                          rehypePlugins={[rehypeHighlight]}
                          components={{
                            // Custom styling for code blocks
                            pre: ({ children, ...props }) => (
                              <div className="code-block-container">
                                <pre {...props} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                                  {children}
                                </pre>
                              </div>
                            ),
                            // Custom styling for inline code
                            code: ({ inline, children, ...props }) => 
                              inline ? (
                                <code {...props} className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">
                                  {children}
                                </code>
                              ) : (
                                <code {...props}>{children}</code>
                              ),
                            // Custom styling for lists
                            ul: ({ children, ...props }) => (
                              <ul {...props} className="list-disc list-inside space-y-1 my-2">
                                {children}
                              </ul>
                            ),
                            ol: ({ children, ...props }) => (
                              <ol {...props} className="list-decimal list-inside space-y-1 my-2">
                                {children}
                              </ol>
                            ),
                            // Custom styling for headings
                            h1: ({ children, ...props }) => (
                              <h1 {...props} className="text-lg font-bold mt-4 mb-2 text-gray-900 dark:text-white">
                                {children}
                              </h1>
                            ),
                            h2: ({ children, ...props }) => (
                              <h2 {...props} className="text-base font-bold mt-4 mb-2 text-gray-900 dark:text-white">
                                {children}
                              </h2>
                            ),
                            h3: ({ children, ...props }) => (
                              <h3 {...props} className="text-sm font-bold mt-3 mb-2 text-gray-900 dark:text-white">
                                {children}
                              </h3>
                            ),
                            // Custom styling for paragraphs
                            p: ({ children, ...props }) => (
                              <p {...props} className="mb-2 text-gray-800 dark:text-gray-200">
                                {children}
                              </p>
                            ),
                            // Custom styling for strong/bold
                            strong: ({ children, ...props }) => (
                              <strong {...props} className="font-semibold text-blue-600 dark:text-blue-400">
                                {children}
                              </strong>
                            ),
                            // Custom styling for emphasis/italic
                            em: ({ children, ...props }) => (
                              <em {...props} className="italic text-green-600 dark:text-green-400">
                                {children}
                              </em>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    <div className={`text-xs mt-2 ${
                      message.type === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Message */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] flex-row space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-green-500 mr-3">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">AI is typing...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message ChatGPT..."
                className="w-full px-4 py-3 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                rows="1"
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={loading || !currentMessage.trim()}
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                currentMessage.trim() && !loading
                  ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              )}
            </button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default Genrate;
