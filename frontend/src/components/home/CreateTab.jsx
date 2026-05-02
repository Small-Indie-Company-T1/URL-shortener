import { useEffect, useState, useCallback } from 'react';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import useLinks from '../../hooks/useLinks.js';
import '../../styles/CreateTab.css';
import GeneratedLinkPanel from './GeneratedLinkPanel.jsx';
import DropDownCard from '../DropDownCard.jsx';

import '../../styles/CreateTab.css';

export default function CreateTab() {
  const { isLoading, error, create, createQr, clearError } = useLinks();
  const [link, setLink] = useState('');
  const [shortLink, setShortLink] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await create(link);
    if (result && result.short_code) {
      setShortLink({
        short_code: result.short_code,
        link:
          (import.meta.env.VITE_FRONTEND_BASE_URL || '') +
          '/r/' +
          result.short_code,
        id: result.id,
      });
    } else setShortLink({});
  };

  const downloadQr = useCallback(
    async (format) => await createQr(shortLink.short_code, format),
    [createQr, shortLink]
  );

  useEffect(() => {
    if (error) toastr.error(error);
  }, [error]);

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-63px)] flex flex-col items-center justify-center pb-20">
      <div className="create-tab w-full max-w-[1100px] px-8">
        <h1 className="create-tab__title">Создать ссылку</h1>
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
            <button type="submit" className="create-tab__submit-btn">
              Создать
            </button>
          </fieldset>
        </form>
        {shortLink.link && (
          <GeneratedLinkPanel
            shortLink={shortLink.link}
            downloadQr={downloadQr}
          />
        )}
      </div>
    </div>
  );
}
