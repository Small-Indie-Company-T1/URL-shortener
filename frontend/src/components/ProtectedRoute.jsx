import { Navigate } from 'react-router-dom';
import useAuthContext from '../hooks/useAuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuthContext();

  if (isLoading) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/main" replace />;
  }

  return children;
}
