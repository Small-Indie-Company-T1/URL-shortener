import toastr from 'toastr';
import DropDownCard from '../DropDownCard.jsx';
import { useState } from 'react';

export default function GeneratedLinkPanel({ shortLink, qrUrl, downloadQr }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pngBlob, setPngBlob] = useState(null);

  const handleCopyLink = async () => {
    if (!shortLink) return;
    try {
      await navigator.clipboard.writeText(shortLink);
      toastr.success('Ссылка скопирована в буфер обмена.');
    } catch (error) {
      toastr.error('Не удалось скопировать ссылку.', 'Ошибка');
    }
  };

  const handleDownloadQr = async (format) => {
    if (!downloadQr && format === 'png') return;
    if (!qrUrl && format === 'svg') return;

    if (format === 'svg') {
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = 'qr.svg';
      link.click();
    }
    if (format === 'png') {
      let blob = pngBlob;
      if (!blob) {
        blob = await downloadQr();
        setPngBlob(blob);
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qr.png';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
      <div className="create-tab__result-card">
        <div className="create-tab__row">
          <p className="create-tab__label">Ваша ссылка:</p>
          <div className="create-tab__display-field">
          <span style={{ color: shortLink ? '#2C2C2C' : '#89939E' }}>
            {shortLink || 'Short.link'}
          </span>
          </div>
          <button
              onClick={handleCopyLink}
              className="create-tab__action-btn"
              style={{ opacity: shortLink ? 1 : 0.5 }}
          >
            Копировать
          </button>
        </div>

        <div className="create-tab__qr-section">
          <p className="create-tab__label">Ваш QR-код:</p>

          <div className="create-tab__qr-image-wrapper">
            <div className="create-tab__qr-image" style={{ margin: '0 auto' }}>
              {qrUrl ? (
                  <img
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      src={qrUrl}
                      alt="QR Code"
                  />
              ) : (
                  <div className="qr-placeholder">
                <span className="material-symbols-outlined" style={{ fontSize: '100px', color: '#D7E7F2' }}>
                  qr_code_2
                </span>
                  </div>
              )}
            </div>

            <div className="create-tab__actions">
              <button
                  className="create-tab__action-btn"
                  style={{ opacity: qrUrl ? 1 : 0.5 }}
                  onClick={() => { if(qrUrl) toastr.info('Функция копирования QR скоро будет доступна'); }}
              >
                Копировать
              </button>

              <button
                  onMouseEnter={() => qrUrl && setDropdownOpen(true)}
                  className="create-tab__action-btn"
                  style={{ opacity: qrUrl ? 1 : 0.5 }}
              >
                Скачать
              </button>

              {dropdownOpen && (
                  <DropDownCard
                      onMouseLeave={() => setDropdownOpen(false)}
                      data={[
                        <button onClick={() => handleDownloadQr('png')}>PNG</button>,
                        <button onClick={() => handleDownloadQr('svg')}>SVG</button>,
                      ]}
                  />
              )}
            </div>
          </div>
        </div>
      </div>
  );
}