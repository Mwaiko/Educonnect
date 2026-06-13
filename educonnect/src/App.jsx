import { useState } from 'react';
import ResourceList from './pages/Resources/ResourceList';
import ResourceForm from './pages/Resources/ResourceForm';
import GroupList from './pages/Groups/GroupList';
import GroupDetail from './pages/Groups/GroupDetail';
import GroupForm from './pages/Groups/GroupForm';

export default function App() {
  const [page, setPage] = useState('resources');
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => setRefreshKey(k => k + 1);

  const renderPage = () => {
    if (page === 'resources') {
      return (
        <ResourceList
          key={refreshKey}
          onAdd={() => setShowResourceForm(true)}
        />
      );
    }

    if (page === 'groups') {
      if (selectedGroupId) {
        return (
          <GroupDetail
            groupId={selectedGroupId}
            onBack={() => setSelectedGroupId(null)}
          />
        );
      }
      return (
        <GroupList
          key={refreshKey}
          onAdd={() => setShowGroupForm(true)}
          onView={(id) => setSelectedGroupId(id)}
        />
      );
    }
  };

  return (
    <>
      {/* Simple nav */}
      <nav style={{
        background: '#4F46E5', padding: '0 2rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        height: '52px', position: 'sticky', top: 0, zIndex: 50
      }}>
        <span style={{ color: '#fff', fontWeight: 600, fontSize: '15px', fontFamily: 'Inter, sans-serif' }}>
          EduConnect
        </span>
        <div style={{ display: 'flex', gap: '4px', marginLeft: '1rem' }}>
          {[
            { key: 'resources', label: 'Resources' },
            { key: 'groups', label: 'Study Groups' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => { setPage(item.key); setSelectedGroupId(null); }}
              style={{
                background: page === item.key ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: '#fff', border: 'none', padding: '6px 14px',
                borderRadius: '6px', fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {renderPage()}

      {showResourceForm && (
        <ResourceForm
          onClose={() => setShowResourceForm(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showGroupForm && (
        <GroupForm
          onClose={() => setShowGroupForm(false)}
          onSuccess={() => { handleSuccess(); setShowGroupForm(false); }}
        />
      )}
    </>
  );
}