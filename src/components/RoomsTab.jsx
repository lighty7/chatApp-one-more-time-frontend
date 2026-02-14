import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomsStore } from '../stores';

export default function RoomsTab() {
  const navigate = useNavigate();
  const { rooms, loading } = useRoomsStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    const { createRoom } = useRoomsStore.getState();
    try {
      const room = await createRoom(newRoom);
      setShowCreate(false);
      setNewRoom({ name: '', description: '' });
      navigate(`/room/${room.name}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  if (loading && !rooms.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="w-full py-3 bg-primary text-bg rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Room
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateRoom} className="px-4 pb-4 space-y-3">
          <input
            type="text"
            placeholder="Room name"
            value={newRoom.name}
            onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            required
            className="w-full px-4 py-3 bg-surface rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newRoom.description}
            onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
            className="w-full px-4 py-3 bg-surface rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="w-full py-3 bg-primary text-bg rounded-lg font-medium"
          >
            Create
          </button>
        </form>
      )}

      <div className="divide-y divide-bg/50">
        {rooms.map((room) => (
          <button
            key={room._id || room.id || room.name}
            onClick={() => navigate(`/room/${room.name}`)}
            className="w-full p-4 flex items-center gap-3 hover:bg-surface/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="font-medium truncate"># {room.name}</div>
              {room.description && (
                <p className="text-sm text-text-muted truncate">{room.description}</p>
              )}
            </div>
            {room.memberCount && (
              <span className="text-xs text-text-muted">{room.memberCount} members</span>
            )}
          </button>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <svg className="w-16 h-16 text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-text-muted">No public rooms yet</p>
        </div>
      )}
    </div>
  );
}
