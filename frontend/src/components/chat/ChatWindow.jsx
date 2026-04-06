import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const ChatWindow = () => {
  const { activeConversation, messages, loading, fetchMessages, typingStatus, markAsRead } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessages(activeConversation._id);
      markAsRead(activeConversation._id);
    }
  }, [activeConversation?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-surface-900/50 rounded-2xl border border-surface-700/30">
        <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Private Messaging</h2>
        <p className="text-surface-400 max-w-md mx-auto">
          Choose a conversation from the sidebar to start chatting with freelancers or clients securely.
        </p>
      </div>
    );
  }

  const otherParticipant = activeConversation.participants.find(p => p._id !== user._id);
  const isTyping = typingStatus[activeConversation._id];

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Group messages by date preservig order
  const groupedMessages = [];
  let currentGroup = null;

  messages.forEach(message => {
    const date = new Date(message.createdAt).toDateString();
    if (!currentGroup || currentGroup.date !== date) {
      currentGroup = { date, messages: [] };
      groupedMessages.push(currentGroup);
    }
    currentGroup.messages.push(message);
  });

  return (
    <div className="flex flex-col h-full bg-surface-900/80 backdrop-blur-sm rounded-2xl border border-surface-700/50 shadow-2xl shadow-brand-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 px-6 border-b border-surface-800 bg-surface-900/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-700 ring-2 ring-brand-500/20 overflow-hidden">
            {otherParticipant?.avatar ? (
              <img src={otherParticipant.avatar} alt={otherParticipant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-400 font-bold">
                {otherParticipant?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold leading-tight">{otherParticipant?.name}</h3>
            <p className="text-[10px] text-surface-500 uppercase tracking-wider font-bold">
              {otherParticipant?.role || 'User'}
            </p>
          </div>
        </div>
        <div className="flex gap-4 text-surface-500 h-10 items-center">
            {/* Action buttons could go here */}
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-2" title="Online" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 px-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')]">
        {groupedMessages.map(({ date, messages: msgs }) => (
          <div key={date} className="space-y-4">
            <div className="flex justify-center my-6">
              <span className="px-3 py-1 rounded-full bg-surface-800/80 text-[10px] text-surface-400 font-bold uppercase tracking-widest backdrop-blur-md border border-surface-700/30">
                {formatMessageDate(date)}
              </span>
            </div>
            {msgs.map((msg) => {
              const isMe = msg.sender?._id === user._id || msg.sender === user._id;
              const isSeen = msg.readBy && msg.readBy.some(id => id !== user._id);
              
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${msg.status === 'sending' ? 'opacity-70' : ''}`}>
                  <div className={`max-w-[75%] lg:max-w-md ${isMe ? 'order-1' : 'order-1'}`}>
                    <div className={`relative px-4 py-3 rounded-2xl shadow-lg ${
                      isMe 
                      ? 'bg-brand-500 text-white rounded-br-none bg-gradient-to-br from-brand-500 to-brand-600' 
                      : 'bg-surface-800 text-surface-100 rounded-bl-none border border-surface-700/50'
                    }`}>
                      {msg.fileUrl && (
                        <div className="mb-2 overflow-hidden rounded-lg group/file relative">
                          {msg.fileType === 'image' ? (
                            <div className="relative cursor-pointer" onClick={() => window.open(msg.fileUrl, '_blank')}>
                              <img src={msg.fileUrl} alt="Attached" className="max-w-full hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/file:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </div>
                            </div>
                          ) : msg.fileType === 'video' ? (
                            <div className="flex flex-col gap-2 p-2 bg-black/20 rounded">
                              <video controls className="max-w-full rounded-lg shadow-inner"><source src={msg.fileUrl} /></video>
                              <div className="flex gap-4 border-t border-white/10 pt-2 px-1">
                                <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] uppercase font-bold hover:text-brand-300 transition-colors">Open in Tab</a>
                                <a href={msg.fileUrl} download={msg.fileName || 'video_download'} className="text-[10px] uppercase font-bold hover:text-brand-300 transition-colors">Download</a>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 p-2 bg-black/20 rounded">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span className="text-xs truncate">{msg.fileName || 'Document'}</span>
                              </div>
                              <div className="flex gap-4 border-t border-white/10 pt-2 px-1">
                                <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] uppercase font-bold hover:text-brand-300 transition-colors">Open in Tab</a>
                                <a href={msg.fileUrl} download={msg.fileName || 'download'} className="text-[10px] uppercase font-bold hover:text-brand-300 transition-colors">Download</a>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {msg.content && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                      <div className={`text-[10px] mt-1.5 opacity-60 flex items-center justify-end font-medium ${isMe ? 'text-brand-100' : 'text-surface-500'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {msg.status === 'sending' ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin ml-1.5" />
                        ) : isMe && (
                          <div className="flex ml-1.5 -space-x-1">
                            <svg className={`w-3.5 h-3.5 ${isSeen ? 'text-blue-300' : 'opacity-50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            {isSeen && (
                              <svg className="w-3.5 h-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface-800/50 backdrop-blur-md px-4 py-2 rounded-2xl rounded-bl-none text-surface-400 text-xs flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </span>
              {otherParticipant?.name} is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
