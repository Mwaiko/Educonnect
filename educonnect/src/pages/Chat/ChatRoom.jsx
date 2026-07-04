import { useState, useEffect, useRef, useCallback } from 'react';
import { getChatHistory, connectChatSocket, sendChatMessage, sendTypingIndicator } from '../../api/chat';
import './ChatRoom.css';

// DRF ListAPIView returns a bare array only if pagination is disabled for
// that view. If a global DEFAULT_PAGINATION_CLASS is set, the same endpoint
// returns { count, next, previous, results: [...] } instead. Handle both
// shapes so history doesn't silently render empty when pagination is on.
function extractMessages(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export default function ChatRoom({ groupId, currentUserId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesAreaRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setMessages([]); // reset so switching groups doesn't show the old group's messages

    getChatHistory(groupId)
      .then(res => setMessages(extractMessages(res.data)))
      .catch((err) => {
        console.error('Failed to load chat history:', err);
        setError('Could not load chat history.');
      })
      .finally(() => setLoading(false));

    const socket = connectChatSocket(groupId, handleIncoming);
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socketRef.current = socket;
    return () => socket.close();
  }, [groupId]);

  const handleIncoming = useCallback((data) => {
    if (data.type === 'chat.message') {
      setMessages(prev => {
        // Guard against double-adding a message that arrives over the
        // socket right as the history fetch resolves.
        if (prev.some(m => m.message_id === data.message_id || m.id === data.message_id)) {
          return prev;
        }
        return [...prev, data];
      });
    } else if (data.type === 'chat.typing') {
      setTypingUsers(prev => {
        const copy = { ...prev };
        data.is_typing ? (copy[data.user?.id] = data.user?.username) : delete copy[data.user?.id];
        return copy;
      });
    }
  }, []);

  const handleSend = () => {
    if (!input.trim() || !socketRef.current) return;
    sendChatMessage(socketRef.current, input.trim());
    setInput('');
    inputRef.current?.focus();
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = new Date(msg.sent_at).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  return (
    <div className="chat-page">
      <button className="back-btn" onClick={onBack}>Back</button>
      <div className="chat-card">
        <div className="chat-header">
          <h2>Group Chat</h2>
          <span className={`connection-dot ${connected ? 'connected' : 'disconnected'}`} />
        </div>

        <div className="messages-area" ref={messagesAreaRef}>
          {loading && <div className="chat-status-hint">Loading messages…</div>}
          {error && <div className="chat-error-banner">{error}</div>}
          {!loading && !error && messages.length === 0 && (
            <div className="chat-status-hint">No messages yet — say hello!</div>
          )}
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {msgs.map((msg, i) => {
                const isOwn = (msg.sender?.id || msg.sender_id) === currentUserId;
                const key = msg.id || msg.message_id || `${date}-${i}`;
                const senderName = msg.sender?.username || msg.sender_username;
                return (
                  <div key={key} className={`message-row ${isOwn ? 'own' : 'other'}`}>
                    {!isOwn && senderName && (
                      <span className="message-sender">{senderName}</span>
                    )}
                    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {Object.keys(typingUsers).length > 0 && (
          <div className="typing-indicator">
            {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing…
          </div>
        )}

        <div className="input-bar">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button className="send-btn" onClick={handleSend} disabled={!connected}>Send</button>
        </div>
      </div>
    </div>
  );
}