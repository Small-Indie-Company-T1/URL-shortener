import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
import PasswordInput from './PasswordInput';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [confirmTouched, setConfirmTouched] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { register, isLoading, error, clearError, isAuthenticated } =
    useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setConfirmTouched(true);
      setPasswordError('Пароли не совпадают');
      return;
    }
    await register(email, name, password);
  };

  useEffect(() => {
    if (password !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
    } else if (password.length < 8) {
      setPasswordError('Пароль должен быть не менее 8 символов');
    } else if (password.length > 128) {
      setPasswordError('Пароль должен быть не более 128 символов');
    } else if (password !== password.trim()) {
      setPasswordError(
        'Пароль не должен начинаться или заканчиваться пробелами'
      );
    } else {
      setPasswordError('');
    }
  }, [password, confirmPassword]);

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
          />

          <input
            required
            type="text"
            placeholder="Никнейм"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clearError();
            }}
          />

          <PasswordInput
            password={password}
            placeholder={'Пароль'}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
          />

          <PasswordInput
            password={confirmPassword}
            placeholder={'Подтвердите пароль'}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearError();
            }}
            onBlur={() => {
              setConfirmTouched(true);
            }}
          />

          {confirmTouched && passwordError && (
            <p style={{ color: 'red' }}>{passwordError}</p>
          )}
          <button type="submit" disabled={passwordError !== ''}>
            Зарегистрироваться
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </fieldset>
        <p>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </div>
  );
}
