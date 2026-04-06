import React from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const ChatList = () => {
  const { conversations, activeConversation, setActiveConversation, loading } = useChat();
  const { user } = useAuth();

  if (loading && conversations.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-surface-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 bg-surface-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-white font-medium">No messages yet</h3>
        <p className="text-surface-500 text-sm mt-1">When you start a chat, it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      {conversations.map((conv) => {
        const otherParticipant = conv.participants.find(p => p._id !== user._id);
        const isActive = activeConversation?._id === conv._id;
        const unread = conv.unreadCount?.[user._id] || 0;

        return (
          <button
            key={conv._id}
            onClick={() => setActiveConversation(conv)}
            className={`flex items-center gap-3 p-4 transition-all border-b border-surface-800/50 hover:bg-surface-800/30 ${
              isActive ? 'bg-brand-500/10 border-l-4 border-l-brand-500' : ''
            }`}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-700 ring-2 ring-surface-800">
                {otherParticipant?.avatar ? (
                  <img src={otherParticipant.avatar} alt={otherParticipant.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-400 font-bold text-lg">
                    {otherParticipant?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {/* Online status indicator could go here */}
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-start mb-0.5">
                <h4 className={`font-semibold truncate ${isActive ? 'text-brand-400' : 'text-white'}`}>
                  {otherParticipant?.name || 'User'}
                </h4>
                {conv.lastMessage && (
                  <span className="text-[10px] text-surface-500 whitespace-nowrap ml-2">
                    {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className={`text-xs truncate flex-1 ${unread > 0 ? 'text-surface-200 font-medium' : 'text-surface-500'}`}>
                  {conv.lastMessage?.content || 'No messages yet'}
                </p>
                {unread > 0 && (
                  <span className="bg-brand-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full ml-2 px-1">
                    {unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ChatList;
