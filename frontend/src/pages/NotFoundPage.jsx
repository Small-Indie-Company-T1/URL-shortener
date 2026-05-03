import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/not-found.css';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found__card">
        <h1 className="not-found__title">
          40<span className="not-found__title--accent">4</span>
        </h1>
        <p className="not-found__message">К сожалению, такой страницы нет(</p>
        <button onClick={() => navigate('/main')} className="not-found__button">
          На главную
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
