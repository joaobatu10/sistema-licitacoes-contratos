import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  const isValidToken =
    token && token !== "undefined" && token !== "null" && token.trim() !== "";

  if (!isValidToken) {
    // opcional: guarda de onde veio pra voltar depois do login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
