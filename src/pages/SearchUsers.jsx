import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useChatStore } from '../stores';

export default function SearchUsers() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { createDirectConversation } = useChatStore();

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await usersAPI.search(query);
        setResults(data.users || data);
      } catch (error) {
        console.error('Search failed:', error);
      }
      setLoading(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleStartChat = async (user) => {
    try {
      const conv = await createDirectConversation(user._id || user.id);
      navigate(`/chat/${conv._id || conv.id}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">Search Users</h2>
      </header>

      <div className="p-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or email..."
          className="w-full px-4 py-3 bg-surface rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
      </div>

      <div className="px-4">
        {loading ? (
          <div className="text-center text-text-muted py-4">Searching...</div>
        ) : results.length > 0 ? (
          results.map((user) => (
            <button
              key={user._id || user.id}
              onClick={() => handleStartChat(user)}
              className="w-full p-3 flex items-center gap-3 hover:bg-surface/50 transition-colors rounded-lg"
            >
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-primary font-bold">
                {user.displayName?.[0] || user.username?.[0] || '?'}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{user.displayName || user.username}</div>
                <div className="text-sm text-text-muted">@{user.username}</div>
              </div>
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          ))
        ) : query.length >= 2 ? (
          <div className="text-center text-text-muted py-4">No users found</div>
        ) : (
          <div className="text-center text-text-muted py-4">Type at least 2 characters</div>
        )}
      </div>
    </div>
  );
}
