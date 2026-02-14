import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useChatStore, useRoomsStore, useAIStore } from '../stores';
import { usersAPI } from '../services/api';

export default function ProfileTab() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const { conversations } = useChatStore();
  const { rooms } = useRoomsStore();
  const { models, preferredModel, fetchModels, setPreferredModel } = useAIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState({ displayName: user?.displayName || '', bio: user?.bio || '' });

  useEffect(() => {
    fetchModels();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleSave = () => {
    updateUser(editData);
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await usersAPI.delete(user._id || user.id);
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const handleModelChange = (e) => {
    setPreferredModel(e.target.value);
  };

  const getChatCount = () => conversations?.length || 0;
  const getRoomCount = () => rooms?.length || 0;

  return (
    <div className="h-full overflow-y-auto p-4">
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-xl max-w-sm mx-4">
            <h3 className="text-lg font-bold text-red-400 mb-2">Delete Account</h3>
            <p className="text-text-muted mb-4">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-surface text-text rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

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

      <button
        onClick={() => navigate('/ai-chat')}
        className="w-full mb-4 py-3 bg-primary/20 text-primary rounded-xl font-medium flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Chat with AI
      </button>

      <div className="bg-surface rounded-xl p-4 mb-4">
        <h3 className="font-medium mb-3">AI Model</h3>
        <select
          value={preferredModel}
          onChange={handleModelChange}
          className="w-full px-4 py-3 bg-bg rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {models.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
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

      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full mt-3 py-3 bg-red-600/20 text-red-500 rounded-xl font-medium"
      >
        Delete Account
      </button>
    </div>
  );
}
