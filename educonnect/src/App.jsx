import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth & Profile Pages
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserProfilePage    from "./pages/UserProfilePage";
import EditProfilePage    from "./pages/EditProfilePage";

// The Real Main Dashboard View (imported from your dashboard.jsx)
import MainDashboard      from "./pages/dashboard";

// Resource Management Pages
import ResourceList       from './pages/Resources/ResourceList';
import ResourceForm       from './pages/Resources/ResourceForm';

// Study Group Pages
import GroupList          from './pages/Groups/GroupList';
import GroupDetail        from './pages/Groups/GroupDetail';
import GroupForm          from './pages/Groups/GroupForm';
import ChatRoom            from './pages/Chat/ChatRoom';
import NotificationCenter  from './components/NotificationCenter';

import "./styles/tokens.css";

/* Simple auth guard — checks for JWT */
function RequireAuth({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
}

/* Resources page wrapper with its own add-form modal state */
function DashboardResources() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const handleSuccess = () => setRefreshKey(k => k + 1);

  return (
    <>
      <ResourceList key={refreshKey} onAdd={() => setShowForm(true)} />
      {showForm && (
        <ResourceForm onClose={() => setShowForm(false)} onSuccess={handleSuccess} />
      )}
    </>
  );
}

/* Study Groups page wrapper with list/detail/create-form state */
/* Study Groups page wrapper with list/detail/create-form/chat state */
function DashboardGroups() {
  const [showForm, setShowForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [chatGroupId, setChatGroupId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const handleSuccess = () => setRefreshKey(k => k + 1);
  const currentUserId = localStorage.getItem('user_id') || '';

  if (chatGroupId) {
    return (
      <ChatRoom
        groupId={chatGroupId}
        currentUserId={currentUserId}
        onBack={() => setChatGroupId(null)}
      />
    );
  }

  if (selectedGroupId) {
    return (
      <GroupDetail
        groupId={selectedGroupId}
        onBack={() => setSelectedGroupId(null)}
        onOpenChat={(id) => setChatGroupId(id)}
      />
    );
  }

  return (
    <>
      <GroupList
        key={refreshKey}
        onAdd={() => setShowForm(true)}
        onView={(id) => setSelectedGroupId(id)}
      />
      {showForm && (
        <GroupForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { handleSuccess(); setShowForm(false); }}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Root Redirect straight to Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<MainDashboard />} />

        {/* Protected Resources Sub-Route */}
        <Route path="/resources" element={
          <RequireAuth>
            <DashboardResources />
          </RequireAuth>
        } />

        {/* Protected Study Groups Sub-Route */}
        <Route path="/groups" element={
          <RequireAuth>
            <DashboardGroups />
          </RequireAuth>
        } />

        {/* Protected Profile Routes */}
        <Route path="/profile" element={
          <RequireAuth><UserProfilePage /></RequireAuth>
        } />
        <Route path="/profile/edit" element={
          <RequireAuth><EditProfilePage /></RequireAuth>
        } />

        {/* Default Catch-All Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}