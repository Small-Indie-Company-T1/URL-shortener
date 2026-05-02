import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
import PasswordInput from './PasswordInput.jsx';
import '../../styles/auth.css';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isLoading, error, clearError, isAuthenticated } =
    useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Вход</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <fieldset disabled={isLoading} className="contents">
            <input
              required
              type="email"
              className="auth-input"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
            />

            <PasswordInput
              placeholder="Пароль"
              password={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
            />
            <button type="submit" className="auth-button">
              {isLoading ? 'Загрузка...' : 'Войти'}
            </button>
            {error && <p className="auth-error">{error}</p>}
          </fieldset>
        </form>
        <div className="auth-footer">
          Нет аккаунта?{' '}
          <Link to="/register" className="auth-link">
            Зарегистрируйтесь
          </Link>
        </div>
      </div>
    </div>
  );
}
