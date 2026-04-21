import toastr from 'toastr';
import DropDownCard from '../DropDownCard.jsx';
import { useState } from 'react';

export default function GeneratedLinkPanel({ shortLink, qrUrl, downloadQr }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pngBlob, setPngBlob] = useState(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortLink);
      toastr.success('Ссылка скопирована в буфер обмена.');
    } catch (error) {
      console.error(error);
      toastr.error(
        'Не удалось скопировать ссылку. Попробуйте вручную.',
        'Ошибка'
      );
    }
  };

  const handleDownloadQr = async (format) => {
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
          {shortLink || 'short.link'}
        </div>
        <button onClick={handleCopyLink} className="create-tab__action-btn">
          Копировать
        </button>
      </div>
      <div className="create-tab__qr-section">
        <p className="create-tab__label">Ваш QR-код:</p>
        <div className="create-tab__qr-image">
          <img
            style={{ width: '200px', height: '200px' }}
            src={qrUrl || null}
            alt="QR Code"
          />
        </div>
        <div className="create-tab__actions">
          <button
            onMouseEnter={() => setDropdownOpen(true)}
            className="create-tab__action-btn"
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
  );
}
