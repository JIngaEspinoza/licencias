import { Navigate, Outlet } from "react-router-dom";
import { auth } from "../auth/auth";

export default function AdminProtected() {
  const user = auth.current();

  // No logueado
  if (!user) return <Navigate to="/login" replace />;

  // Logueado pero sin rol ADMIN
  if (!user.roles?.includes("ADMIN")) return <Navigate to="/" replace />;

  // Autorizado
  return <Outlet />;
}