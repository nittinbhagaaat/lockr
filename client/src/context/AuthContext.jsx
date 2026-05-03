/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/services";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load — verify token is still valid by calling /auth/me
  useEffect(() => {
    const token = localStorage.getItem("lockr_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authAPI
      .getMe()
      .then(({ data }) => setUser(data))
      .catch(() => {
        // Token invalid or expired — clear it
        localStorage.removeItem("lockr_token");
        localStorage.removeItem("lockr_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("lockr_token", data.token);
    localStorage.setItem("lockr_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem("lockr_token", data.token);
    localStorage.setItem("lockr_user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("lockr_token");
    localStorage.removeItem("lockr_user");
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const { data } = await authAPI.updateMe(updates);
    // Merge new data but keep existing token
    const updated = { ...user, ...data, token: user.token };
    localStorage.setItem("lockr_user", JSON.stringify(updated));
    setUser(updated);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
