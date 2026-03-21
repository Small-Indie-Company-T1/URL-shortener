import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);

  const { register, isLoading, error, clearError, isAuthenticated } =
    useAuthContext();

  const showPasswordMismatch = confirmTouched && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setConfirmTouched(true);
      return;
    }
    await register(email, name, password);
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated]);

  return (
    <div>
      <h1>Регистрация</h1>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading}>
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
          ></input>
          <input
            required
            type="text"
            placeholder="Имя"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError();
            }}
          ></input>
          <input
            required
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
          ></input>
          <input
            required
            type="password"
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearError();
            }}
            onBlur={() => setConfirmTouched(true)}
          ></input>
          {showPasswordMismatch && <p>Пароли не совпадают</p>}
          <button type="submit">Зарегистрироваться</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </fieldset>
        <p>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}
