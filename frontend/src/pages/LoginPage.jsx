import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const LoginPage = () => {
  const navigate = useNavigate();

  return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Вход</h1>

          <div className="auth-form">
            <input
                type="email"
                placeholder="Email"
                className="auth-input"
            />

            <input
                type="password"
                placeholder="Пароль"
                className="auth-input"
            />

            <button
                onClick={() => navigate('/')}
                className="auth-button"
            >
              Войти
            </button>

            <div className="auth-footer">
              Нет аккаунта?{" "}
              <Link to="/register" className="auth-link">
                Зарегистрируйтесь
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;