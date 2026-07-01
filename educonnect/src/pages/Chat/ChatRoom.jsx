import { useState, useEffect, useRef, useCallback } from 'react';
import { getChatHistory, connectChatSocket, sendChatMessage, sendTypingIndicator } from '../../api/chat';
import './ChatRoom.css';

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
    getChatHistory(groupId)
      .then(res => setMessages(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Could not load chat history.'))
      .finally(() => setLoading(false));

    const socket = connectChatSocket(groupId, handleIncoming);
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socketRef.current = socket;
    return () => socket.close();
  }, [groupId]);

  const handleIncoming = useCallback((data) => {
    if (data.type === 'chat.message') {
      setMessages(prev => [...prev, data]);
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
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {msgs.map((msg, i) => {
                const isOwn = (msg.sender?.id || msg.sender_id) === currentUserId;
                return (
                  <div key={i} className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                    {msg.content}
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

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