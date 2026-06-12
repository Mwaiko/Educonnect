/* ============================================================
   App.jsx – EduConnect Frontend Router & App Entry
   ============================================================ */
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth & Profile Pages
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserProfilePage    from "./pages/UserProfilePage";
import EditProfilePage    from "./pages/EditProfilePage";

// Resource Management Pages (Your temporary Dashboard)
import ResourceList       from './pages/Resources/ResourceList';
import ResourceForm       from './pages/Resources/ResourceForm';

import "./styles/tokens.css";

/* Simple auth guard — checks for JWT */
function RequireAuth({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
}

/* Wrapper component to handle resource view states */
function DashboardResources() {
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Dashboard / Resource Management */}
        <Route path="/" element={
          <RequireAuth>
            <DashboardResources />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}