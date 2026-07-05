import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ConfirmModal from '../components/common/ConfirmModal';

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
};

const timeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const MessagesPage = () => {
  useAuth();
  const [messages, setMessages] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('inbox');
  const [selected, setSelected] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/messages'), api.get('/messages/sent')])
      .then(([inbox, outbox]) => { setMessages(inbox.data.messages); setSent(outbox.data.messages); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/messages/${id}/read`);
      setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
    } catch {}
  };

  const handleReply = async () => {
    if (!replyBody || !selected) return;
    setSending(true);
    try {
      await api.post('/messages', { to: selected.from._id, subject: `Re: ${selected.subject}`, body: replyBody });
      setReplyBody('');
      const res = await api.get('/messages/sent');
      setSent(res.data.messages);
    } catch {} finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/messages/${id}`);
      setMessages(prev => prev.filter(m => m._id !== id));
      setSent(prev => prev.filter(m => m._id !== id));
      if (selected?._id === id) setSelected(null);
      setMobileShowDetail(false);
    } catch {}
  };

  const currentList = tab === 'inbox' ? messages : sent;
  const unreadCount = messages.filter(m => !m.read).length;

  if (loading) return <div style={{ padding: '100px 32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading...</div>;

  return (
    <>
      <style>{`
        .msg-layout { display: flex; gap: 0; height: calc(100vh - 120px); min-height: 500px; border: 1px solid var(--gray-200); border-radius: var(--radius); overflow: hidden; background: var(--white); }
        .msg-list { width: 380px; border-right: 1px solid var(--gray-200); display: flex; flex-direction: column; flex-shrink: 0; }
        .msg-list-header { padding: 16px 20px; border-bottom: 1px solid var(--gray-200); display: flex; gap: 4; }
        .msg-list-tab { padding: 6px 14px; border-radius: 6px; border: none; background: transparent; font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-body); color: var(--gray-400); transition: all 0.15s; position: relative; }
        .msg-list-tab.active { background: var(--green-light); color: var(--green); }
        .msg-list-tab .badge { margin-left: 4px; background: var(--green); color: var(--white); border-radius: 50%; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
        .msg-list-items { flex: 1; overflow-y: auto; }
        .msg-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 20px; cursor: pointer; border-bottom: 1px solid var(--gray-100); transition: background 0.12s; position: relative; }
        .msg-item:hover { background: var(--gray-50); }
        .msg-item.active { background: var(--green-light); }
        .msg-item.unread { background: #F0FDF4; }
        .msg-item.unread .msg-item-name { font-weight: 700; }
        .msg-item-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); flex-shrink: 0; margin-top: 6px; }
        .msg-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--green); color: var(--white); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
        .msg-item-content { flex: 1; min-width: 0; }
        .msg-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
        .msg-item-name { font-size: 13px; font-weight: 500; color: var(--gray-800); }
        .msg-item-time { font-size: 11px; color: var(--gray-400); flex-shrink: 0; }
        .msg-item-subject { font-size: 13px; font-weight: 500; color: var(--gray-600); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-item-preview { font-size: 12px; color: var(--gray-400); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .msg-item-delete { position: absolute; top: 12px; right: 12px; background: none; border: none; color: var(--gray-300); cursor: pointer; padding: 4px; border-radius: 4px; opacity: 0; transition: all 0.12s; display: flex; align-items: center; justify-content: center; }
        .msg-item:hover .msg-item-delete { opacity: 1; }
        .msg-item-delete:hover { color: #DC2626; background: #FEF2F2; }
        .msg-detail { flex: 1; display: flex; flex-direction: column; }
        .msg-detail-header { padding: 20px 24px; border-bottom: 1px solid var(--gray-200); }
        .msg-detail-subject { font-family: var(--font-heading); font-size: 20px; font-weight: 700; color: var(--gray-900); margin-bottom: 8px; }
        .msg-detail-meta { font-size: 13px; color: var(--gray-400); }
        .msg-detail-body { flex: 1; padding: 24px; overflow-y: auto; }
        .msg-detail-body p { font-size: 14px; line-height: 1.8; color: var(--gray-700); white-space: pre-wrap; margin: 0; }
        .msg-reply { border-top: 1px solid var(--gray-200); padding: 20px 24px; }
        .msg-reply h4 { font-size: 13px; font-weight: 600; color: var(--gray-500); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .msg-reply textarea { width: 100%; min-height: 100px; padding: 12px 14px; border: 1px solid var(--gray-200); border-radius: 8px; font-size: 14px; font-family: var(--font-body); resize: vertical; color: var(--gray-800); background: var(--gray-50); transition: border-color 0.15s; line-height: 1.6; }
        .msg-reply textarea:focus { outline: none; border-color: var(--green); background: var(--white); }
        .msg-reply-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
        .msg-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px; color: var(--gray-400); text-align: center; }
        .msg-back-btn { display: none; background: none; border: none; color: var(--gray-500); cursor: pointer; padding: 4px; margin-right: 4px; }
        @media (max-width: 768px) {
          .msg-layout { flex-direction: column; height: auto; min-height: calc(100vh - 140px); }
          .msg-list { width: 100%; border-right: none; border-bottom: 1px solid var(--gray-200); max-height: 50vh; }
          .msg-list.hide { display: none; }
          .msg-detail { min-height: 50vh; }
          .msg-detail.hide { display: none; }
          .msg-back-btn { display: flex; }
          .msg-item-delete { opacity: 1; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 32px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
          <button onClick={() => { setMobileShowDetail(false); setSelected(null); }} className="msg-back-btn">
            <BackIcon />
          </button>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 700, margin: 0 }}>Messages</h1>
        </div>

        <div className="msg-layout">
          <div className={`msg-list ${mobileShowDetail ? 'hide' : ''}`}>
            <div className="msg-list-header">
              <button className={`msg-list-tab ${tab === 'inbox' ? 'active' : ''}`} onClick={() => { setTab('inbox'); setSelected(null); }}>
                Inbox
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
              <button className={`msg-list-tab ${tab === 'sent' ? 'active' : ''}`} onClick={() => { setTab('sent'); setSelected(null); }}>
                Sent
              </button>
            </div>

            <div className="msg-list-items">
              {currentList.length === 0 ? (
                <div className="msg-empty">
                  <MailIcon />
                  <p style={{ marginTop: 12, fontSize: 14 }}>No messages in {tab}</p>
                </div>
              ) : (
                currentList.map(msg => {
                  const other = tab === 'inbox' ? msg.from : msg.to;
                  const isActive = selected?._id === msg._id;
                  return (
                    <div
                      key={msg._id}
                      className={`msg-item ${isActive ? 'active' : ''} ${!msg.read && tab === 'inbox' ? 'unread' : ''}`}
                      onClick={() => {
                        setSelected(msg);
                        setMobileShowDetail(true);
                        if (tab === 'inbox' && !msg.read) markRead(msg._id);
                      }}
                    >
                      <div className="msg-avatar">{getInitials(other?.name)}</div>
                      <div className="msg-item-content">
                        <div className="msg-item-header">
                          <span className="msg-item-name">{other?.name || 'Unknown'}</span>
                          <span className="msg-item-time">{timeAgo(msg.createdAt)}</span>
                        </div>
                        <div className="msg-item-subject">{msg.subject}</div>
                        <div className="msg-item-preview">{msg.body}</div>
                      </div>
                      {!msg.read && tab === 'inbox' && <div className="msg-item-dot" />}
                      <button
                        className="msg-item-delete"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(msg); }}
                        title="Delete message"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={`msg-detail ${!mobileShowDetail && !selected ? 'hide' : ''}`}>
            {selected ? (
              <>
                <div className="msg-detail-header">
                  <div className="msg-detail-subject">{selected.subject}</div>
                  <div className="msg-detail-meta">
                    {tab === 'inbox' ? `From: ${selected.from?.name}` : `To: ${selected.to?.name}`}
                    {' — '}
                    {new Date(selected.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="msg-detail-body">
                  <p>{selected.body}</p>
                </div>

                {tab === 'inbox' && (
                  <div className="msg-reply">
                    <h4>Reply</h4>
                    <textarea
                      value={replyBody}
                      onChange={e => setReplyBody(e.target.value)}
                      placeholder="Type your reply..."
                    />
                    <div className="msg-reply-actions">
                      <button
                        className="btn btn-primary"
                        onClick={handleReply}
                        disabled={sending || !replyBody}
                        style={{ padding: '8px 20px', fontSize: 13 }}
                      >
                        {sending ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="msg-empty">
                <MailIcon />
                <p style={{ marginTop: 12, fontSize: 14 }}>Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Message"
        message="Are you sure you want to delete this message? This cannot be undone."
        confirmText="Delete"
        danger
        onConfirm={() => { handleDelete(deleteTarget._id); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default MessagesPage;
