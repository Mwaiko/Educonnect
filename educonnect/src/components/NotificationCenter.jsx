import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { getNotifications, markNotificationRead, markAllNotificationsRead, connectNotificationSocket } from '../api/notifications';

const Wrapper = styled.div`position: relative;`;
const BellBtn = styled.button`
  position: relative;
  background: none; border: none; cursor: pointer;
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  &:hover { background: rgba(255,255,255,0.15); }
`;
const Badge = styled.span`
  position: absolute; top: 2px; right: 2px;
  background: #EF4444; color: #fff;
  font-size: 10px; font-weight: 600;
  min-width: 16px; height: 16px; border-radius: 99px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 3px;
`;
const Dropdown = styled.div`
  position: absolute; top: 44px; right: 0;
  width: 340px; max-height: 420px; overflow-y: auto;
  background: #fff; border: 0.5px solid rgba(79,70,229,0.18);
  border-radius: 12px; box-shadow: 0 8px 24px rgba(30,27,75,0.15);
  z-index: 200;
`;
const DropdownHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 0.5px solid rgba(79,70,229,0.12);
`;
const DropdownTitle = styled.span`font-size: 14px; font-weight: 600; color: #1E1B4B;`;
const MarkAllBtn = styled.button`
  background: none; border: none; color: #4F46E5;
  font-size: 12px; font-weight: 500; cursor: pointer;
  font-family: 'Inter', system-ui, sans-serif;
  &:hover { opacity: 0.75; }
`;
const NotifItem = styled.div`
  display: flex; gap: 10px; padding: 12px 16px;
  border-bottom: 0.5px solid rgba(79,70,229,0.08);
  background: ${({ $read }) => $read ? '#fff' : '#EEF2FF'};
  cursor: pointer;
  &:hover { background: #F8FAFC; }
  &:last-child { border-bottom: none; }
`;
const NotifIcon = styled.div`
  width: 30px; height: 30px; border-radius: 50%;
  background: #4F46E5; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
`;
const NotifText = styled.div`font-size: 13px; color: #1E1B4B; line-height: 1.4;`;
const NotifTime = styled.div`font-size: 11px; color: #6B7280; margin-top: 3px;`;
const EmptyState = styled.div`text-align: center; padding: 2rem; color: #6B7280; font-size: 13px;`;


const TYPE_LABELS = {
  new_answer: (p) => `New answer on "${p.question_title || 'your question'}"`,
  answer_endorsed: (p) => `Your answer was endorsed`,
  answer_accepted: (p) => `Your answer was accepted`,
  group_formed: (p) => `You were added to a study group`,
  meeting_reminder: (p) => `Meeting starting soon`,
  resource_upvote_milestone: (p) => `Your resource reached a vote milestone`,
  chat_message: (p) => `New message in group chat`,
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = connectNotificationSocket((data) => {
      if (data.type === 'notification.new') {
        setNotifications(prev => [{
          id: data.notification_id,
          notification_type: data.notification_type,
          payload: data.payload,
          is_read: false,
          created_at: data.created_at,
        }, ...prev]);
      }
    });

    return () => socket.close();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleItemClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Wrapper ref={wrapperRef}>
      <BellBtn onClick={() => setOpen(!open)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>    
    
        {unreadCount > 0 && <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
      </BellBtn>

      {open && (
        <Dropdown>
          <DropdownHeader>
            <DropdownTitle>Notifications</DropdownTitle>
            {unreadCount > 0 && <MarkAllBtn onClick={handleMarkAll}>Mark all read</MarkAllBtn>}
          </DropdownHeader>

          {notifications.length === 0 ? (
            <EmptyState>No notifications yet.</EmptyState>
          ) : (
            notifications.map(notif => (
              <NotifItem key={notif.id} $read={notif.is_read} onClick={() => handleItemClick(notif)}>
                <NotifIcon>{notif.notification_type.slice(0, 2).toUpperCase()}</NotifIcon>
                <div>
                  <NotifText>
                    {(TYPE_LABELS[notif.notification_type] || (() => notif.notification_type))(notif.payload || {})}
                  </NotifText>
                  <NotifTime>{new Date(notif.created_at).toLocaleString()}</NotifTime>
                </div>
              </NotifItem>
            ))
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
}