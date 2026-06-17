import { useState, useEffect, useRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { getChatHistory, connectChatSocket, sendChatMessage, sendTypingIndicator } from '../../api/chat';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #F8FAFC; color: #1E1B4B; }
`;

const Page = styled.div`
  padding: 2rem; max-width: 800px; margin: 0 auto;
  display: flex; flex-direction: column; height: calc(100vh - 4rem);
`;
const BackBtn = styled.button`
  display: inline-flex; align-items: center; gap: 6px;
  background: none; border: none; color: #4F46E5;
  font-size: 14px; font-weight: 500; cursor: pointer;
  font-family: 'Inter', system-ui, sans-serif;
  margin-bottom: 1rem; padding: 0;
  &:hover { opacity: 0.75; }
`;
const ChatCard = styled.div`
  flex: 1; display: flex; flex-direction: column;
  background: #fff; border: 0.5px solid rgba(79,70,229,0.18);
  border-radius: 12px; overflow: hidden;
`;
const ChatHeader = styled.div`
  background: #4F46E5; padding: 14px 18px;
  display: flex; align-items: center; justify-content: space-between;
`;
const ChatTitle = styled.h2`font-size: 15px; font-weight: 600; color: #fff;`;
const ConnectionDot = styled.span`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${({ $connected }) => $connected ? '#10B981' : '#EF4444'};
  display: inline-block; margin-right: 6px;
`;
const ConnectionLabel = styled.span`font-size: 12px; color: rgba(255,255,255,0.85);`;
const MessagesArea = styled.div`
  flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px;
`;
const MessageBubble = styled.div`
  max-width: 70%;
  align-self: ${({ $own }) => $own ? 'flex-end' : 'flex-start'};
  background: ${({ $own }) => $own ? '#4F46E5' : '#EEF2FF'};
  color: ${({ $own }) => $own ? '#fff' : '#1E1B4B'};
  padding: 8px 12px; border-radius: 12px;
  border-bottom-right-radius: ${({ $own }) => $own ? '4px' : '12px'};
  border-bottom-left-radius: ${({ $own }) => $own ? '12px' : '4px'};
`;
const SenderName = styled.div`
  font-size: 11px; font-weight: 600; margin-bottom: 2px;
  color: ${({ $own }) => $own ? 'rgba(255,255,255,0.8)' : '#4F46E5'};
`;
const MessageText = styled.div`font-size: 14px; line-height: 1.4;`;
const MessageTime = styled.div`
  font-size: 10px; margin-top: 4px;
  color: ${({ $own }) => $own ? 'rgba(255,255,255,0.7)' : '#9CA3AF'};
`;
const TypingIndicator = styled.div`
  font-size: 12px; color: #6B7280; font-style: italic; padding: 0 16px 8px;
`;
const InputBar = styled.div`
  display: flex; gap: 8px; padding: 14px;
  border-top: 0.5px solid rgba(79,70,229,0.12);
`;
const Input = styled.input`
  flex: 1; padding: 10px 14px;
  border: 1px solid rgba(79,70,229,0.25); border-radius: 8px;
  font-size: 14px; font-family: 'Inter', system-ui, sans-serif;
  background: #fff; color: #1E1B4B; outline: none;
  &:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
`;
const SendBtn = styled.button`
  background: #4F46E5; color: #fff; border: none;
  padding: 10px 18px; border-radius: 8px;
  font-size: 14px; font-weight: 500;
  font-family: 'Inter', system-ui, sans-serif;
  cursor: pointer; transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const EmptyState = styled.div`
  text-align: center; padding: 3rem; color: #6B7280; font-size: 13px;
`;

export default function ChatRoom({ groupId, currentUserId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    getChatHistory(groupId).then(res => {
      setMessages(res.data.results || res.data);
    }).catch(err => console.error(err));

    const socket = connectChatSocket(groupId, handleIncoming);
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setConnected(false);
    socketRef.current = socket;

    return () => socket.close();
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleIncoming = (data) => {
    if (data.type === 'chat.message') {
      setMessages(prev => [...prev, data]);
      setTypingUsers(prev => {
        const copy = { ...prev };
        delete copy[data.sender.id];
        return copy;
      });
    } else if (data.type === 'chat.typing') {
      setTypingUsers(prev => {
        const copy = { ...prev };
        if (data.is_typing) {
          copy[data.user.id] = data.user.username;
        } else {
          delete copy[data.user.id];
        }
        return copy;
      });
    }
  };

  const handleSend = () => {
    if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    sendChatMessage(socketRef.current, input.trim());
    setInput('');
    sendTypingIndicator(socketRef.current, false);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      sendTypingIndicator(socketRef.current, true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(socketRef.current, false);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const typingNames = Object.values(typingUsers);

  return (
    <>
      <GlobalStyle />
      <Page>
        <BackBtn onClick={onBack}>← Back to group</BackBtn>
        <ChatCard>
          <ChatHeader>
            <ChatTitle>Group Chat</ChatTitle>
            <div>
              <ConnectionDot $connected={connected} />
              <ConnectionLabel>{connected ? 'Connected' : 'Disconnected'}</ConnectionLabel>
            </div>
          </ChatHeader>

          <MessagesArea>
            {messages.length === 0 ? (
              <EmptyState>No messages yet. Say hi.</EmptyState>
            ) : (
              messages.map((msg, i) => {
                const isOwn = (msg.sender?.id || msg.sender_id) === currentUserId;
                return (
                  <MessageBubble key={msg.id || msg.message_id || i} $own={isOwn}>
                    {!isOwn && <SenderName $own={isOwn}>{msg.sender?.username}</SenderName>}
                    <MessageText>{msg.content}</MessageText>
                    <MessageTime $own={isOwn}>
                      {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </MessageTime>
                  </MessageBubble>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </MessagesArea>

          {typingNames.length > 0 && (
            <TypingIndicator>{typingNames.join(', ')} typing...</TypingIndicator>
          )}

          <InputBar>
            <Input
              placeholder="Type a message."
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
            <SendBtn onClick={handleSend} disabled={!connected}>Send</SendBtn>
          </InputBar>
        </ChatCard>
      </Page>
    </>
  );
}