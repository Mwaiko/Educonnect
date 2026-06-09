/* ============================================================
   App.jsx – EduConnect Frontend Router
   Uses React Router v6 (install: npm i react-router-dom)
   ============================================================ */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UserProfilePage    from "./pages/UserProfilePage";
import EditProfilePage    from "./pages/EditProfilePage";
import "./styles/tokens.css";

/* Simple auth guard — replace with real JWT check */
function RequireAuth({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes */}
        <Route path="/profile" element={
          <RequireAuth><UserProfilePage /></RequireAuth>
        } />
        <Route path="/profile/edit" element={
          <RequireAuth><EditProfilePage /></RequireAuth>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
