import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ role, roles, children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const allowedRoles = roles || [role];
  const fallbackRole = role || allowedRoles[0] || "admin";

  if (!isAuthenticated) {
    return <Navigate to={`/${fallbackRole}/login`} replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}
