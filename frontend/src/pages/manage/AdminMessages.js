import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

const EnvelopeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ToolbarButton = ({ cmd, label, onClick }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(cmd); }}
    style={{
      width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid var(--gray-200)', background: 'var(--white)', borderRadius: 4,
      cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--gray-600)',
      fontFamily: 'var(--font-body)', transition: 'all 0.15s'
    }}
    onMouseEnter={(e) => { e.target.style.borderColor = 'var(--green)'; e.target.style.color = 'var(--green)'; }}
    onMouseLeave={(e) => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.color = 'var(--gray-600)'; }}
    title={label}
  >
    {label}
  </button>
);

const AdminMessages = () => {
  const [users, setUsers] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingSent, setLoadingSent] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const editorRef = useRef(null);
  const toastTimer = useRef(null);
  const [activeTab, setActiveTab] = useState('message');
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterTarget, setNewsletterTarget] = useState('all');
  const [subscriberCount, setSubscriberCount] = useState(0);
  const newsletterEditorRef = useRef(null);

  useEffect(() => {
    api.get('/admin/users')
      .then(res => setUsers(res.data.users || res.data))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));

    api.get('/messages/sent')
      .then(res => setSentMessages(res.data.messages || res.data))
      .catch(() => {})
      .finally(() => setLoadingSent(false));

    api.get('/admin/subscribers')
      .then(res => {
        const subs = res.data.subscribers || res.data;
        setSubscriberCount(Array.isArray(subs) ? subs.length : 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const execCmd = (cmd) => {
    document.execCommand(cmd, false, null);
    editorRef.current?.focus();
  };

  const getBodyHtml = () => {
    return editorRef.current?.innerHTML?.trim() || '';
  };

  const handleSend = async () => {
    if (!to) { showToast('error', 'Please select a recipient.'); return; }
    if (!subject.trim()) { showToast('error', 'Please enter a subject.'); return; }
    const body = getBodyHtml();
    if (!body || body === '<br>') { showToast('error', 'Please enter a message body.'); return; }

    setSending(true);
    try {
      await api.post('/messages', { to, subject: subject.trim(), body });
      showToast('success', 'Message sent successfully.');
      setTo('');
      setSubject('');
      if (editorRef.current) editorRef.current.innerHTML = '';

      setLoadingSent(true);
      api.get('/messages/sent')
        .then(res => setSentMessages(res.data.messages || res.data))
        .catch(() => {})
        .finally(() => setLoadingSent(false));
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!newsletterSubject.trim()) { showToast('error', 'Please enter a subject.'); return; }
    const body = newsletterEditorRef.current?.innerHTML?.trim() || '';
    if (!body || body === '<br>') { showToast('error', 'Please enter newsletter content.'); return; }

    setSending(true);
    try {
      await api.post('/admin/newsletter', {
        subject: newsletterSubject.trim(),
        body,
        target: newsletterTarget
      });
      showToast('success', 'Newsletter sent successfully.');
      setNewsletterSubject('');
      if (newsletterEditorRef.current) newsletterEditorRef.current.innerHTML = '';
    } catch (err) {
      showToast('error', err.response?.data?.error || 'Failed to send newsletter.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <style>{`
        .am-toast {
          position: fixed; top: 80px; right: 24px; z-index: 9999;
          display: flex; align-items: center; gap: 10px;
          padding: 14px 20px; border-radius: var(--radius);
          background: var(--white); border: 1px solid var(--gray-200);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          animation: am-slideIn 0.3s ease forwards;
          max-width: 380px; width: calc(100% - 48px);
        }
        .am-toast.success { border-left: 4px solid var(--green); }
        .am-toast.error { border-left: 4px solid #DC2626; }
        .am-toast-icon {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .am-toast.success .am-toast-icon { background: var(--green-light); color: var(--green); }
        .am-toast.error .am-toast-icon { background: #FEF2F2; color: #DC2626; }
        .am-toast-text { font-size: 14px; font-family: var(--font-body); color: var(--black); flex: 1; }
        .am-toast-close {
          background: none; border: none; cursor: pointer; color: var(--gray-400);
          padding: 4px; display: flex; border-radius: 4px;
        }
        .am-toast-close:hover { background: var(--gray-100); }
        @keyframes am-slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .am-editor {
          min-height: 180px; max-height: 360px; overflow-y: auto;
          padding: 14px 16px; font-family: var(--font-body); font-size: 14px;
          color: var(--black); line-height: 1.7; outline: none;
          border: 1px solid var(--gray-200); border-top: none;
          border-radius: 0 0 var(--radius) var(--radius);
          transition: border-color 0.15s;
        }
        .am-editor:focus { border-color: var(--green); }
        .am-editor:empty::before {
          content: attr(data-placeholder); color: var(--gray-400); pointer-events: none;
        }
        .am-editor ul, .am-editor ol { padding-left: 24px; margin: 8px 0; }
        .am-editor ul { list-style-type: disc; }
        .am-editor ol { list-style-type: decimal; }
        .am-editor li { margin: 4px 0; }
        .am-editor b, .am-editor strong { font-weight: 600; }
        .am-editor i, .am-editor em { font-style: italic; }
        .am-editor u { text-decoration: underline; }
      `}</style>

      {toast && (
        <div className={`am-toast ${toast.type}`}>
          <div className="am-toast-icon">
            {toast.type === 'success' ? <CheckIcon /> : <CloseIcon />}
          </div>
          <span className="am-toast-text">{toast.message}</span>
          <button className="am-toast-close" onClick={() => setToast(null)}>
            <CloseIcon />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid var(--gray-200)' }}>
        <button onClick={() => setActiveTab('message')} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'message' ? '2px solid var(--green)' : '2px solid transparent', marginBottom: -2, fontSize: 14, fontWeight: 600, color: activeTab === 'message' ? 'var(--green)' : 'var(--gray-500)', cursor: 'pointer' }}>Compose Message</button>
        <button onClick={() => setActiveTab('newsletter')} style={{ padding: '10px 20px', background: 'none', border: 'none', borderBottom: activeTab === 'newsletter' ? '2px solid var(--green)' : '2px solid transparent', marginBottom: -2, fontSize: 14, fontWeight: 600, color: activeTab === 'newsletter' ? 'var(--green)' : 'var(--gray-500)', cursor: 'pointer' }}>Send Newsletter</button>
      </div>

      {activeTab === 'message' && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius)', background: 'var(--green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green)'
            }}>
              <EnvelopeIcon />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700 }}>Compose Message</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>To</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                disabled={loadingUsers}
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)', fontSize: 14,
                  color: 'var(--black)', background: 'var(--white)', appearance: 'auto',
                  cursor: loadingUsers ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">{loadingUsers ? 'Loading users...' : 'Select a user'}</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name || u.email}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)', fontSize: 14,
                  color: 'var(--black)', background: 'var(--white)', outline: 'none',
                  transition: 'border-color 0.15s'
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--green)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--gray-200)'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6, fontFamily: 'var(--font-body)' }}>Body</label>
              <div style={{
                display: 'flex', gap: 4, padding: '8px 10px',
                border: '1px solid var(--gray-200)', borderBottom: 'none',
                borderRadius: 'var(--radius) var(--radius) 0 0', background: 'var(--gray-50)'
              }}>
                <ToolbarButton cmd="bold" label="B" onClick={execCmd} />
                <ToolbarButton cmd="italic" label="I" onClick={execCmd} />
                <ToolbarButton cmd="underline" label="U" onClick={execCmd} />
                <div style={{ width: 1, background: 'var(--gray-200)', margin: '2px 4px' }} />
                <ToolbarButton cmd="insertUnorderedList" label={
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="6" y1="3" x2="14" y2="3" /><line x1="6" y1="8" x2="14" y2="8" /><line x1="6" y1="13" x2="14" y2="13" />
                    <circle cx="2.5" cy="3" r="1" fill="currentColor" /><circle cx="2.5" cy="8" r="1" fill="currentColor" /><circle cx="2.5" cy="13" r="1" fill="currentColor" />
                  </svg>
                } onClick={execCmd} />
                <ToolbarButton cmd="insertOrderedList" label={
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="7" y1="3" x2="14" y2="3" /><line x1="7" y1="8" x2="14" y2="8" /><line x1="7" y1="13" x2="14" y2="13" />
                    <text x="1" y="5" fontSize="5" fill="currentColor" stroke="none" fontFamily="var(--font-body)">1</text>
                    <text x="1" y="10" fontSize="5" fill="currentColor" stroke="none" fontFamily="var(--font-body)">2</text>
                    <text x="1" y="15" fontSize="5" fill="currentColor" stroke="none" fontFamily="var(--font-body)">3</text>
                  </svg>
                } onClick={execCmd} />
              </div>
              <div
                ref={editorRef}
                className="am-editor"
                contentEditable
                data-placeholder="Write your message..."
                suppressContentEditableWarning
              />
            </div>

            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 'var(--radius)', border: 'none',
                background: 'var(--green)', color: 'var(--white)', fontSize: 14,
                fontWeight: 500, fontFamily: 'var(--font-body)', cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending ? 0.65 : 1, transition: 'all 0.15s', alignSelf: 'flex-start'
              }}
            >
              {sending ? (
                <>
                  <div style={{
                    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'var(--white)', borderRadius: '50%',
                    animation: 'am-spin 0.6s linear infinite'
                  }} />
                  Sending...
                </>
              ) : (
                <>
                  <SendIcon />
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Sent Messages</h3>

          {loadingSent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72 }} />)}
            </div>
          ) : sentMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)', fontSize: 14 }}>
              No messages sent yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 520, overflowY: 'auto' }}>
              {sentMessages.map(msg => (
                <div key={msg._id} style={{
                  padding: '14px 16px', border: '1px solid var(--gray-100)',
                  borderRadius: 'var(--radius)', transition: 'border-color 0.15s'
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--green)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--gray-100)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--black)', fontFamily: 'var(--font-body)' }}>
                      {msg.to?.name || msg.to?.email || 'Unknown'}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-600)', marginBottom: 4 }}>{msg.subject}</div>
                  <div
                    style={{ fontSize: 13, color: 'var(--gray-400)', lineHeight: 1.5, maxHeight: 40, overflow: 'hidden' }}
                    dangerouslySetInnerHTML={{ __html: msg.body }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'newsletter' && (
      <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 24, maxWidth: 640 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Send Newsletter</h3>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>Send an email to all {subscriberCount} subscribers.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Send To</label>
            <select value={newsletterTarget} onChange={e => setNewsletterTarget(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: 14 }}>
              <option value="all">All Subscribers</option>
              <option value="sme">SMEs Only</option>
              <option value="specialist">Specialists Only</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Subject</label>
            <input type="text" value={newsletterSubject} onChange={e => setNewsletterSubject(e.target.value)} placeholder="Newsletter subject..." style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', fontSize: 14, outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-500)', marginBottom: 6 }}>Content</label>
            <div style={{ display: 'flex', gap: 4, padding: '8px 10px', border: '1px solid var(--gray-200)', borderBottom: 'none', borderRadius: 'var(--radius) var(--radius) 0 0', background: 'var(--gray-50)' }}>
              <ToolbarButton cmd="bold" label="B" onClick={(cmd) => { document.execCommand(cmd, false, null); newsletterEditorRef.current?.focus(); }} />
              <ToolbarButton cmd="italic" label="I" onClick={(cmd) => { document.execCommand(cmd, false, null); newsletterEditorRef.current?.focus(); }} />
              <ToolbarButton cmd="underline" label="U" onClick={(cmd) => { document.execCommand(cmd, false, null); newsletterEditorRef.current?.focus(); }} />
            </div>
            <div ref={newsletterEditorRef} className="am-editor" contentEditable data-placeholder="Write your newsletter content..." suppressContentEditableWarning />
          </div>
          <button onClick={handleSendNewsletter} disabled={sending} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 24px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--green)', color: 'var(--white)', fontSize: 14, fontWeight: 500, cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.65 : 1, alignSelf: 'flex-start' }}>
            {sending ? 'Sending...' : <><SendIcon /> Send Newsletter</>}
          </button>
        </div>
      </div>
      )}

      <style>{`@keyframes am-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminMessages;
