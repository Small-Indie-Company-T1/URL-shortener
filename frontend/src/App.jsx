import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import CreateTab from './components/home/CreateTab.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainPage from './pages/MainPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/home/create" />} />
          <Route path="create" element={<CreateTab />} />
          <Route path="my-links" element={<div>Мои ссылки</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
