import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Регистрация</h1>

          <div className="auth-form">
            <input
                type="email"
                placeholder="Email"
                className="auth-input"
            />

            <input
                type="password"
                placeholder="Придумайте пароль"
                className="auth-input"
            />

            <input
                type="password"
                placeholder="Повторите пароль"
                className="auth-input"
            />

            <button
                onClick={() => navigate('/')}
                className="auth-button"
            >
              Зарегистрироваться
            </button>

            <div className="auth-footer">
              Уже есть аккаунт?{" "}
              <Link to="/login" className="auth-link">
                Войти
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RegisterPage;