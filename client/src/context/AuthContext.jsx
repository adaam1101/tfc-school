import React, { createContext, useContext, useMemo, useState } from "react";
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

  const persistSession = (data) => {
    localStorage.setItem("tfc_token", data.token);
    localStorage.setItem("tfc_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async ({ email, password, role }) => {
    const { data } = await api.post("/auth/login", { email, password, role });
    // When 2FA is on, the server asks for an emailed code before issuing a token.
    if (data.twoFactorRequired) {
      return { twoFactorRequired: true, email: data.email };
    }
    return { user: persistSession(data) };
  };

  const verifyTwoFactor = async ({ email, code }) => {
    const { data } = await api.post("/auth/verify-2fa", { email, code });
    return persistSession(data);
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data.message;
  };

  const resetPassword = async ({ token, password }) => {
    const { data } = await api.post("/auth/reset-password", { token, password });
    return data.message;
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
      verifyTwoFactor,
      forgotPassword,
      resetPassword,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
