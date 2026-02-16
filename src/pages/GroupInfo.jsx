import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore, useAuthStore } from '../stores';
import { conversationsAPI, usersAPI, filesAPI } from '../services/api';

export default function GroupInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { activeConversation, fetchConversations } = useChatStore();
  
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [uploading, setUploading] = useState(false);

  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    const loadConversation = async () => {
      if (!activeConversation || (activeConversation._id || activeConversation.id) !== id) {
        try {
          const { data } = await conversationsAPI.getById(id);
          setName(data.name || '');
          setDescription(data.description || '');
        } catch (error) {
          console.error('Failed to load conversation:', error);
          navigate('/chats');
        }
      } else {
        setName(activeConversation.name || '');
        setDescription(activeConversation.description || '');
      }
    };
    if (id) {
      loadConversation();
    }
  }, [id, activeConversation, navigate]);

  useEffect(() => {
    const searchUsers = async () => {
      if (search.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const { data } = await usersAPI.search(search);
        const users = data.users || data;
        const participantIds = activeConversation?.participants?.map(p => 
          (p.user?._id || p.user)?.toString()
        ) || [];
        setSearchResults(users.filter(u => 
          !participantIds.includes((u._id || u.id)?.toString())
        ));
      } catch (error) {
        console.error('Search failed:', error);
      }
    };
    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [search, activeConversation]);

  const isAdmin = activeConversation?.participants?.some(
    p => (p.user?._id || p.user)?.toString() === currentUserId?.toString() && p.role === 'admin'
  );

  const handleSave = async () => {
    setLoading(true);
    try {
      await conversationsAPI.updateGroup(id, { name: name.trim(), description: description.trim() });
      await fetchConversations();
      setEditing(false);
    } catch (error) {
      console.error('Failed to update group:', error);
    }
    setLoading(false);
  };

  const handleAddMember = async (userId) => {
    try {
      await conversationsAPI.addParticipant(id, userId);
      const { data } = await conversationsAPI.getById(id);
      useChatStore.setState({ activeConversation: data });
      setSearch('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await conversationsAPI.removeParticipant(id, userId);
      const { data } = await conversationsAPI.getById(id);
      useChatStore.setState({ activeConversation: data });
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await conversationsAPI.updateParticipantRole(id, userId, newRole);
      const { data } = await conversationsAPI.getById(id);
      useChatStore.setState({ activeConversation: data });
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conversationId', id);
      const { data } = await filesAPI.upload(formData);
      await conversationsAPI.updateGroup(id, { avatar: data._id || data.id });
      const { data: convData } = await conversationsAPI.getById(id);
      useChatStore.setState({ activeConversation: convData });
      await fetchConversations();
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">Group Info</h2>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center text-primary text-3xl font-bold overflow-hidden">
              {activeConversation?.avatar ? (
                <img src={activeConversation.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                (activeConversation?.name || name || 'G')[0]?.toUpperCase()
              )}
            </div>
            {isAdmin && (
              <label className="absolute bottom-0 right-0 p-2 bg-primary text-bg rounded-full cursor-pointer hover:bg-primary/90">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-text-muted mb-1">Group Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-surface rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Group description..."
                className="w-full px-4 py-3 bg-surface rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={loading || !name.trim()}
                className="flex-1 py-3 bg-primary text-bg font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setName(activeConversation?.name || '');
                  setDescription(activeConversation?.description || '');
                }}
                className="px-4 py-3 bg-surface text-text rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-semibold">{activeConversation?.name || name}</h3>
            {activeConversation?.description && (
              <p className="text-sm text-text-muted mt-1">{activeConversation.description}</p>
            )}
            <p className="text-xs text-text-muted mt-2">
              {activeConversation?.participants?.length || 0} members
            </p>
            {isAdmin && (
              <button
                onClick={() => setEditing(true)}
                className="mt-3 px-4 py-2 bg-surface text-primary rounded-lg text-sm font-medium"
              >
                Edit Group
              </button>
            )}
          </div>
        )}

        {isAdmin && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-text-muted mb-2">Add Members</h4>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users to add..."
              className="w-full px-4 py-3 bg-surface rounded-lg text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchResults.length > 0 && (
              <div className="mt-2 bg-surface rounded-lg divide-y divide-bg max-h-48 overflow-y-auto">
                {searchResults.map((u) => (
                  <button
                    key={u._id || u.id}
                    onClick={() => handleAddMember(u._id || u.id)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-bg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center text-primary font-bold">
                      {u.displayName?.[0] || u.username?.[0] || '?'}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{u.displayName || u.username}</div>
                      <div className="text-sm text-text-muted">@{u.username}</div>
                    </div>
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <h4 className="text-sm font-medium text-text-muted mb-2">Members</h4>
          <div className="bg-surface rounded-lg divide-y divide-bg">
            {activeConversation?.participants?.map((p) => {
              const memberUser = p.user;
              const memberId = memberUser?._id || memberUser?.id || memberUser;
              const isCurrentUser = memberId?.toString() === currentUserId?.toString();
              const isMemberAdmin = p.role === 'admin';
              
              return (
                <div key={memberId} className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center text-primary font-bold">
                    {memberUser?.displayName?.[0] || memberUser?.username?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {memberUser?.displayName || memberUser?.username || 'Unknown'}
                      {isCurrentUser && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">You</span>}
                      {isMemberAdmin && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Admin</span>}
                    </div>
                    <div className="text-sm text-text-muted">@{memberUser?.username}</div>
                  </div>
                  {!isCurrentUser && isAdmin && (
                    <div className="flex items-center gap-2">
                      {p.role !== 'admin' && (
                        <button
                          onClick={() => handleRoleChange(memberId, 'admin')}
                          className="p-2 text-text-muted hover:text-primary"
                          title="Promote to admin"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(memberId)}
                        className="p-2 text-text-muted hover:text-red-500"
                        title="Remove member"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
