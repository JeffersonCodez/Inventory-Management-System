import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, restoring } = useAuth();

  // Wait for the token-restoration check to finish before deciding — otherwise
  // a page refresh briefly bounces to /login even when the session is valid.
  if (restoring) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return children;
}
