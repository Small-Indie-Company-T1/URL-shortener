import toastr from 'toastr';
import QrContainer from './QrContainer.jsx';

export default function GeneratedLinkPanel({ shortLink, downloadQr }) {
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
      <QrContainer downloadQr={downloadQr} />
    </div>
  );
}
