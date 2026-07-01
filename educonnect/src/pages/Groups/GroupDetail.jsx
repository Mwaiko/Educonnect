import { useState, useEffect } from 'react';
import { getGroup, leaveGroup, createMeetingLink, deleteMeetingLink } from '../../api/groups';

const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
const fmtDateTime = (iso) => iso ? new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : null;

export default function GroupDetail({ groupId, onBack, onOpenChat }) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState('google_meet');
  const [toast, setToast] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const res = await getGroup(groupId);
      setGroup(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  const handleLeave = async () => {
    if (!window.confirm('Leave this study group?')) return;
    try {
      await leaveGroup(groupId);
      onBack();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateLink = async () => {
    setGeneratingLink(true);
    try {
      await createMeetingLink(groupId, { provider });
      showToast('Meeting link added.');
      fetchGroup();
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleDeleteLink = async (linkId) => {
    setDeletingLinkId(linkId);
    try {
      await deleteMeetingLink(groupId, linkId);
      showToast('Link removed.');
      fetchGroup();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingLinkId(null);
    }
  };

  if (loading) {
    return (
      <div className="group-detail-loading">
        <div className="group-detail-spinner"></div>
        Loading group…
      </div>
    );
  }

  if (!group) return <div className="group-detail-loading">Group not found.</div>;

  return (
    <div className="group-feature-root group-detail-page">
      <button className="group-detail-back-btn" onClick={onBack}>
        ← Back to groups
      </button>

      <div className="group-detail-header">
        <h1 className="group-detail-name">{group.name}</h1>
        <div className="group-detail-header-meta">
          {group.subject_tag && <span className="group-detail-header-badge">{group.subject_tag.name.toUpperCase()}</span>}
          <span className="group-detail-header-badge">{group.formation_type}</span>
          {group.is_full && <span className="group-detail-header-badge full">Full</span>}
        </div>

        <div className="group-detail-header-stats">
          <div className="group-detail-stat">
            <span className="group-detail-stat-val">{group.member_count} / {group.max_members}</span>
            <span className="group-detail-stat-label">Members</span>
          </div>
          <div className="group-detail-divider"></div>
          <div className="group-detail-stat">
            <span className="group-detail-stat-val">{group.meeting_links?.length ?? 0}</span>
            <span className="group-detail-stat-label">Active Links</span>
          </div>
        </div>
      </div>

      <div className="group-detail-full-width-card">
        <div className="group-detail-card-title">Group Information</div>
        <div className="group-detail-info-grid">
          <div className="group-detail-info-item">
            <span className="group-detail-info-label">Created By</span>
            <span className="group-detail-info-value">{group.creator?.username || 'Unknown'}</span>
          </div>
          <div className="group-detail-info-item">
            <span className="group-detail-info-label">Created On</span>
            <span className="group-detail-info-value">{fmtDate(group.created_at)}</span>
          </div>
          <div className="group-detail-info-item">
            <span className="group-detail-info-label">Status</span>
            <span className="group-detail-info-value">{group.is_full ? 'Closed (Full)' : 'Open to Join'}</span>
          </div>
        </div>
      </div>

      <div className="group-detail-section-grid">
        {/* Members Card */}
        <div className="group-detail-card">
          <div className="group-detail-card-header">
            <div className="group-detail-card-title">Members</div>
            <span className="group-detail-card-count">{group.members?.length ?? 0}</span>
          </div>
          {group.members?.length > 0 ? (
            group.members.map((m) => {
              const isCreator = m.user?.id === group.creator?.id;
              const initials = m.user?.username ? m.user.username.slice(0, 2).toUpperCase() : 'U';
              return (
                <div key={m.id} className="group-detail-member-row">
                  <div className="group-detail-avatar">{initials}</div>
                  <div className="group-detail-member-info">
                    <span className="group-detail-member-name">{m.user?.username}</span>
                    <span className="group-detail-member-email">{m.user?.email}</span>
                  </div>
                  {isCreator ? (
                    <span className="group-detail-creator-pill">Owner</span>
                  ) : (
                    <span className="group-detail-joined-date">{fmtDate(m.joined_at)}</span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="group-detail-empty-hint">No members yet.</div>
          )}
        </div>

        {/* Meeting Links Card */}
        <div className="group-detail-card">
          <div className="group-detail-card-header">
            <div className="group-detail-card-title">Meeting Links</div>
            <span className="group-detail-card-count">{group.meeting_links?.length ?? 0}</span>
          </div>
          {group.meeting_links?.length > 0 ? (
            group.meeting_links.map((link) => (
              <div key={link.id} className="group-detail-link-row">
                <div className={`group-detail-link-icon ${link.provider}`}>
                  {link.provider === 'zoom' ? '📹' : '💬'}
                </div>
                <div className="group-detail-link-content">
                  <span className={`group-detail-link-provider ${link.provider}`}>
                    {link.provider === 'zoom' ? 'Zoom' : 'Google Meet'}
                  </span>
                  <a href={link.meeting_url} className="group-detail-link-url" target="_blank" rel="noopener noreferrer">
                    {link.meeting_url}
                  </a>
                  {fmtDateTime(link.scheduled_at) && (
                    <span className="group-detail-link-scheduled">📅 {fmtDateTime(link.scheduled_at)}</span>
                  )}
                </div>
                <button
                  className="group-detail-delete-link-btn"
                  title="Remove link"
                  disabled={deletingLinkId === link.id}
                  onClick={() => handleDeleteLink(link.id)}
                >
                  {deletingLinkId === link.id ? '…' : '✕'}
                </button>
              </div>
            ))
          ) : (
            <div className="group-detail-empty-hint">No links yet. Generate one below.</div>
          )}

          <div className="group-detail-generate-row">
            <select className="group-detail-select" value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="google_meet">Google Meet</option>
              <option value="zoom">Zoom</option>
            </select>
            <button className="group-detail-small-primary-btn" onClick={handleGenerateLink} disabled={generatingLink}>
              {generatingLink ? 'Generating…' : '+ Add link'}
            </button>
          </div>
        </div>
      </div>

      <div className="group-detail-action-row">
        <button className="group-detail-primary-btn" onClick={() => onOpenChat(groupId)}>
          💬 Open Chat
        </button>
        <button className="group-detail-danger-btn" onClick={handleLeave}>
          Leave group
        </button>
      </div>

      {toast && <div className="group-detail-toast">✓ {toast}</div>}
    </div>
  );
}