import { Navigate } from 'react-router-dom';
import useAuthContext from '../hooks/useAuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
