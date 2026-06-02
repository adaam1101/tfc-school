import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api/http.js";

const AuthContext = createContext(null);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("tfc_user"));
  } catch (_error) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("tfc_token"));
  const [user, setUser] = useState(readUser);

  const login = async ({ email, password, role }) => {
    const { data } = await api.post("/auth/login", { email, password, role });
    localStorage.setItem("tfc_token", data.token);
    localStorage.setItem("tfc_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("tfc_token");
    localStorage.removeItem("tfc_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
