import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingStatus, setTypingStatus] = useState({});
  const activeConversationRef = useRef(activeConversation);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Initialize Socket
  useEffect(() => {
    if (user && token) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
        auth: { token }
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        newSocket.emit('join_user', user._id);
      });

      newSocket.on('new_message', (message) => {
        const isActive = activeConversationRef.current?._id === message.conversation;
        if (isActive) {
          setMessages((prev) => {
            // Check for both server ID and client-generated temporary ID
            const isDuplicate = prev.some(m => 
              m._id === message._id || 
              (message.clientGeneratedId && m._id === message.clientGeneratedId)
            );
            if (isDuplicate) return prev;
            return [...prev, message];
          });
          api.patch(`/chat/${message.conversation}/read`).catch(console.error);
        }
        updateConversationInList(message.conversation, message);
      });

      newSocket.on('messages_read', ({ conversationId, userId }) => {
        if (activeConversationRef.current?._id === conversationId) {
          setMessages(prev => prev.map(msg => 
            msg.receiver === userId || (msg.receiver?._id === userId)
              ? { ...msg, readBy: [...(msg.readBy || []), userId] } 
              : msg
          ));
        }
      });

      newSocket.on('conversation_update', ({ conversationId, lastMessage, unreadCount }) => {
        setConversations((prev) => 
          prev.map(conv => 
            conv._id === conversationId 
              ? { ...conv, lastMessage, unreadCount: { ...conv.unreadCount, [user._id]: unreadCount } }
              : conv
          )
        );
      });

      newSocket.on('typing', ({ conversationId, userName }) => {
        setTypingStatus((prev) => ({ ...prev, [conversationId]: userName }));
      });

      newSocket.on('stop_typing', ({ conversationId }) => {
        setTypingStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[conversationId];
          return newStatus;
        });
      });

      return () => newSocket.close();
    }
  }, [user, token]);

  const updateConversationInList = (conversationId, lastMessage) => {
    setConversations((prev) => {
      const index = prev.findIndex(c => c._id === conversationId);
      if (index === -1) {
        fetchConversations();
        return prev;
      }
      const updated = [...prev];
      updated[index] = { ...updated[index], lastMessage, updatedAt: new Date().toISOString() };
      return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;
    try {
      setLoading(true);
      const res = await api.get(`/chat/${conversationId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
        if (socket) {
          socket.emit('join_conversation', conversationId);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (conversationId) => {
    if (!conversationId) return;
    try {
      await api.patch(`/chat/${conversationId}/read`);
      setConversations(prev => 
        prev.map(c => c._id === conversationId ? { ...c, unreadCount: { ...c.unreadCount, [user._id]: 0 } } : c)
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const sendMessage = async (conversationId, content, file = null, messageType = 'text') => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      conversation: conversationId,
      sender: { _id: user._id, name: user.name, avatar: user.avatar },
      content: content || '',
      fileType: messageType,
      fileUrl: file ? URL.createObjectURL(file) : null,
      fileName: file ? file.name : null,
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    // Add optimistic message instantly
    setMessages((prev) => [...prev, optimisticMessage]);
    updateConversationInList(conversationId, optimisticMessage);

    try {
      const formData = new FormData();
      formData.append('content', content || '');
      if (file) formData.append('file', file);
      formData.append('messageType', messageType);
      formData.append('clientGeneratedId', tempId);

      const res = await api.post(`/chat/${conversationId}`, formData);

      if (res.data.success) {
        // Replace optimistic message with the real one
        setMessages((prev) => prev.map(m => m._id === tempId ? res.data.message : m));
        updateConversationInList(conversationId, res.data.message);
        return res.data.message;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Mark as failed or remove
      setMessages((prev) => prev.filter(m => m._id !== tempId));
      throw err;
    }
  };

  const startConversation = async (userId) => {
    try {
      const res = await api.post('/conversations/start', { userId });
      if (res.data.success) {
        const conv = res.data.conversation;
        setConversations(prev => {
          if (prev.find(c => c._id === conv._id)) return prev;
          return [conv, ...prev];
        });
        return conv;
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      throw err;
    }
  };

  const sendTyping = (conversationId, isTyping) => {
    if (socket) {
      if (isTyping) {
        socket.emit('typing', { conversationId, userName: user.name });
      } else {
        socket.emit('stop_typing', { conversationId });
      }
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchConversations();
    }
  }, [user, token]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversation,
        messages,
        loading,
        fetchMessages,
        sendMessage,
        startConversation,
        markAsRead,
        sendTyping,
        typingStatus,
        onlineUsers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
