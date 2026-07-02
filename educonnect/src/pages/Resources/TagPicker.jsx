import { useState, useEffect, useCallback } from 'react';
import { getTags } from '../../api/tags';

/**
 * Three-level cascading picker over the shared Tag taxonomy
 * (Category -> Subcategory -> Tag). Mirrors the walk-the-tree pattern the
 * backend was built for: no params = top-level categories, then
 * ?parent=<id> for each next level down.
 *
 * Reports the selected *leaf* tag back to the parent via onChange, since
 * that's the only level Resources are allowed to be tagged with.
 *
 * Props:
 *   value           - currently selected leaf tag id (or null/undefined)
 *   onChange(id, tag) - called with (leafTagId, leafTagObject) on selection,
 *                        or (null, null) when cleared
 *   selectClassName - className applied to each <select>, so this can drop
 *                      into either ResourceForm's or ResourceList's styles
 *   allowClear      - show a "Select a subject" placeholder option
 *                      (default true)
 */
export default function TagPicker({
  value,
  onChange,
  selectClassName = '',
  allowClear = true,
}) {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [leafTags, setLeafTags] = useState([]);

  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');

  const [loadingLevel, setLoadingLevel] = useState(null); // 'category' | 'subcategory' | 'tag' | null
  const [error, setError] = useState(null);

  // Top-level categories, once.
  useEffect(() => {
    setLoadingLevel('category');
    getTags()
      .then(res => setCategories(res.data?.results ?? res.data ?? []))
      .catch(() => setError('Could not load subjects.'))
      .finally(() => setLoadingLevel(null));
  }, []);

  // If a value is passed in from outside (e.g. editing an existing
  // resource) walk back up the tree so category/subcategory pre-fill too.
  useEffect(() => {
    if (!value) return;
    getTags({ level: 'tag' })
      .then(res => {
        const all = res.data?.results ?? res.data ?? [];
        const leaf = all.find(t => t.id === value);
        if (leaf?.parent) {
          setSubcategoryId(leaf.parent);
          getTags({ parent: leaf.parent }).then(r =>
            setLeafTags(r.data?.results ?? r.data ?? [])
          );
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSubcategories = useCallback((parentId) => {
    setLoadingLevel('subcategory');
    getTags({ parent: parentId })
      .then(res => setSubcategories(res.data?.results ?? res.data ?? []))
      .catch(() => setError('Could not load subject areas.'))
      .finally(() => setLoadingLevel(null));
  }, []);

  const loadLeafTags = useCallback((parentId) => {
    setLoadingLevel('tag');
    getTags({ parent: parentId })
      .then(res => setLeafTags(res.data?.results ?? res.data ?? []))
      .catch(() => setError('Could not load tags.'))
      .finally(() => setLoadingLevel(null));
  }, []);

  const handleCategoryChange = (e) => {
    const id = e.target.value;
    setCategoryId(id);
    setSubcategoryId('');
    setSubcategories([]);
    setLeafTags([]);
    onChange(null, null);
    if (id) loadSubcategories(id);
  };

  const handleSubcategoryChange = (e) => {
    const id = e.target.value;
    setSubcategoryId(id);
    setLeafTags([]);
    onChange(null, null);
    if (id) loadLeafTags(id);
  };

  const handleLeafChange = (e) => {
    const id = e.target.value;
    if (!id) {
      onChange(null, null);
      return;
    }
    const tag = leafTags.find(t => t.id === id);
    onChange(id, tag ?? null);
  };

  return (
    <div className="tag-picker" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <select
        className={selectClassName}
        value={categoryId}
        onChange={handleCategoryChange}
        disabled={loadingLevel === 'category'}
      >
        <option value="">
          {loadingLevel === 'category' ? 'Loading subjects…' : 'Select a category'}
        </option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {categoryId && (
        <select
          className={selectClassName}
          value={subcategoryId}
          onChange={handleSubcategoryChange}
          disabled={loadingLevel === 'subcategory'}
        >
          <option value="">
            {loadingLevel === 'subcategory' ? 'Loading…' : 'Select a subcategory'}
          </option>
          {subcategories.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}

      {subcategoryId && (
        <select
          className={selectClassName}
          value={value ?? ''}
          onChange={handleLeafChange}
          disabled={loadingLevel === 'tag'}
        >
          <option value="">
            {loadingLevel === 'tag' ? 'Loading tags…' : 'Select a tag'}
          </option>
          {leafTags.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      )}

      {error && <p className="rf-error-msg">{error}</p>}
    </div>
  );
}