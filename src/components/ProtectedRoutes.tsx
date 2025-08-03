// src/components/ProtectedRoutes.tsx
import { JSX } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface Props {
  allowedRoles?: string[];
  children: JSX.Element;
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const { role } = jwtDecode(token) as { role: string };
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}
