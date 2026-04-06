import React, { useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import ChatList from '../../components/chat/ChatList';
import ChatWindow from '../../components/chat/ChatWindow';
import MessageInput from '../../components/chat/MessageInput';
import { useParams, useNavigate } from 'react-router-dom';

export default function FreelanceMessages() {
  const { conversationId } = useParams();
  const { conversations, setActiveConversation, activeConversation, loading: chatLoading } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === conversationId);
      if (conv) {
        setActiveConversation(conv);
      }
    }
  }, [conversationId, conversations, setActiveConversation]);

  // Handle conversation selection to update URL
  useEffect(() => {
    if (activeConversation && activeConversation._id !== conversationId) {
      navigate(`/messages/${activeConversation._id}`, { replace: true });
    }
  }, [activeConversation?._id, conversationId, navigate]);

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-7xl mx-auto overflow-hidden rounded-2xl border border-surface-800 bg-surface-900/40 backdrop-blur-md shadow-2xl">
      <div className="flex h-full overflow-hidden">
        {/* Chat List Sidebar */}
        <aside className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-surface-800 ${
          conversationId ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-6 border-b border-surface-800 bg-surface-900/60">
            <h1 className="text-2xl font-bold text-white tracking-tight">Messages</h1>
            <p className="text-surface-500 text-xs mt-1 font-medium uppercase tracking-wider">Inbox • {conversations.length} Threads</p>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatList />
          </div>
        </aside>

        {/* Chat Main Window */}
        <main className={`flex-1 flex flex-col min-w-0 bg-surface-900/20 ${
          !conversationId ? 'hidden md:flex' : 'flex'
        }`}>
          {!conversationId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-brand-500/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-brand-500/10">
                <svg className="w-12 h-12 text-brand-500/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h2 className="text-white text-xl font-bold mb-2">Select a conversation</h2>
              <p className="text-surface-500 max-w-xs mx-auto text-sm">
                Choose a chat from the sidebar to continue your discussion. Your messages are private and secure.
              </p>
            </div>
          ) : chatLoading && !activeConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0">
                <ChatWindow />
              </div>
              <MessageInput />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
