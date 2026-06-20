import { useContext, createContext } from "react";

/**
 * Placeholder auth context for the forum module.
 *
 * The real implementation lives in Module 1 (Authentication & User
 * Management, feature-auth-profile). It should provide:
 *   { user: { id, username, role, ... } | null, isAuthenticated, ... }
 *
 * This stub lets forum components compile and be developed/tested in
 * isolation before that branch is merged into develop. Replace the
 * import path once the auth module's AuthContext is available.
 */
export const AuthContext = createContext({ user: null, isAuthenticated: false });

export function useAuth() {
  return useContext(AuthContext);
}
