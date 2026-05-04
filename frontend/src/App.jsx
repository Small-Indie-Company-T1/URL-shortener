import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainPage from './pages/MainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx';
import CreateTab from './components/home/CreateTab.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MyLinksTab from './components/home/MyLinksTab.jsx';
import MyLinkTab from './components/home/MyLinkTab.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx'; // Импорт твоей новой страницы

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
          <Route path="my-links" element={<MyLinksTab />} />
          <Route path="my-links/*" element={<MyLinkTab />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
