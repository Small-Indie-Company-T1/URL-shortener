import { useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { setupInterceptors } from '../../utils/authApi';

import AuthContext from '../../context/AuthContext';

export default function AuthProvider({ children }) {
  const auth = useAuth();

  useEffect(() => {
    setupInterceptors();
  }, []);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
