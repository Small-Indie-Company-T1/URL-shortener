import { useLocation, useNavigate } from 'react-router-dom';
import useLinks from '../../hooks/useLinks.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import QrContainer from './QrContainer.jsx';

export default function MyLinkTab() {
  const { isLoading, createQr, deleteLink, getClicks } = useLinks();
  const [isDeleted, setIsDeleted] = useState(false);
  const [clicks, setClicks] = useState([]);
  const isUpdating = useRef(false);

  const location = useLocation();
  const link = location.state?.link;

  const handleDelete = useCallback(async () => {
    setIsDeleted(await deleteLink(link.short_code));
  }, [setIsDeleted, deleteLink, link]);

  const downloadQr = useCallback(
    async (format) => await createQr(link.short_code, format),
    [createQr, link]
  );

  const updateClicks = useCallback(async () => {
    const data = await getClicks(link.id);
    if (data) {
      setClicks(data.clicks);
    }
  }, [getClicks, setClicks, link]);

  const navigate = useNavigate();
  useEffect(() => {
    if (isDeleted) {
      navigate('/home/my-links', { replace: true });
    }
  }, [isDeleted, navigate]);

  useEffect(() => {
    const update = async () => {
      if (isUpdating.current) return;
      isUpdating.current = true;
      await updateClicks();
      isUpdating.current = false;
    };
    update();
  }, [updateClicks]);

  return (
    <div className="link-details-page">
      <div className="link-details-wrapper">
        <header className="link-header">
          <a
            href={'http://localhost:5173/' + link.short_code}
            className="link-header__url"
            target="_blank"
            rel="noreferrer"
          >
            {'http://localhost:5173/' + link.short_code}
          </a>
        </header>

        <div className="qr-section-card">
          <div className="qr-section-card__content">
            <p className="qr-section-card__text">Ваш QR-код:</p>
            <div className="qr-section-card__image-box">
              <span className="material-symbols-outlined">qr_code_2</span>
            </div>
            <div className="qr-section-card__actions">
              <button className="qr-btn-action primary">Скачать</button>
              <button className="qr-btn-action outline">Копировать</button>
            </div>
          </div>
        </div>

        <div className="stats-container">
          <div className="stats-entry">
            <span className="material-symbols-outlined stats-entry__icon">
              visibility
            </span>
            <span className="stats-entry__label">Количество переходов:</span>
            <span className="stats-entry__value">хх</span>
          </div>
          <div className="stats-entry">
            <span className="material-symbols-outlined stats-entry__icon">
              ads_click
            </span>
            <span className="stats-entry__label">Уникальных переходов:</span>
            <span className="stats-entry__value">хх</span>
          </div>
        </div>

        <footer className="link-footer-actions">
          <button
            className="delete-action-btn"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <span className="material-symbols-outlined">delete</span>
            {!isLoading ? 'Удалить ссылку' : 'Удаление...'}
          </button>
        </footer>
      </div>
    </div>
  );
}
