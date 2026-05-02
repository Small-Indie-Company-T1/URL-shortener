import toastr from 'toastr';
import QrContainer from './QrContainer.jsx';

export default function GeneratedLinkPanel({ shortLink, downloadQr }) {
  const handleCopyLink = async () => {
    if (!shortLink) return;
    try {
      await navigator.clipboard.writeText(shortLink);
      toastr.success('Ссылка скопирована в буфер обмена.');
    } catch (error) {
      toastr.error('Не удалось скопировать ссылку.', 'Ошибка');
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
      <QrContainer downloadQr={downloadQr} />
    </div>
  );
}
