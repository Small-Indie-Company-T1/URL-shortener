import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import AuthProvider from './components/auth/AuthProvider.jsx';
import { configureToastr } from './toastr-config.js';

if (import.meta.env.VITE_API_MOCKING === 'enabled') {
  const { worker } = await import('./mocks/browser');
  await worker.start();
}

configureToastr();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
