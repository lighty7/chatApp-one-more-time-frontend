import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore, useAuthStore } from '../stores';
import { filesAPI } from '../services/api';

export default function ChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    activeConversation,
    messages,
    typingUsers,
    setActiveConversation,
    sendMessage,
    fetchMessages,
    addMessage,
    markAsRead,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const conversationId = id;
  const currentMessages = messages[conversationId] || [];
  const convTypingUsers = typingUsers[conversationId] || [];

  useEffect(() => {
    const loadConversation = async () => {
      const { conversations, setActiveConversation: setConv } = useChatStore.getState();
      const conv = conversations.find(c => (c._id || c.id) === conversationId);
      if (conv) {
        setConv(conv);
      } else {
        navigate('/chats');
      }
    };
    if (conversationId) {
      loadConversation();
    }
    return () => {
      useChatStore.getState().setActiveConversation(null);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  useEffect(() => {
    if (currentMessages.length > 0) {
      const unread = currentMessages
        .filter(m => !m.sender?.isMe && !m.readBy?.includes(user?.id))
        .map(m => m._id);
      if (unread.length > 0) {
        markAsRead(conversationId, unread);
      }
    }
  }, [currentMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    
    setSending(true);
    try {
      await sendMessage(input.trim());
      setInput('');
    } catch {}
    setSending(false);
  };

  const handleTyping = () => {
    const { typing } = useChatStore.getState();
    typing(conversationId);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      const { stopTyping } = useChatStore.getState();
      stopTyping(conversationId);
    }, 2000);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', conversationId);
      const { data } = await filesAPI.upload(formData);
      await sendMessage(file.name, 'file', data._id || data.id);
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploading(false);
  };

  const getChatName = () => {
    if (!activeConversation) return '';
    if (activeConversation.type === 'group') return activeConversation.name;
    const other = activeConversation.participants?.find(p => !p.isMe);
    return other?.displayName || other?.username || 'Unknown';
  };

  const isGroup = activeConversation?.type === 'group';

  return (
    <div className="flex flex-col h-screen bg-bg">
      <header className="bg-surface px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="font-semibold">{getChatName()}</h2>
          {isGroup && activeConversation?.participants && (
            <p className="text-xs text-text-muted">
              {activeConversation.participants.length} members
            </p>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentMessages.map((msg) => {
          const isMe = msg.sender?.isMe || msg.sender?._id === user?.id || msg.sender?.id === user?.id;
          return (
            <div
              key={msg._id || msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                  isMe
                    ? 'bg-primary text-bg rounded-br-md'
                    : 'bg-surface rounded-bl-md'
                }`}
              >
                {!isMe && !isGroup && (
                  <div className="text-xs text-primary font-medium mb-1">
                    {msg.sender?.displayName || msg.sender?.username}
                  </div>
                )}
                {msg.type === 'file' ? (
                  <a
                    href={msg.attachment?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    {msg.content}
                  </a>
                ) : (
                  <p className="break-words">{msg.content}</p>
                )}
                <div className={`text-xs mt-1 ${isMe ? 'text-bg/70' : 'text-text-muted'}`}>
                  {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        
        {convTypingUsers.length > 0 && (
          <div className="text-sm text-text-muted italic">
            {convTypingUsers.length === 1 ? 'Someone' : `${convTypingUsers.length} people`} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="bg-surface p-3 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 text-text-muted hover:text-primary transition-colors disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-bg rounded-full text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="p-2 bg-primary text-bg rounded-full disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
