import api from './axios';

export const getChatHistory = (groupId) => api.get(`/chat/${groupId}/messages/`);

export function connectChatSocket(groupId, onMessage) {
  const token = localStorage.getItem('access_token');
  const socket = new WebSocket(`ws://localhost:8000/ws/chat/${groupId}/?token=${token}`);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  return socket;
}

export function sendChatMessage(socket, content) {
  socket.send(JSON.stringify({ type: 'chat.message', content }));
}

export function sendTypingIndicator(socket, isTyping) {
  socket.send(JSON.stringify({ type: 'chat.typing', is_typing: isTyping }));
}