import React from 'react';
import { Link } from "react-router-dom";
import './MainPage.css';

const MainPage = () => {
  return (
      <div className="tlink-wrapper">
        <header className="tlink-header">
          <div className="tlink-logo">Tlink</div>
        </header>

        <section className="tlink-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Сервис для создания <br className="hidden md:block" />
              коротких ссылок и QR-кодов
            </h1>
            <p className="hero-subtitle">
              Сократите и упростите свои ссылки
            </p>
            <div className="btn-group">
              <Link to="/register">
                <button className="btn-primary">Создать аккаунт</button>
              </Link>
              <Link to="/login">
                <button className="btn-secondary">Вход</button>
              </Link>
            </div>
          </div>

          <div className="hero-decor">
            <div className="qr-box-large">
              <span className="material-symbols-outlined">qr_code</span>
            </div>
            <div className="qr-box-small">
              <span className="material-symbols-outlined">qr_code_scanner</span>
            </div>
          </div>
        </section>

        <footer className="tlink-footer">
          <div className="step-item">
            <div className="step-number">1</div>
            <span className="step-text">Войдите</span>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <span className="step-text">Вставьте ссылку</span>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <span className="step-text">Пользуйтесь QR и ссылкой</span>
          </div>
        </footer>
      </div>
  );
};

export default MainPage;