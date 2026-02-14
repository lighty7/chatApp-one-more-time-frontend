import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomsStore, useAuthStore } from '../stores';

export default function RoomView() {
  const { name } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    activeRoom,
    roomMessages,
    setActiveRoom,
    sendMessage,
    fetchRoomMessages,
  } = useRoomsStore();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const roomName = name;
  const currentMessages = roomMessages[roomName] || [];

  useEffect(() => {
    const loadRoom = async () => {
      const { rooms, setActiveRoom: setRoom } = useRoomsStore.getState();
      const room = rooms.find(r => r.name === roomName);
      if (room) {
        setRoom(room);
      } else {
        navigate('/rooms');
      }
    };
    if (roomName) {
      loadRoom();
    }
    return () => {
      useRoomsStore.getState().setActiveRoom(null);
    };
  }, [roomName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  return (
    <div className="flex flex-col h-screen bg-bg">
      <header className="bg-surface px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="font-semibold"># {roomName}</h2>
          {activeRoom?.description && (
            <p className="text-xs text-text-muted">{activeRoom.description}</p>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentMessages.map((msg) => {
          const isMe = msg.sender?.username === user?.username;
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
                {!isMe && (
                  <div className="text-xs text-primary font-medium mb-1">
                    {msg.sender?.displayName || msg.sender?.username}
                  </div>
                )}
                <p className="break-words">{msg.content}</p>
                <div className={`text-xs mt-1 ${isMe ? 'text-bg/70' : 'text-text-muted'}`}>
                  {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="bg-surface p-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message #${roomName}...`}
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
