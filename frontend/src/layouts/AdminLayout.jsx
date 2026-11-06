import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Layout protegido: sin sesion se redirige al login
export function AdminLayout({ children }) {
  const { auth } = useAuth();
  if (auth === undefined) return null; // todavia se esta verificando el token
  if (!auth) return <Navigate to="/login" replace />;
  return <div>{children}</div>;
}
