import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
import "../../styles/Auth.css";

export default function RegisterForm() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmTouched, setConfirmTouched] = useState(false);

    const { register, isLoading, error, clearError, isAuthenticated } = useAuthContext();
    const navigate = useNavigate();

    const showPasswordMismatch = confirmTouched && password !== confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setConfirmTouched(true);
            return;
        }
        await register(email, name, password);
    };

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
                            placeholder="Email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                clearError();
                            }}
                        />

                        <input
                            required
                            type="text"
                            placeholder="Имя"
                            className="auth-input"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                clearError();
                            }}
                        />

                        <input
                            required
                            type="password"
                            placeholder="Пароль"
                            className="auth-input"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                clearError();
                            }}
                        />

                        <input
                            required
                            type="password"
                            placeholder="Повторите пароль"
                            className="auth-input"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                clearError();
                            }}
                            onBlur={() => setConfirmTouched(true)}
                        />

                         {showPasswordMismatch && (
                            <p className="text-red-500 text-center text-sm -mt-3">Пароли не совпадают</p>
                        )}

                        <button type="submit" className="auth-button">
                            {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
                        </button>

                         {error && (
                            <p className="text-red-500 text-center text-sm mt-2 font-medium">
                                {error}
                            </p>
                        )}
                    </fieldset>
                </form>

                <div className="auth-footer">
                    Уже есть аккаунт?{" "}
                    <Link to="/login" className="auth-link">
                        Войти
                    </Link>
                </div>
            </div>
        </div>
    );
}