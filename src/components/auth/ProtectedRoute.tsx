// src/components/Auth/ProtectedRoute.tsx
import { type ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authApi } from "../../lib/api";
import type { User } from "../../types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("owner" | "customer" | "admin")[];
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const user = await authApi.getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
