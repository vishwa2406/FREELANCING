import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminChat = () => {
  const { token } = useAuth();
  const { toast: showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/chat/analytics');
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (err) {
      showToast('Failed to load chat analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async (conversationId) => {
    try {
      const { data } = await api.get(`/admin/chat/${conversationId}`);
      if (data.success) {
        setMessages(data.messages);
        setSelectedChat(data.conversation);
      }
    } catch (err) {
      showToast('Failed to load chat history', 'error');
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const filteredConversations = conversations.filter(conv => 
    conv.participants.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-8rem)]">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Chat Monitoring</h1>
          <p className="text-surface-500 text-sm">Review private conversations between users and freelancers.</p>
        </div>
        <div className="bg-surface-800 rounded-xl p-1 px-4 border border-surface-700 flex items-center gap-2">
            <span className="text-brand-400 font-bold">{conversations.length}</span>
            <span className="text-surface-500 text-xs uppercase font-bold tracking-wider">Active Threads</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-4rem)] overflow-hidden">
        {/* Sidebar */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          <div className="p-4 border-b border-surface-800">
            <input
              type="text"
              placeholder="Search participants..."
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-brand-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-8 text-center text-surface-500">Loading...</div>
            ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-surface-500">No conversations found.</div>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv._id}
                  onClick={() => fetchChatHistory(conv._id)}
                  className={`w-full p-4 border-b border-surface-800 flex items-center gap-3 transition-colors hover:bg-surface-800/30 ${
                    selectedChat?._id === conv._id ? 'bg-brand-500/10 border-l-4 border-brand-500' : ''
                  }`}
                >
                  <div className="flex -space-x-4">
                    {conv.participants.slice(0, 2).map((p, i) => (
                      <div key={p._id} className="w-10 h-10 rounded-full border-2 border-surface-900 overflow-hidden bg-surface-700 z-[10-i]">
                        {p.avatar ? (
                          <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white uppercase">
                            {p.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white text-sm font-semibold truncate leading-tight">
                      {conv.participants.map(p => p.name).join(' & ')}
                    </p>
                    <p className="text-surface-500 text-[10px] truncate uppercase tracking-tighter mt-0.5">
                        {conv.lastMessage?.content || 'No messages'}
                    </p>
                  </div>
                  <div className="text-[10px] text-surface-600 font-bold">
                    {new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat view */}
        <div className="lg:col-span-2 bg-surface-900 border border-surface-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {selectedChat ? (
            <>
              <div className="p-4 px-6 border-b border-surface-800 bg-surface-900/60 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-white font-bold">Conversation Log</h3>
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase rounded border border-red-500/20">Read Only</span>
                </div>
                <div className="text-xs text-surface-500">
                    ID: <span className="font-mono">{selectedChat._id}</span>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/10 custom-scrollbar">
                {messages.map(msg => (
                  <div key={msg._id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">{msg.sender.name}</span>
                        <span className="text-[10px] text-surface-600 border-l border-surface-800 pl-2">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="bg-surface-800/80 border border-surface-700/50 rounded-xl p-3 text-sm text-surface-200">
                      {msg.content}
                      {msg.fileUrl && (
                        <div className="mt-2 text-xs text-brand-400 underline">
                          <a href={msg.fileUrl} target="_blank" rel="noreferrer">View Attachment ({msg.fileType})</a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-white font-medium">Select a thread to monitor</h3>
              <p className="text-surface-500 text-sm mt-1">Admin access is read-only and logged for security.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
