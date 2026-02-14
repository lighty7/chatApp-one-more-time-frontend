import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIStore } from '../stores';
import socketService from '../services/socket';

export default function AIChatView() {
  const navigate = useNavigate();
  const { preferredModel, fetchModels, fetchPreferredModel } = useAIStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchModels();
    fetchPreferredModel();

    socketService.on('ai-stream', (data) => {
      setStreamingContent(data.fullContent);
    });

    socketService.on('ai-typing', (data) => {
      setIsAITyping(data.isTyping);
    });

    socketService.on('ai-message', (message) => {
      setStreamingContent('');
      setMessages(prev => [...prev, message]);
      setSending(false);
    });

    socketService.on('ai-error', (data) => {
      console.error('AI error:', data.error);
      setIsAITyping(false);
      setStreamingContent('');
      setSending(false);
    });

    socketService.on('ai-stopped', () => {
      setIsAITyping(false);
      setStreamingContent('');
      setSending(false);
    });

    return () => {
      socketService.off('ai-stream');
      socketService.off('ai-typing');
      socketService.off('ai-message');
      socketService.off('ai-error');
      socketService.off('ai-stopped');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage = {
      _id: `user-${Date.now()}`,
      sender: { _id: 'user' },
      content: input.trim(),
      createdAt: new Date().toISOString(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      await socketService.sendAIMessage(input.trim(), messages);
    } catch (error) {
      console.error('Failed to send message:', error);
      setSending(false);
    }
  };

  const handleStop = () => {
    socketService.stopAIMessage();
  };

  return (
    <div className="h-screen flex flex-col bg-bg">
      <header className="bg-surface px-4 py-3 flex items-center gap-3 shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-bg rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h1 className="font-bold">AI Assistant</h1>
          <p className="text-xs text-text-muted">{preferredModel}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingContent && (
          <div className="text-center text-text-muted mt-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-lg font-medium">Chat with AI</p>
            <p className="text-sm mt-2">Ask me anything!</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                msg.isUser
                  ? 'bg-primary text-bg rounded-br-md'
                  : 'bg-surface rounded-bl-md'
              }`}
            >
              <p className="break-words whitespace-pre-wrap">{msg.content}</p>
              <div className={`text-xs mt-1 ${msg.isUser ? 'text-bg/70' : 'text-text-muted'}`}>
                {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[75%] px-4 py-3 rounded-2xl bg-surface rounded-bl-md">
              <p className="break-words whitespace-pre-wrap">{streamingContent}</p>
              <div className="flex gap-1 mt-2">
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {isAITyping && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-surface px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="bg-surface p-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI anything..."
          disabled={sending}
          className="flex-1 px-4 py-2 bg-bg rounded-full text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        {sending ? (
          <button
            type="button"
            onClick={handleStop}
            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-2 bg-primary text-bg rounded-full disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );
}
