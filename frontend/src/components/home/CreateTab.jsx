import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toastr } from '../../toastr-config.js';
import useLinks from '../../hooks/useLinks.js';
import GeneratedLinkPanel from './GeneratedLinkPanel.jsx';

import '../../styles/create-tab.css';

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
    <div className="create-tab">
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
      <AnimatePresence>
        {shortLink.link && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GeneratedLinkPanel
              shortLink={shortLink.link}
              downloadQr={downloadQr}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
