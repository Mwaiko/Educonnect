import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createGroup } from '../../api/groups';
import { getTags } from '../../api/tags';

const IconClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCheckLarge = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconHash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconMinus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconPlus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconSearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const Spinner = () => (
  <svg className="group-form-spinner-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function GroupForm({ onClose, onSuccess }) {
  // subject_tag now holds the selected leaf tag's id (uuid), not a
  // hardcoded string. selectedTag mirrors it as the full {id, name,
  // breadcrumb} object purely for display (button label, preview badge).
  const [form, setForm] = useState({ name: '', subject_tag: '', max_members: 8 });
  const [selectedTag, setSelectedTag] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectSearch, setSelectSearch] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [subjectsError, setSubjectsError] = useState(null);

  const modalRef = useRef(null);
  const nameInputRef = useRef(null);
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  const MAX_NAME_LENGTH = 50;
  const colors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B'];

  // Leaf-level tags from the shared taxonomy, fetched once. Flat + a
  // breadcrumb label rather than a 3-level cascade, so the existing
  // searchable dropdown UX doesn't need to change shape.
  useEffect(() => {
    setSubjectsLoading(true);
    getTags({ level: 'tag' })
      .then(res => setSubjects(res.data?.results ?? res.data ?? []))
      .catch(() => setSubjectsError('Could not load subjects.'))
      .finally(() => setSubjectsLoading(false));
  }, []);

  useEffect(() => {
    if (nameInputRef.current) nameInputRef.current.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        const isDirty = form.name || form.subject_tag || form.max_members !== 8;
        if (isDirty && !window.confirm('You have unsaved changes. Close anyway?')) return;
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [form, onClose]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) setSelectOpen(false);
    };
    if (selectOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectOpen]);

  const validate = (fieldName) => {
    const newErrors = {};
    if (!fieldName || fieldName === 'name') {
      if (!form.name.trim()) newErrors.name = 'Group name is required';
      else if (form.name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters';
    }
    if (!fieldName || fieldName === 'subject_tag') {
      if (!form.subject_tag) newErrors.subject_tag = 'Please select a subject';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldErrors = validate(name);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...fieldErrors }));
    }
  };

  const handleSelectSubject = (tag) => {
    setForm(prev => ({ ...prev, subject_tag: tag.id }));
    setSelectedTag(tag);
    setErrors(prev => {
      const next = { ...prev };
      delete next.subject_tag;
      return next;
    });
    setSelectOpen(false);
    setSelectSearch('');
  };

  const handleMemberStep = (delta) => {
    const newVal = Math.max(2, Math.min(20, form.max_members + delta));
    setForm(prev => ({ ...prev, max_members: newVal }));
  };

  const handleSubmit = async () => {
    const allErrors = validate();
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setTouched({ name: true, subject_tag: true });
      return;
    }
    setLoading(true);
    try {
      await createGroup(form);
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (err) {
      setErrors({ general: 'Failed to create group. Please try again.' });
      setLoading(false);
    }
  };

  const isNameValid = form.name.trim().length >= 3 && form.name.trim().length <= MAX_NAME_LENGTH;
  const showNameError = touched.name && errors.name;
  const filteredSubjects = subjects.filter(tag => {
    const haystack = `${tag.name} ${tag.breadcrumb ?? ''}`.toLowerCase();
    return haystack.includes(selectSearch.toLowerCase());
  });

  return createPortal(
    <div className="group-feature-root">
      <div className="group-form-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="group-form-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          {success && (
            <div className="group-form-success-overlay">
              <div className="group-form-success-icon-wrapper"><IconCheckLarge /></div>
              <div className="group-form-success-title">Study group created!</div>
            </div>
          )}

          <div className="group-form-modal-header">
            <div className="group-form-title-wrapper">
              <div className="group-form-title-accent"></div>
              <h2 id="modal-title" className="group-form-modal-title">Create Study Group</h2>
            </div>
            <button className="group-form-close-btn" onClick={onClose} aria-label="Close modal">
              <IconClose />
            </button>
          </div>

          {errors.general && (
            <div className="group-form-general-error" role="alert">
              <IconAlert /><span>{errors.general}</span>
            </div>
          )}

          <div className="group-form-card">
            <div className="group-form-field">
              <label htmlFor="name" className="group-form-label">Group name</label>
              <div className="group-form-input-wrapper">
                <div className="group-form-input-icon"><IconHash /></div>
                <input
                  ref={nameInputRef}
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g. Algorithms Study Group — Week 3"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`group-form-input ${showNameError ? 'has-error' : ''} ${isNameValid && form.name.trim().length > 0 ? 'is-valid' : ''}`}
                  maxLength={MAX_NAME_LENGTH}
                  autoComplete="off"
                />
                <span className={`group-form-char-counter ${form.name.length > MAX_NAME_LENGTH - 5 ? 'near-limit' : ''}`}>
                  {form.name.length}/{MAX_NAME_LENGTH}
                </span>
              </div>
              {showNameError && (
                <div className="group-form-error-container">
                  <IconAlert /><span className="group-form-error-msg">{errors.name}</span>
                </div>
              )}
            </div>

            <div className="group-form-field">
              <label htmlFor="subject_tag" className="group-form-label">Subject</label>
              <div className="group-form-select-wrapper" ref={selectRef}>
                <button
                  id="subject_tag"
                  type="button"
                  onClick={() => setSelectOpen(!selectOpen)}
                  className={`group-form-select-trigger ${form.subject_tag ? 'has-value' : ''} ${touched.subject_tag && errors.subject_tag ? 'has-error' : ''}`}
                >
                  {selectedTag ? selectedTag.name.toUpperCase() : (subjectsLoading ? 'Loading subjects…' : 'Select a subject')}
                  <div className={`group-form-select-arrow ${selectOpen ? 'open' : ''}`}><IconChevronDown /></div>
                </button>

                {selectOpen && (
                  <div className="group-form-dropdown-panel">
                    <div className="group-form-dropdown-search">
                      <IconSearch />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search subjects..."
                        value={selectSearch}
                        onChange={(e) => setSelectSearch(e.target.value)}
                        className="group-form-dropdown-search-input"
                      />
                    </div>
                    {subjectsError ? (
                      <div className="group-form-dropdown-empty">{subjectsError}</div>
                    ) : filteredSubjects.length > 0 ? (
                      filteredSubjects.map((tag) => (
                        <div
                          key={tag.id}
                          onClick={() => handleSelectSubject(tag)}
                          className={`group-form-dropdown-option ${form.subject_tag === tag.id ? 'selected' : ''}`}
                          title={tag.breadcrumb}
                        >
                          {tag.name.toUpperCase()}
                        </div>
                      ))
                    ) : (
                      <div className="group-form-dropdown-empty">
                        {subjectsLoading ? 'Loading…' : 'No subjects found'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {touched.subject_tag && errors.subject_tag && (
                <div className="group-form-error-container">
                  <IconAlert /><span className="group-form-error-msg">{errors.subject_tag}</span>
                </div>
              )}
            </div>

            <div className="group-form-field">
              <label className="group-form-label">Max Members</label>
              <div className="group-form-stepper-row">
                <button type="button" onClick={() => handleMemberStep(-1)} disabled={form.max_members <= 2} className="group-form-stepper-btn">
                  <IconMinus />
                </button>
                <div className="group-form-stepper-value">{form.max_members}</div>
                <button type="button" onClick={() => handleMemberStep(1)} disabled={form.max_members >= 20} className="group-form-stepper-btn">
                  <IconPlus />
                </button>
              </div>
              <p className="group-form-hint-text">Recommended size: 4-8 members for ideal collaboration.</p>
            </div>
          </div>

          <div className="group-form-preview-section">
            <label className="group-form-preview-label">Live Preview</label>
            {form.name.trim() || form.subject_tag ? (
              <div className="group-form-preview-card">
                <div className="group-form-preview-title">{form.name || 'Untitled Study Group'}</div>
                <div className="group-form-preview-meta">
                  {selectedTag && <span className="group-form-badge">{selectedTag.name.toUpperCase()}</span>}
                  <span className="group-form-badge secondary">New Group</span>
                </div>
                <div className="group-form-preview-members">
                  <IconUsers />
                  0 / {form.max_members} members
                  <div className="group-form-avatar-stack">
                    <div className="group-form-avatar" style={{ backgroundColor: colors[0] }}>YO</div>
                    <div className="group-form-avatar" style={{ backgroundColor: colors[1] }}>U</div>
                    <div className="group-form-avatar-more">+{Math.max(0, form.max_members - 2)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="group-form-preview-card empty">
                <div className="group-form-preview-empty-text">Your group will appear here</div>
              </div>
            )}
          </div>

          <div className="group-form-btn-row">
            <button type="button" className="group-form-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="button" className={`group-form-submit-btn ${success ? 'success' : ''}`} onClick={handleSubmit} disabled={loading || success}>
              {loading && !success ? <><Spinner /> Creating...</> : success ? <><IconCheck /> Created!</> : 'Create Group'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}