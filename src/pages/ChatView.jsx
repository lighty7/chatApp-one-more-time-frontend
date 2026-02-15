import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore, useAuthStore } from '../stores';
import { filesAPI } from '../services/api';
import ReactionPicker from '../components/ReactionPicker';
import ReactionBadge from '../components/ReactionBadge';
import { ALLOWED_REACTIONS } from '../constants/reactions';

import { ALLOWED_REACTIONS } from '../constants/reactions';

export default function ChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const {
    activeConversation,
    messages,
    typingUsers,
    sendMessage,
    markAsRead,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const conversationId = id;
  const currentMessages = useMemo(() => messages[conversationId] || [], [messages, conversationId]);
  const convTypingUsers = useMemo(() => typingUsers[conversationId] || [], [typingUsers, conversationId]);

  const currentUserId = user?._id || user?.id;

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
  }, [conversationId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  useEffect(() => {
    if (currentMessages.length > 0 && currentUserId) {
      const unread = currentMessages
        .filter(m => m.sender?._id !== currentUserId && m.sender?.id !== currentUserId)
        .filter(m => !m.readBy?.some(r => r.user === currentUserId))
        .map(m => m._id);
      if (unread.length > 0) {
        markAsRead(conversationId, unread);
      }
    }
  }, [currentMessages, conversationId, markAsRead, currentUserId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    
    setSending(true);
    try {
      await sendMessage(input.trim(), 'text', null, replyTo?._id || null);
      setInput('');
      setReplyTo(null);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    setSending(false);
  };

  const startReply = (message) => {
    setReplyTo(message);
  };

  const cancelReply = () => {
    setReplyTo(null);
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

  const handleReaction = async (messageId, emoji) => {
    const message = currentMessages.find(m => m._id === messageId);
    if (!message) return;
    
    const existingReaction = message.reactions?.find(
      r => r.user?._id === currentUserId || r.user === currentUserId
    );
    
    try {
      if (existingReaction?.emoji === emoji) {
        await useChatStore.getState().removeReaction(messageId, emoji);
      } else {
        await useChatStore.getState().addReaction(messageId, emoji);
      }
    } catch (error) {
      console.error('Failed to handle reaction:', error);
    }
    setShowEmojiPicker(null);
  };

  const toggleEmojiPicker = (messageId) => {
    setShowEmojiPicker(showEmojiPicker === messageId ? null : messageId);
  };

  const getChatName = () => {
    if (!activeConversation) return '';
    if (activeConversation.displayName) return activeConversation.displayName;
    if (activeConversation.type === 'group') return activeConversation.name;
    const other = activeConversation.otherParticipant;
    return other?.displayName || other?.username || 'Unknown';
  };

  const isGroup = activeConversation?.type === 'group';

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this conversation?')) return;
    try {
      await useChatStore.getState().leaveConversation(conversationId);
      navigate('/chats');
    } catch (error) {
      console.error('Failed to leave:', error);
    }
  };

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
        {(isGroup || activeConversation?.type === 'direct') && (
          <button
            onClick={handleLeave}
            className="p-2 text-text-muted hover:text-red-500 transition-colors"
            title="Leave conversation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentMessages.map((msg, index) => {
          const isMe = msg.sender?._id === currentUserId || msg.sender?.id === currentUserId;
          const isRead = msg.readBy?.some(r => r.user !== currentUserId);
          return (
            <div
              key={msg._id || msg.id || `msg-${index}`}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} group relative`}
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
                    {msg.sender ? (msg.sender.displayName || msg.sender.username) : 'Deleted User'}
                  </div>
                )}
                {(msg.replyTo || msg.replyTo?._id) && (
                  <div className="text-xs text-text-muted border-l-2 border-primary/50 pl-2 mb-1">
                    <span className="font-medium">
                      {msg.replyTo?.sender?.displayName || msg.replyTo?.sender?.username || 'Unknown'}
                    </span>
                    <p className="truncate">{msg.replyTo?.content?.slice(0, 30)}</p>
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
                <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-bg/70' : 'text-text-muted'}`}>
                  <span>{msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {isMe && (
                    <span>
                      {isRead ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(
                      msg.reactions.reduce((acc, r) => {
                        const emoji = r.emoji;
                        if (!acc[emoji]) acc[emoji] = [];
                        acc[emoji].push(r.user?._id || r.user);
                        return acc;
                      }, {})
                    ).map(([emoji, users]) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(msg._id, emoji)}
                        className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          users.includes(currentUserId)
                            ? 'bg-primary/30 ring-1 ring-primary'
                            : 'bg-bg/50'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="text-[10px]">{users.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleEmojiPicker(msg._id)}
                className={`absolute -bottom-2 ${isMe ? 'left-8' : 'right-8'} p-1 bg-surface rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => startReply(msg)}
                className={`absolute -bottom-2 ${isMe ? 'left-0' : 'right-0'} p-1 bg-surface rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              {showEmojiPicker === msg._id && (
                <ReactionPicker 
                  onSelect={(emoji) => handleReaction(msg._id, emoji)} 
                  position={isMe ? 'left' : 'right'}
                />
              )}
            </div>
          );
        })}
        
        {convTypingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-surface px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {replyTo && (
        <div className="bg-surface border-t border-bg px-4 py-2 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-text-muted">Replying to</p>
            <p className="text-sm text-text truncate">
              {replyTo.sender?.displayName || replyTo.sender?.username || 'Unknown'}: {replyTo.content?.slice(0, 50)}
            </p>
          </div>
          <button
            type="button"
            onClick={cancelReply}
            className="p-1 text-text-muted hover:text-text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

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
