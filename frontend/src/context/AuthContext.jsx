import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../services/api';
import { authService } from '../services/bastion';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  // Restore the session from the saved token ("get current user").
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authService
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setBooting(false));
  }, []);

  // The Axios interceptor fires this event on any 401 response.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('bastion:unauthorized', onUnauthorized);
    return () => window.removeEventListener('bastion:unauthorized', onUnauthorized);
  }, []);

  const startSession = useCallback((data) => {
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (credentials) => startSession(await authService.login(credentials)), [startSession]);
  const register = useCallback(async (payload) => startSession(await authService.register(payload)), [startSession]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* token may already be invalid; clear locally anyway */
    }
    localStorage.removeItem(TOKEN_KEY); // logout always clears the token
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, booting, isAdmin: user?.role === 'admin', login, register, logout }),
    [user, booting, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
