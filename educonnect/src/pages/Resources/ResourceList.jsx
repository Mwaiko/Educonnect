import { useState, useEffect } from 'react';
import { getResources, voteResource, deleteResource } from '../../api/resources';
import { useTheme } from '../../context/ThemeContext';
import TagPicker from './TagPicker';
import './resources.css';

export default function ResourceList({ onAdd }) {
  const { C } = useTheme();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [tagId, setTagId] = useState(null);
  const [resourceType, setResourceType] = useState('');

  // Map dynamic theme variables to CSS custom properties
  const themeStyles = {
    '--c-surface': C.surface,
    '--c-text': C.text,
    '--c-textSecondary': C.textSecondary,
    '--c-primary': C.primary,
    '--c-white': C.white,
    '--c-border': C.border,
    '--c-inputBg': C.inputBg,
    '--c-primaryLight': C.primaryLight,
    '--c-hoverShadow': C.hoverShadow,
    '--c-accentLight': C.accentLight,
    '--c-accent': C.accent,
    '--c-surfaceElevated': C.surfaceElevated,
    '--c-dangerLight': C.dangerLight,
    '--c-danger': C.danger,
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (tagId) params.tag = tagId;
      if (resourceType) params.resource_type = resourceType;
      const res = await getResources(params);
      const list = Array.isArray(res.data?.results)
        ? res.data.results
        : Array.isArray(res.data)
        ? res.data
        : [];
      setResources(list);
      setError(null);
    } catch (err) {
      console.error(err);
      setResources([]);
      setError(
        err?.response?.status === 401
          ? 'You need to be logged in to view resources.'
          : 'Something went wrong loading resources. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchResources, 400);
    return () => clearTimeout(delay);
  }, [search, tagId, resourceType]);

  const handleVote = async (id, value) => {
    try {
      const res = await voteResource(id, value);
      setResources(prev =>
        prev.map(r => r.id === id
          ? { ...r, net_votes: res.data.net_votes, user_vote: res.data.user_vote }
          : r
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await deleteResource(id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={themeStyles} className="resource-list-page">
      <div className="res-top-bar">
        <div className="res-title-group">
          <h1 className="res-page-title">Resource Repository</h1>
          <p className="res-page-sub">Community-ranked study materials, textbooks and articles</p>
        </div>
        <button className="res-add-btn" onClick={onAdd}>+ Add Resource</button>
      </div>

      <div className="res-filter-bar">
        <input
          className="res-search-input"
          placeholder="Search by title or subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <TagPicker
          value={tagId}
          onChange={(id) => setTagId(id)}
          selectClassName="res-select"
        />
        <select className="res-select" value={resourceType} onChange={e => setResourceType(e.target.value)}>
          <option value="">All types</option>
          <option value="textbook">Textbook</option>
          <option value="article">Article</option>
          <option value="video">Video</option>
          <option value="website">Website</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? (
        <div className="res-loading">
          <div className="res-spinner" />
          Loading resources...
        </div>
      ) : error ? (
        <div className="res-empty-state">
          <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--c-text)', marginBottom: '6px' }}>{error}</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="res-empty-state">
          <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--c-text)', marginBottom: '6px' }}>No resources found</p>
          <p style={{ fontSize: '13px', color: 'var(--c-textSecondary)', marginBottom: '1.25rem' }}>Be the first to add a study resource.</p>
          <button className="res-add-btn" onClick={onAdd} style={{ margin: '0 auto' }}>+ Add Resource</button>
        </div>
      ) : (
        <>
          <p className="res-result-count">{resources.length} resource{resources.length !== 1 ? 's' : ''} found</p>
          <div className="res-grid">
            {resources.map(resource => (
              <div className="res-card" key={resource.id}>
                <a className="res-card-title" href={resource.url} target="_blank" rel="noopener noreferrer">
                  {resource.title}
                </a>
                <div className="res-card-meta">
                  {resource.tag && <span className="res-badge" title={resource.tag.breadcrumb}>{resource.tag.name}</span>}
                  {resource.resource_type && <span className="res-type-badge">{resource.resource_type}</span>}
                </div>
                {resource.submitted_by && (
                  <p className="res-submitter">Submitted by {resource.submitted_by.username}</p>
                )}
                <div className="res-card-footer">
                  <div className="res-vote-row">
                    <button 
                      className={`res-vote-btn ${resource.user_vote === 1 ? 'active' : ''}`} 
                      onClick={() => handleVote(resource.id, 1)}
                    >
                      ▲
                    </button>
                    <span className="res-vote-count">{resource.net_votes}</span>
                    <button 
                      className={`res-vote-btn ${resource.user_vote === -1 ? 'active' : ''}`} 
                      onClick={() => handleVote(resource.id, -1)}
                    >
                      ▼
                    </button>
                  </div>
                  <button className="res-delete-btn" onClick={() => handleDelete(resource.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}