import { useEffect, useState } from 'react';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import useLinks from '../../hooks/useLinks.js';
import GeneratedLinkPanel from './GeneratedLinkPanel.jsx';

export default function CreateTab() {
  const { isLoading, error, create, createQr, clearError } = useLinks();
  const [link, setLink] = useState('');
  const [shortLink, setShortLink] = useState({});
  const [qrUrl, setQrUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { short_code, id } = await create(link);
    if (short_code) {
      setShortLink({
        short_code: short_code,
        link: (import.meta.env.VITE_FRONTEND_BASE_URL || '') + '/' + short_code,
        id: id,
      });
      const blob = await createQr(short_code, 'svg');
      if (!error) {
        const url = URL.createObjectURL(blob);
        setQrUrl(url);
      }
    } else setShortLink({});
  };

  useEffect(() => {
    if (error) {
      toastr.error(error);
    }
  }, [error]);

  useEffect(() => {
    return () => URL.revokeObjectURL(qrUrl);
  }, []); // called when component unmounts

  return (
    <div>
      <h1>Создать ссылку</h1>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={isLoading}>
          <input
            type="text"
            placeholder="Введите URL"
            value={link}
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
  );
}
