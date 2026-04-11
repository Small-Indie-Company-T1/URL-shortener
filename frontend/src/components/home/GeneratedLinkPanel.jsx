import toastr from 'toastr';

export default function GeneratedLinkPanel({ shortLink, qrUrl }) {
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
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div>
      <p>Ваша ссылка:</p>
      <textarea placeholder="Сокращённая ссылка" value={shortLink} readOnly />
      <button onClick={handleCopyLink}>Копировать</button>
      <p>Ваш qr:</p>
      <img
        style={{ width: '200px', height: '200px' }}
        src={qrUrl || null}
        alt="QR Code"
      />
      <button onClick={() => handleDownloadQr('svg')}>Скачать</button>
    </div>
  );
}
