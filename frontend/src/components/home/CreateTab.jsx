import { useEffect, useState } from 'react';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import useLinks from '../../hooks/useLinks.js';
import '../../styles/CreateTab.css';
import DropDownCard from '../DropDownCard.jsx';

import '../../styles/CreateTab.css';

export default function CreateTab() {
  const { isLoading, error, create, createQr, clearError } = useLinks();
  const [link, setLink] = useState('');
  const [shortLink, setShortLink] = useState({});
  const [qrUrl, setQrUrl] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pngBlob, setPngBlob] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await create(link);
    if (result && result.short_code) {
      setShortLink({
        short_code: result.short_code,
        link: (import.meta.env.VITE_FRONTEND_BASE_URL || 'localhost:5173') + '/r/' + result.short_code,
        id: result.id,
      });
      setPngBlob(null);
      const blob = await createQr(result.short_code, 'svg');
      if (blob) {
        const url = URL.createObjectURL(blob);
        setQrUrl(url);
      }
    } else setShortLink({});
  };

  const handleDownloadQr = async (format) => {
    if (!shortLink.short_code) return;

    try {
      let url;
      let filename = `qr_${shortLink.short_code}.${format}`;

      if (format === 'svg') {
        url = qrUrl;
      } else {
        let blob = pngBlob;
        if (!blob) {
          blob = await createQr(shortLink.short_code, 'png');
          setPngBlob(blob);
        }
        url = URL.createObjectURL(blob);
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (format === 'png') setTimeout(() => URL.revokeObjectURL(url), 100);

      setDropdownOpen(false);
    } catch (err) {
      toastr.error('Ошибка при скачивании QR-кода');
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toastr.success('Скопировано в буфер обмена');
    } catch (err) {
      toastr.error('Ошибка копирования');
    }
  };

  useEffect(() => {
    if (error) toastr.error(error);
  }, [error]);

  useEffect(() => {
    return () => URL.revokeObjectURL(qrUrl);
  }, [qrUrl]);
  // ... (логика без изменений)

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-63px)] flex flex-col items-center justify-center pb-20">
      <div className="create-tab w-full max-w-[1100px] px-8">
        <h1>Создать ссылку</h1>
        <form onSubmit={handleSubmit} className="create-tab__form">
          <fieldset disabled={isLoading}>
            <input
              type="text"
              placeholder="Введите URL"
              value={link}
              className="create-tab__input"
              onChange={(e) => {
                setLink(e.target.value);
                clearError();
              }}
            />
            <button type="submit">Создать</button>
          </fieldset>
        </form>
        {shortLink.link && (
          <GeneratedLinkPanel
            shortLink={shortLink.link}
            qrUrl={qrUrl}
            downloadQr={async () => await createQr(shortLink.short_code, 'png')}
          />
        )}
      </div>
    </div>
  );
}