import React from "react";
import { Navigate } from "react-router";
import { getCurrentUser, isAdminAuthed } from "../auth/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const user = getCurrentUser();
  const isAdmin = isAdminAuthed();

  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!user && !adminOnly) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};