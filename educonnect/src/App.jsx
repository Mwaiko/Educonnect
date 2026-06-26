import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'; // Import the provider

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

import AskQuestionForm from './pages/forum/AskQuestionForm';
import QuestionDetail from './pages/forum/QuestionDetailPage';

import ForumRoutes from './pages/forum/ForumRoutes';

import "./styles/tokens.css";

function RequireAuth({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
}

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
    <ThemeProvider> {/* Wrapped here to unlock context globally */}
      <BrowserRouter>
        <Routes>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<MainDashboard />} />
          <Route path="/forum/*" element={<ForumRoutes />} />
          <Route path="/resources" element={
            <RequireAuth>
              <DashboardResources />
            </RequireAuth>
          } />

          <Route path="/groups" element={
            <RequireAuth>
              <DashboardGroups />
            </RequireAuth>
          } />

          <Route path="/profile" element={
            <RequireAuth><UserProfilePage /></RequireAuth>
          } />
          <Route path="/profile/edit" element={
            <RequireAuth><EditProfilePage /></RequireAuth>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}