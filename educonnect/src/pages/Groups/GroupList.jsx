import { useState, useEffect } from 'react';
import { getGroups, joinGroup, getMatchedGroups } from '../../api/groups';
import { useTheme } from '../../context/ThemeContext';
import GroupForm from './GroupForm';
import './group.css';

export default function GroupList({ onAdd, onView, onOpenChat }) {
  const { C } = useTheme();
  const [groups, setGroups] = useState([]);
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [showForm, setShowForm] = useState(false);

  const showToast = (msg) => { 
    setToast(msg); 
    setTimeout(() => setToast(''), 3000); 
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      if (tab === 'my') {
        const params = {};
        if (search) params.subject_tag = search;
        const res = await getGroups(params);
        setGroups(res.data.results || res.data);
      } else {
        const res = await getMatchedGroups();
        setMatched(res.data.results || res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchGroups, 300);
    return () => clearTimeout(delay);
  }, [tab, search]);

  const handleJoin = async (e, id) => {
    e.stopPropagation();
    try {
      await joinGroup(id);
      showToast('You joined the group.');
      fetchGroups();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGroupCreated = () => {
    showToast('Study group created.');
    if (tab === 'my') fetchGroups();
  };

  const displayGroups = tab === 'my' ? groups : matched;

  // Map theme values to CSS custom properties
  const themeStyles = {
    '--primary': C.primary,
    '--primary-light': C.primaryLight,
    '--accent': C.accent,
    '--accent-light': C.accentLight,
    '--warning': C.warning,
    '--warning-light': C.warningLight,
    '--white': C.white,
    '--text': C.text,
    '--text-secondary': C.textSecondary,
    '--surface-elevated': C.surfaceElevated,
    '--border': C.border,
    '--input-bg': C.inputBg,
    '--hover-shadow': C.hoverShadow,
  };

  return (
    <div className="group-feature-root group-page" style={themeStyles}>
      <div className="group-topbar">
        <div className="group-title-group">
          <h1 className="group-title">Study Groups</h1>
          <p className="group-subtitle">Connect and collaborate with students who share your interests.</p>
        </div>
        <button className="group-create-btn" onClick={() => setShowForm(true)}>
          + Create Group
        </button>
      </div>

      {/* FIX 1: Explicitly using regular div with class name for reliable CSS targets */}
      <div className="group-controls-row">
        <div className="group-tabs">
          <button 
            className={`group-tab-btn ${tab === 'my' ? 'active' : ''}`} 
            onClick={() => setTab('my')}
          >
            My Groups
          </button>
          <button 
            className={`group-tab-btn ${tab === 'discover' ? 'active' : ''}`} 
            onClick={() => setTab('discover')}
          >
            Discover
          </button>
        </div>

        {tab === 'my' && (
          <input
            className="group-form-input"
            style={{ paddingLeft: '14px', maxWidth: '300px' }}
            placeholder="Filter by subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}
      </div>

      {!loading && displayGroups.length > 0 && (
        <span className="group-member-count" style={{ display: 'block', marginBottom: '1rem' }}>
          {displayGroups.length} group{displayGroups.length !== 1 ? 's' : ''} found
        </span>
      )}

      {loading ? (
        <div className="group-detail-loading">
          <div className="group-detail-spinner" />
          Loading groups…
        </div>
      ) : displayGroups.length === 0 ? (
        <div className="group-form-preview-card empty" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="group-form-preview-empty-text" style={{ fontSize: '15px', marginBottom: '12px' }}>
            {tab === 'my' ? 'No groups joined yet.' : 'No matching groups found.'}
          </p>
          {tab === 'my' && (
            <button className="group-create-btn" onClick={() => setShowForm(true)} style={{ margin: '0 auto' }}>
              + Create Group
            </button>
          )}
        </div>
      ) : (
        <div className="group-grid">
          {displayGroups.map((group) => {
            const pct = Math.round((group.member_count / group.max_members) * 100);
            return (
              <div 
                className="group-card" 
                key={group.id} 
                onClick={() => onView(group.id)}
              >
                <div>
                  <h3 className="group-card-title">{group.name}</h3>
                  <div className="group-card-meta">
                    {group.subject_tag && <span className="group-badge">{group.subject_tag.name.toUpperCase()}</span>}
                    <span className="group-badge cyan">{group.formation_type}</span>
                    {group.is_full && <span className="group-badge amber">Full</span>}
                  </div>
                </div>

                <div>
                  {group.members?.length > 0 && (
                    <div className="group-avatar-stack">
                      {group.members.slice(0, 4).map((m) => {
                        const initials = m.user?.username ? m.user.username.slice(0, 2).toUpperCase() : 'U';
                        return (
                          <div
                            className="group-avatar-stack-item"
                            key={m.id}
                            title={m.user?.username || m.user?.email}
                          >
                            {initials}
                          </div>
                        );
                      })}
                      {group.members.length > 4 && (
                        <div className="group-avatar-stack-item more" title={`${group.members.length - 4} more`}>
                          +{group.members.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="group-capacity-bar">
                    <div 
                      className={`group-capacity-fill ${group.is_full ? 'full' : ''}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>

                  <div className="group-card-footer">
                    <span className="group-member-count">{group.member_count} / {group.max_members} members</span>
                    <div className="group-btn-row" onClick={(e) => e.stopPropagation()}>
                      <button className="group-view-btn" onClick={() => onView(group.id)}>View</button>
                      {tab === 'discover' && (
                        <button
                          className="group-join-btn"
                          onClick={(e) => handleJoin(e, group.id)}
                          disabled={group.is_full}
                        >
                          {group.is_full ? 'Full' : 'Join'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <div className="group-detail-toast">✓ {toast}</div>}

      {showForm && (
        <GroupForm
          onClose={() => setShowForm(false)}
          onSuccess={handleGroupCreated}
        />
      )}
    </div>
  );
}