import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
import PasswordInput from './PasswordInput';
import '../../styles/auth.css';

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Регистрация</h1>

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

            <input
              required
              type="text"
              className="auth-input"
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
              <p className="auth-error">{passwordError}</p>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={passwordError !== ''}
            >
              {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
            </button>

            {error && <p className="auth-error">{error}</p>}
          </fieldset>
        </form>

        <div className="auth-footer">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="auth-link">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
