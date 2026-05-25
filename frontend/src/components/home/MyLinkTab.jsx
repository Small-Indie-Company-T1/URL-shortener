import { Link, useNavigate, useParams } from 'react-router-dom';
import useLinks from '../../hooks/useLinks.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import QrContainer from './QrContainer.jsx';
import { toastr } from '../../toastr-config.js';
import '../../styles/my-link.css';

export default function MyLinkTab() {
  const { isLoading, error, createQr, deleteLink, getClicks, clearError } =
    useLinks();

  const [isDeleted, setIsDeleted] = useState(false);
  const [clicks, setClicks] = useState({});
  const isUpdating = useRef(false);

  const { shortCode } = useParams();

  const handleDelete = useCallback(async () => {
    clearError();
    const isSuccess = await deleteLink(shortCode);
    if (isSuccess) {
      setIsDeleted(true);
      toastr.success('Ссылка удалена');
    }
  }, [deleteLink, clearError, shortCode]);

  const downloadQr = useCallback(
    async (format) => await createQr(shortCode, format),
    [createQr, shortCode]
  );

  const updateClicks = useCallback(async () => {
    const data = await getClicks(shortCode);
    if (data) {
      setClicks(data);
    }
  }, [getClicks, shortCode]);

  useEffect(() => {
    if (error) toastr.error(error);
  }, [error]);

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
    void update();
  }, [updateClicks]);

  return (
    <div className="link-details-page">
      <Link to="/home/my-links" className="back-link-btn">
        <span className="material-symbols-outlined">arrow_back</span>
      </Link>
      <div className="link-details-wrapper">
        <header className="link-header">
          <a
            href={
              (import.meta.env.VITE_FRONTEND_BASE_URL || '') + '/r/' + shortCode
            }
            className="link-header__url"
            target="_blank"
            rel="noreferrer"
          >
            {(import.meta.env.VITE_FRONTEND_BASE_URL || '') + '/r/' + shortCode}
          </a>
        </header>

        <QrContainer downloadQr={downloadQr} />

        <div className="stats-container">
          <div className="stats-entry">
            <span className="material-symbols-outlined stats-entry__icon">
              visibility
            </span>
            <span className="stats-entry__label">Количество переходов:</span>
            <span className="stats-entry__value">{clicks.clicks_count}</span>
          </div>
          <div className="stats-entry">
            <span className="material-symbols-outlined stats-entry__icon">
              ads_click
            </span>
            <span className="stats-entry__label">Уникальных переходов:</span>
            <span className="stats-entry__value">
              {clicks.unique_ip_clicks_count}
            </span>
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
