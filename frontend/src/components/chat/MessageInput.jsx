import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';

const MessageInput = () => {
  const { activeConversation, sendMessage, sendTyping } = useChat();
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Reset state when switching conversations
    setText('');
    setFile(null);
    setPreview(null);
  }, [activeConversation?._id]);

  const handleTextChange = (e) => {
    setText(e.target.value);

    // Typing indicator logic
    if (activeConversation) {
      sendTyping(activeConversation._id, true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(activeConversation._id, false);
      }, 2000);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Client-side size check (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File is too large. Max size is 10MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFile(selectedFile);
    
    // Create preview if it's an image
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !file) || sending || !activeConversation) return;

    setSending(true);
    try {
      let messageType = 'text';
      if (file) {
        if (file.type.startsWith('image/')) messageType = 'image';
        else if (file.type.startsWith('video/')) messageType = 'video';
        else messageType = 'file';
      }

      await sendMessage(activeConversation._id, text.trim(), file, messageType);
      
      // Success: Reset UI
      setText('');
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      sendTyping(activeConversation._id, false);
    } catch (err) {
      console.error('Failed to send message:', err);
      alert(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!activeConversation) return null;

  return (
    <div className="p-4 px-6 bg-surface-900/90 border-t border-surface-800 backdrop-blur-sm relative z-10">
      {file && (
        <div className="absolute bottom-full left-6 mb-3 p-3 bg-surface-800 rounded-2xl border border-brand-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in shadow-2xl backdrop-blur-lg">
          {preview ? (
            <img src={preview} alt="Preview" className="w-12 h-12 rounded-lg object-cover ring-2 ring-brand-500/20" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
            </div>
          )}
          <div className="min-w-0 pr-4">
            <p className="text-white text-xs font-semibold truncate max-w-[120px]">{file.name}</p>
            <p className="text-surface-500 text-[10px]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <button 
            onClick={removeFile}
            className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <label className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-surface-800/80 border border-surface-700/50 rounded-xl text-surface-400 hover:text-brand-400 hover:border-brand-500/50 hover:bg-brand-500/5 cursor-pointer transition-all duration-300 shadow-sm active:scale-95">
          <svg className="w-5 h-5 transition-transform duration-300 hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        </label>

        <div className="flex-1 relative flex items-center group">
          <input
            className="w-full bg-surface-800/50 border border-surface-700/50 rounded-xl px-4 py-3 text-white text-sm placeholder-surface-500 focus:outline-none focus:border-brand-500/50 focus:bg-surface-800/80 transition-all duration-300 pr-12 shadow-inner"
            placeholder="Write a message..."
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-surface-600 font-bold uppercase tracking-widest hidden group-focus-within:block pointer-events-none opacity-40">
            Enter
          </div>
        </div>

        <button
          type="submit"
          disabled={sending || (!text.trim() && !file)}
          className="w-11 h-11 flex items-center justify-center bg-brand-500 hover:bg-brand-600 disabled:opacity-30 disabled:grayscale text-white rounded-xl transition-all duration-300 shadow-lg shadow-brand-500/20 active:scale-90 flex-shrink-0 group"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
      <div className="h-2 flex items-center">
          <p className="text-[10px] text-surface-500 ml-16 mt-1 opacity-60 font-medium">Messages are encrypted and secure</p>
      </div>
    </div>
  );
};

export default MessageInput;
