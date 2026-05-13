import { Navigate } from 'react-router-dom';
import useAuthContext from '../hooks/useAuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isInitialized, isAuthenticated } = useAuthContext();

  if (!isInitialized) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to="/main" replace />;
  }

  return children;
}
