import { Navigate, useNavigate } from 'react-router-dom';

const MainPage = () => {
  const navigate = useNavigate();
  return (
    <div className="main-container">
      {/* Верхняя навигационная панель */}
      <header className="header">
        <div className="logo">Tlink</div>
      </header>

      {/* Основной синий блок */}
      <section className="hero-section">
        <h1 className="hero-title">
          Сервис для создания
          <br />
          коротких ссылок и QR-кодов
        </h1>
        <p className="hero-subtitle">Сократите и упростите свои ссылки</p>

        {/* Декоративные блоки с QR-кодами */}
        <div className="decor-block-1">
          {/* ТЕПЕРЬ ЗДЕСЬ ОБЫЧНЫЙ QR-КОД (БЫЛ СЗАДИ) */}
          <span className="material-symbols-outlined qr-icon qr-icon-front">
            qr_code
          </span>
        </div>
        <div className="decor-block-2">
          {/* ТЕПЕРЬ ЗДЕСЬ СКАНЕР (БЫЛ СПЕРЕДИ) */}
          <span className="material-symbols-outlined qr-icon qr-icon-back">
            qr_code_scanner
          </span>
        </div>

        {/* Кнопки действий */}
        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={() => navigate('/register')}
          >
            Создать аккаунт
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/login')}
          >
            Вход
          </button>
        </div>
      </section>

      {/* Нижняя секция с пошаговой инструкцией */}
      <footer className="steps-section">
        <div className="step-item">
          <div className="step-circle">1</div>
          <span className="step-text">Войдите</span>
        </div>

        <div className="step-item">
          <div className="step-circle">2</div>
          <span className="step-text">Вставьте ссылку</span>
        </div>

        <div className="step-item">
          <div className="step-circle">3</div>
          <span className="step-text">
            Пользуйтесь QR-кодом и короткой ссылкой
          </span>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
