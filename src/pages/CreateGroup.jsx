import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useChatStore } from '../stores';

export default function CreateGroup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { createGroup } = useChatStore();

  useEffect(() => {
    const searchUsers = async () => {
      if (search.length < 2) {
        setUsers([]);
        return;
      }
      try {
        const { data } = await usersAPI.search(search);
        setUsers(data.users || data);
      } catch (error) {
        console.error('Search failed:', error);
      }
    };
    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const toggleUser = (user) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => (u._id || u.id) === (user._id || user.id));
      if (exists) {
        return prev.filter((u) => (u._id || u.id) !== (user._id || user.id));
      }
      return [...prev, user];
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const group = await createGroup(
        name.trim(),
        description.trim(),
        selectedUsers.map((u) => u._id || u.id)
      );
      navigate(`/chat/${group._id || group.id}`);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">Create Group</h2>
      </header>

      <form onSubmit={handleCreate} className="p-4 space-y-4">
        <div>
          <label className="block text-sm text-text-muted mb-1">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name..."
            required
            className="w-full px-4 py-3 bg-surface rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
            className="w-full px-4 py-3 bg-surface rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">Add Members</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users to add..."
            className="w-full px-4 py-3 bg-surface rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <span
                key={user._id || user.id}
                className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-1"
              >
                {user.displayName || user.username}
                <button
                  type="button"
                  onClick={() => toggleUser(user)}
                  className="hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {users.length > 0 && (
          <div className="bg-surface rounded-lg divide-y divide-bg max-h-48 overflow-y-auto">
            {users
              .filter((u) => !selectedUsers.find((s) => (s._id || s.id) === (u._id || u.id)))
              .map((user) => (
                <button
                  key={user._id || user.id}
                  type="button"
                  onClick={() => toggleUser(user)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-bg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center text-primary font-bold">
                    {user.displayName?.[0] || user.username?.[0] || '?'}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{user.displayName || user.username}</div>
                    <div className="text-sm text-text-muted">@{user.username}</div>
                  </div>
                </button>
              ))}
          </div>
        )}

        <button
          type="submit"
          disabled={!name.trim() || selectedUsers.length === 0 || loading}
          className="w-full py-3 bg-primary text-bg font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
}
