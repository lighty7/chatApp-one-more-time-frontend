import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useChatStore, useRoomsStore } from '../stores';

export default function ProfileTab() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const { conversations } = useChatStore();
  const { rooms } = useRoomsStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ displayName: user?.displayName || '', bio: user?.bio || '' });

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleSave = () => {
    updateUser(editData);
    setIsEditing(false);
  };

  const getChatCount = () => conversations?.length || 0;
  const getRoomCount = () => rooms?.length || 0;

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center text-primary text-4xl font-bold mb-4">
          {user?.displayName?.[0] || user?.username?.[0] || '?'}
        </div>
        
        {isEditing ? (
          <div className="w-full max-w-sm space-y-3">
            <input
              type="text"
              placeholder="Display Name"
              value={editData.displayName}
              onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
              className="w-full px-4 py-3 bg-surface rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Bio"
              value={editData.bio}
              onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
              className="w-full px-4 py-3 bg-surface rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-primary text-bg rounded-lg font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 bg-surface text-text rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold">{user?.displayName || user?.username}</h2>
            <p className="text-text-muted">@{user?.username}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 px-4 py-2 bg-surface rounded-lg text-sm font-medium"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-surface rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{getChatCount()}</div>
          <div className="text-sm text-text-muted">Chats</div>
        </div>
        <div className="bg-surface rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-primary">{getRoomCount()}</div>
          <div className="text-sm text-text-muted">Rooms</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="bg-surface rounded-xl p-4">
          <div className="text-sm text-text-muted mb-1">Email</div>
          <div>{user?.email}</div>
        </div>
        {user?.bio && (
          <div className="bg-surface rounded-xl p-4">
            <div className="text-sm text-text-muted mb-1">Bio</div>
            <div>{user.bio}</div>
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full mt-6 py-3 bg-red-500/20 text-red-400 rounded-xl font-medium"
      >
        Logout
      </button>
    </div>
  );
}
