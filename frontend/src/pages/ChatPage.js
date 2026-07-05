import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', { autoConnect: false });

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const PaperclipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return new Date(date).toLocaleDateString();
};

const ChatPage = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const messagesEnd = useRef(null);
  const fileInput = useRef(null);

  useEffect(() => {
    if (!user) return;
    socket.connect();
    socket.emit('join', user._id);
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    api.get('/chats').then(res => {
      setChats(res.data.chats);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeChat) return;
    const handleReceive = (data) => {
      if (data.chatId === activeChat._id) {
        setMessages(prev => [...prev, data.message]);
      }
      setChats(prev => prev.map(c =>
        c._id === data.chatId ? { ...c, lastMessage: data.message, updatedAt: new Date().toISOString() } : c
      ));
    };
    const handleTyping = (data) => {
      if (data.chatId === activeChat._id && data.userId !== user._id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }
    };
    socket.on('receive_message', handleReceive);
    socket.on('user_typing', handleTyping);
    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('user_typing', handleTyping);
    };
  }, [activeChat, user]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async (chat) => {
    setActiveChat(chat);
    setMobileShowDetail(true);
    try {
      const res = await api.get(`/chats/${chat._id}/messages`);
      setMessages(res.data.messages);
      setChats(prev => prev.map(c =>
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      ));
    } catch {}
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChat) return;
    setSending(true);
    try {
      const res = await api.post(`/chats/${activeChat._id}/messages`, { text: newMessage });
      setMessages(prev => [...prev, res.data.message]);
      setNewMessage('');
      setChats(prev => prev.map(c =>
        c._id === activeChat._id ? { ...c, lastMessage: res.data.message, updatedAt: new Date().toISOString() } : c
      ));
    } catch {} finally { setSending(false); }
  };

  const handleFileSend = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }
    setSending(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post(`/chats/${activeChat._id}/messages`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessages(prev => [...prev, res.data.message]);
      setChats(prev => prev.map(c =>
        c._id === activeChat._id ? { ...c, lastMessage: res.data.message, updatedAt: new Date().toISOString() } : c
      ));
    } catch {} finally { setSending(false); if (fileInput.current) fileInput.current.value = ''; }
  };

  const handleTypingEmit = () => {
    if (activeChat) {
      socket.emit('typing', { chatId: activeChat._id, userId: user._id });
    }
  };

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <>
      <style>{`
        .chat-layout { display: flex; gap: 0; height: calc(100vh - 120px); min-height: 500px; border: 1px solid var(--gray-200); border-radius: var(--radius); overflow: hidden; background: var(--white); }
        .chat-list { width: 340px; border-right: 1px solid var(--gray-200); display: flex; flex-direction: column; flex-shrink: 0; }
        .chat-list-header { padding: 16px 20px; border-bottom: 1px solid var(--gray-200); }
        .chat-list-header h3 { margin: 0; font-size: 16px; font-weight: 700; }
        .chat-list-items { flex: 1; overflow-y: auto; }
        .chat-item { display: flex; align-items: center; gap: 12px; padding: 14px 20px; cursor: pointer; border-bottom: 1px solid var(--gray-100); transition: background 0.12s; }
        .chat-item:hover { background: var(--gray-50); }
        .chat-item.active { background: var(--green-light); }
        .chat-item.unread { background: #F0FDF4; }
        .chat-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--green); color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
        .chat-item-content { flex: 1; min-width: 0; }
        .chat-item-header { display: flex; justify-content: space-between; margin-bottom: 2px; }
        .chat-item-name { font-size: 13px; font-weight: 600; color: var(--gray-800); }
        .chat-item-time { font-size: 11px; color: var(--gray-400); }
        .chat-item-preview { font-size: 12px; color: var(--gray-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .chat-item-badge { background: var(--green); color: var(--white); border-radius: 50%; min-width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
        .chat-detail { flex: 1; display: flex; flex-direction: column; }
        .chat-detail-header { padding: 14px 20px; border-bottom: 1px solid var(--gray-200); display: flex; align-items: center; gap: 12px; }
        .chat-detail-name { font-weight: 600; font-size: 15px; }
        .chat-detail-role { font-size: 12px; color: var(--gray-400); }
        .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .chat-msg { max-width: 70%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; word-break: break-word; }
        .chat-msg.sent { align-self: flex-end; background: var(--green); color: var(--white); border-bottom-right-radius: 4px; }
        .chat-msg.received { align-self: flex-start; background: var(--gray-100); color: var(--gray-800); border-bottom-left-radius: 4px; }
        .chat-msg-time { font-size: 10px; opacity: 0.7; margin-top: 4px; }
        .chat-msg-file { display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; background: rgba(255,255,255,0.2); border-radius: 6px; font-size: 12px; text-decoration: none; color: inherit; margin-top: 4px; }
        .chat-msg.received .chat-msg-file { background: var(--gray-200); }
        .chat-typing { font-size: 12px; color: var(--gray-400); font-style: italic; padding: 0 20px; }
        .chat-input { border-top: 1px solid var(--gray-200); padding: 12px 20px; display: flex; gap: 10px; align-items: flex-end; }
        .chat-input input { flex: 1; padding: 10px 14px; border: 1px solid var(--gray-200); border-radius: 20px; font-size: 14px; font-family: var(--font-body); outline: none; }
        .chat-input input:focus { border-color: var(--green); }
        .chat-input button { width: 38px; height: 38px; border-radius: 50%; border: none; background: var(--green); color: var(--white); display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .chat-input button:disabled { background: var(--gray-300); cursor: not-allowed; }
        .chat-input button.file-btn { background: var(--gray-100); color: var(--gray-500); }
        .chat-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--gray-400); }
        .chat-back-btn { display: none; background: none; border: none; color: var(--gray-500); cursor: pointer; padding: 4px; }
        @media (max-width: 768px) {
          .chat-layout { flex-direction: column; height: auto; min-height: calc(100vh - 140px); }
          .chat-list { width: 100%; border-right: none; border-bottom: 1px solid var(--gray-200); max-height: 45vh; }
          .chat-list.hide { display: none; }
          .chat-detail { min-height: 55vh; }
          .chat-detail.hide { display: none; }
          .chat-back-btn { display: flex; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 32px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
          <button onClick={() => { setMobileShowDetail(false); setActiveChat(null); }} className="chat-back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, margin: 0 }}>Chat</h1>
        </div>

        <div className="chat-layout">
          <div className={`chat-list ${mobileShowDetail ? 'hide' : ''}`}>
            <div className="chat-list-header"><h3>Conversations</h3></div>
            <div className="chat-list-items">
              {chats.length === 0 ? (
                <div className="chat-empty" style={{ padding: 40 }}>
                  <ChatIcon />
                  <p style={{ marginTop: 12, fontSize: 14 }}>No conversations yet</p>
                </div>
              ) : chats.map(chat => {
                const other = chat.participants.find(p => p._id !== user._id);
                const isActive = activeChat?._id === chat._id;
                return (
                  <div key={chat._id} className={`chat-item ${isActive ? 'active' : ''} ${chat.unreadCount > 0 ? 'unread' : ''}`} onClick={() => loadChat(chat)}>
                    <div className="chat-avatar">{other?.profileImage ? <img src={other.profileImage} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} /> : getInitials(other?.name)}</div>
                    <div className="chat-item-content">
                      <div className="chat-item-header">
                        <span className="chat-item-name">{other?.name || 'Unknown'}</span>
                        <span className="chat-item-time">{chat.lastMessage ? timeAgo(chat.updatedAt) : ''}</span>
                      </div>
                      <div className="chat-item-preview">{chat.lastMessage?.text || (chat.lastMessage?.fileName ? chat.lastMessage.fileName : 'No messages yet')}</div>
                    </div>
                    {chat.unreadCount > 0 && <div className="chat-item-badge">{chat.unreadCount}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={`chat-detail ${!mobileShowDetail && !activeChat ? 'hide' : ''}`}>
            {activeChat ? (
              <>
                <div className="chat-detail-header">
                  {(() => { const other = activeChat.participants.find(p => p._id !== user._id); return (
                    <>
                      <div className="chat-avatar">{other?.profileImage ? <img src={other.profileImage} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} /> : getInitials(other?.name)}</div>
                      <div>
                        <div className="chat-detail-name">{other?.name}</div>
                        <div className="chat-detail-role">{other?.role}</div>
                      </div>
                    </>
                  ); })()}
                </div>

                <div className="chat-messages">
                  {messages.map(msg => (
                    <div key={msg._id} className={`chat-msg ${msg.sender._id === user._id ? 'sent' : 'received'}`}>
                      {msg.text && <div>{msg.text}</div>}
                      {msg.file && (
                        <a href={msg.file} target="_blank" rel="noopener noreferrer" className="chat-msg-file">
                          <PaperclipIcon /> {msg.fileName || 'File'}
                        </a>
                      )}
                      <div className="chat-msg-time">{timeAgo(msg.createdAt)}</div>
                    </div>
                  ))}
                  <div ref={messagesEnd} />
                </div>

                {typing && <div className="chat-typing">Typing...</div>}

                <div className="chat-input">
                  <input type="file" ref={fileInput} onChange={handleFileSend} style={{ display: 'none' }} accept="image/*,.pdf,.zip" />
                  <button className="file-btn" onClick={() => fileInput.current?.click()} title="Attach file"><PaperclipIcon /></button>
                  <input
                    value={newMessage}
                    onChange={e => { setNewMessage(e.target.value); handleTypingEmit(); }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Type a message..."
                  />
                  <button onClick={handleSend} disabled={sending || !newMessage.trim()}><SendIcon /></button>
                </div>
              </>
            ) : (
              <div className="chat-empty">
                <ChatIcon />
                <p style={{ marginTop: 12, fontSize: 14 }}>Select a conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
