import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.js';
import { getToken } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);

  // On load, if a token survived a page refresh (it's in localStorage),
  // try to restore the session instead of forcing a re-login.
  useEffect(() => {
    async function restore() {
      if (!getToken()) {
        setRestoring(false);
        return;
      }
      try {
        const restoredUser = await authApi.me();
        setUser(restoredUser);
      } catch {
        // token expired/invalid — clear it and fall back to the login screen
        await authApi.logout();
      } finally {
        setRestoring(false);
      }
    }
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { user: loggedInUser } = await authApi.login({ email, password });
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirming a signup OTP returns the same { token, user } shape as
  // login(), so it's handled identically here — the person is logged in
  // the instant their email is verified, no separate login step needed.
  const verifySignupOtp = useCallback(async (email, code) => {
    setLoading(true);
    try {
      const { user: verifiedUser } = await authApi.verifySignupOtp({ email, code });
      setUser(verifiedUser);
      return verifiedUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      restoring,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      verifySignupOtp,
      logout,
    }),
    [user, loading, restoring, login, verifySignupOtp, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
