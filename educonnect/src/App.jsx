import { useState } from 'react';
import ResourceList from './pages/Resources/ResourceList';
import ResourceForm from './pages/Resources/ResourceForm';

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => setRefreshKey(k => k + 1);

  return (
    <>
      <ResourceList
        key={refreshKey}
        onAdd={() => setShowForm(true)}
      />
      {showForm && (
        <ResourceForm
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}