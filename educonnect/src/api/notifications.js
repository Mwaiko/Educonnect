import api from './axios';

export const getNotifications = (params) => api.get('/notifications/', { params });

export const markNotificationRead = (id) => api.post(`/notifications/${id}/read/`);

export const markAllNotificationsRead = () => api.post('/notifications/read-all/');

export function connectNotificationSocket(onNotification) {
  const token = localStorage.getItem('access_token');
  const socket = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onNotification(data);
  };

  return socket;
}