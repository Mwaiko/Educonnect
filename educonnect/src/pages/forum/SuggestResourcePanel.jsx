import { useEffect, useRef, useState } from "react";
import { getResources } from "../../api/resources";
import TagPicker from "../Resources/TagPicker";
import "./answerResources.css";

/**
 * SuggestResourcePanel
 * ---------------------------------------------------------------------
 * Lets someone answering a question stage one or more resources to go
 * out alongside their answer — either found via search in the existing
 * repository, or a brand-new one entered on the spot. Nothing is sent to
 * the server here: the parent form collects `staged` resources and
 * attaches each one (via forumApi.suggestAnswerResource) once the answer
 * itself has been created, since a resource suggestion always needs a
 * real answer id to link to.
 *
 * Props:
 *   staged   - array of staged resource descriptors (see shapes below)
 *   onChange - (nextStaged) => void
 *
 * Staged item shapes:
 *   existing: { mode: "existing", key, resource: {...} }
 *   new:      { mode: "new", key, title, url, resource_type, tag_id }
 */

const RESOURCE_TYPES = [
  { value: "textbook", label: "Textbook" },
  { value: "article", label: "Article" },
  { value: "video", label: "Video" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

let keyCounter = 0;
const nextKey = () => `staged-${Date.now()}-${keyCounter++}`;

export default function SuggestResourcePanel({ staged, onChange }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("search"); // "search" | "new"
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    url: "",
    resource_type: "",
    tag_id: null,
  });
  const [newErrors, setNewErrors] = useState({});
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await getResources({ search: query.trim() });
        const list = res?.data?.results || res?.data || [];
        setResults(Array.isArray(list) ? list : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const stagedResourceIds = new Set(
    staged.filter((s) => s.mode === "existing").map((s) => s.resource.id)
  );

  const addExisting = (resource) => {
    if (stagedResourceIds.has(resource.id)) return;
    onChange([...staged, { mode: "existing", key: nextKey(), resource }]);
    setQuery("");
    setResults([]);
  };

  const validateNew = () => {
    const e = {};
    if (!newResource.title.trim()) e.title = "Title is required";
    if (!newResource.url.trim()) e.url = "URL is required";
    else if (!/^https?:\/\//.test(newResource.url)) e.url = "URL must start with http:// or https://";
    return e;
  };

  const addNew = () => {
    const e = validateNew();
    if (Object.keys(e).length) {
      setNewErrors(e);
      return;
    }
    onChange([...staged, { mode: "new", key: nextKey(), ...newResource }]);
    setNewResource({ title: "", url: "", resource_type: "", tag_id: null });
    setNewErrors({});
  };

  const removeStaged = (key) => {
    onChange(staged.filter((s) => s.key !== key));
  };

  return (
    <div className="ares-panel">
      <button
        type="button"
        className="ares-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="ares-toggle-icon">{open ? "−" : "+"}</span>
        Suggest a resource
        {staged.length > 0 && <span className="ares-count-badge">{staged.length}</span>}
      </button>

      {staged.length > 0 && (
        <ul className="ares-staged-list">
          {staged.map((item) => (
            <li key={item.key} className="ares-staged-chip">
              <span className="ares-staged-title">
                {item.mode === "existing" ? item.resource.title : item.title}
              </span>
              {item.mode === "new" && <span className="ares-new-badge">new</span>}
              <button
                type="button"
                className="ares-chip-remove"
                onClick={() => removeStaged(item.key)}
                aria-label={`Remove ${item.mode === "existing" ? item.resource.title : item.title}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div className="ares-body">
          <div className="ares-mode-switch">
            <button
              type="button"
              className={`ares-mode-btn ${mode === "search" ? "active" : ""}`}
              onClick={() => setMode("search")}
            >
              Find existing
            </button>
            <button
              type="button"
              className={`ares-mode-btn ${mode === "new" ? "active" : ""}`}
              onClick={() => setMode("new")}
            >
              Add new
            </button>
          </div>

          {mode === "search" ? (
            <div className="ares-search">
              <input
                type="text"
                className="ares-search-input"
                placeholder="Search resources by title or subject..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {searching && <p className="ares-hint">Searching...</p>}
              {!searching && query.trim() && results.length === 0 && (
                <p className="ares-hint">No matching resources. Try "Add new" instead.</p>
              )}
              {results.length > 0 && (
                <ul className="ares-results-list">
                  {results.map((r) => (
                    <li key={r.id} className="ares-result-item">
                      <div>
                        <div className="ares-result-title">{r.title}</div>
                        {r.tag?.breadcrumb && (
                          <div className="ares-result-tag">{r.tag.breadcrumb}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        className="ares-add-btn"
                        disabled={stagedResourceIds.has(r.id)}
                        onClick={() => addExisting(r)}
                      >
                        {stagedResourceIds.has(r.id) ? "Added" : "Add"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="ares-new-form">
              <div className="ares-field">
                <label className="ares-label" htmlFor="ares-title">Title</label>
                <input
                  id="ares-title"
                  className="ares-input"
                  value={newResource.title}
                  onChange={(e) => setNewResource((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Khan Academy — Chain Rule"
                />
                {newErrors.title && <p className="ares-error">{newErrors.title}</p>}
              </div>
              <div className="ares-field">
                <label className="ares-label" htmlFor="ares-url">URL</label>
                <input
                  id="ares-url"
                  className="ares-input"
                  value={newResource.url}
                  onChange={(e) => setNewResource((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://..."
                />
                {newErrors.url && <p className="ares-error">{newErrors.url}</p>}
              </div>
              <div className="ares-field">
                <label className="ares-label" htmlFor="ares-type">Type</label>
                <select
                  id="ares-type"
                  className="ares-select"
                  value={newResource.resource_type}
                  onChange={(e) => setNewResource((p) => ({ ...p, resource_type: e.target.value }))}
                >
                  <option value="">Select a type</option>
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="ares-field">
                <label className="ares-label">Subject</label>
                <TagPicker
                  value={newResource.tag_id}
                  onChange={(tagId) => setNewResource((p) => ({ ...p, tag_id: tagId }))}
                  selectClassName="ares-select"
                />
              </div>
              <button type="button" className="ares-add-btn ares-add-new-btn" onClick={addNew}>
                Add to answer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}