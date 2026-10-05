import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('skillsetu_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener('skillsetu-session-expired', expired);
    return () => window.removeEventListener('skillsetu-session-expired', expired);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      updateUser: setUser,
      setSession: (payload) => {
        localStorage.setItem('skillsetu_token', payload.token);
        setUser(payload.user);
      },
      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          localStorage.removeItem('skillsetu_token');
          setUser(null);
        }
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
