import { useState } from 'react';
import { createResource } from '../../api/resources';
import './resources.css';

export default function ResourceForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', url: '', resource_type: '', tag: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.url.trim()) e.url = 'URL is required';
    else if (!/^https?:\/\//.test(form.url)) e.url = 'URL must start with http:// or https://';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await createResource(form);
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err) {
      setErrors({ general: 'Failed to submit resource. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rf-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rf-modal">
        <div className="rf-modal-header">
          <h2 className="rf-modal-title">Add a resource</h2>
          <button className="rf-close-btn" onClick={onClose}>✕</button>
        </div>

        {success && <div className="rf-success-msg">✓ Resource submitted successfully!</div>}
        {errors.general && <p className="rf-error-msg" style={{ marginBottom: '1rem' }}>{errors.general}</p>}

        <div className="rf-field">
          <label className="rf-label" htmlFor="title">Title</label>
          <input
            className="rf-input"
            id="title" name="title"
            placeholder="e.g. Introduction to Algorithms (CLRS)"
            value={form.title} onChange={handleChange}
          />
          {errors.title && <p className="rf-error-msg">{errors.title}</p>}
        </div>

        <div className="rf-field">
          <label className="rf-label" htmlFor="url">URL</label>
          <input
            className="rf-input"
            id="url" name="url" placeholder="https://..."
            value={form.url} onChange={handleChange}
          />
          {errors.url && <p className="rf-error-msg">{errors.url}</p>}
        </div>

        <div className="rf-field">
          <label className="rf-label" htmlFor="resource_type">Type</label>
          <select className="rf-select" id="resource_type" name="resource_type" value={form.resource_type} onChange={handleChange}>
            <option value="">Select a type</option>
            <option value="textbook">Textbook</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="website">Website</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="rf-field">
          <label className="rf-label" htmlFor="tag">Subject</label>
          <select className="rf-select" id="tag" name="tag" value={form.tag} onChange={handleChange}>
            <option value="">Select a subject</option>
            <option value="algorithms">Algorithms</option>
            <option value="mathematics">Mathematics</option>
            <option value="data-structures">Data Structures</option>
            <option value="databases">Databases</option>
            <option value="networks">Networks</option>
          </select>
        </div>

        <div className="rf-btn-row">
          <button className="rf-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="rf-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Resource'}
          </button>
        </div>
      </div>
    </div>
  );
}