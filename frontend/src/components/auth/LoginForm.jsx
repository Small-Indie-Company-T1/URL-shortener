import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

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
  }, [isAuthenticated]);

  return (
    <div>
      <h1>Вход</h1>
      <form onSubmit={handleSubmit}>
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError();
          }}
        />
        <input
          required
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError();
          }}
        />
        <button type="submit">Войти</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}
