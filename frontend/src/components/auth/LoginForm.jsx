import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthContext from '../../hooks/useAuthContext';
import "../../styles/Auth.css";
import Input from '../common/Input';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError, isAuthenticated } = useAuthContext();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

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
                        <Input
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
                        <Input
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
                        <button type="submit" className="auth-button">
                            {isLoading ? 'Загрузка...' : 'Войти'}
                        </button>
                        {error && <p className="text-red-500 text-center text-sm mt-2 font-medium">{error}</p>}
                    </fieldset>
                </form>
                <div className="auth-footer">
                    Нет аккаунта? <Link to="/register" className="auth-link">Зарегистрируйтесь</Link>
                </div>
            </div>
        </div>
    );
}