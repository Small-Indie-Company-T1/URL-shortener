import { useEffect, useState } from 'react';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import useLinks from '../../hooks/useLinks.js';
import '../../styles/CreateTab.css';

export default function CreateTab() {
  const { isLoading, error, create, createQr, clearError } = useLinks();
  const [link, setLink] = useState('');
  const [shortLink, setShortLink] = useState({});
  const [qrUrl, setQrUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await create(link);
    if (result && result.short_code) {
      setShortLink({
        short_code: result.short_code,
        link: (import.meta.env.VITE_FRONTEND_BASE_URL || 'localhost:5173') + '/' + result.short_code,
        id: result.id,
      });
      const blob = await createQr(result.short_code, 'svg');
      if (blob) {
        const url = URL.createObjectURL(blob);
        setQrUrl(url);
      }
    } else setShortLink({});
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

          <form onSubmit={handleSubmit} className="create-tab__form w-full mb-12 flex gap-4">
            <input
                type="text"
                className="create-tab__input flex-1 h-[60px] text-lg px-6 rounded-xl border border-[#89939E]"
                placeholder="Вставьте ссылку"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                disabled={isLoading}
            />
            <button type="submit" className="create-tab__submit-btn w-[222px] h-[60px] text-xl font-bold bg-[#2D53A5] text-white rounded-xl" disabled={isLoading}>
              {isLoading ? '...' : 'Создать'}
            </button>
          </form>

          <div className="create-tab__result-card min-h-[380px] w-full bg-[#D7E7F2] rounded-3xl p-12 shadow-sm border border-[#B0C4DE]">

            <div className="create-tab__row flex items-center gap-8 mb-14">
              <span className="create-tab__label text-2xl font-bold whitespace-nowrap text-[#0B1120]">Ваша ссылка:</span>
              <div className="create-tab__display-field flex-1 bg-white h-[55px] rounded-xl flex items-center px-6 border border-[#89939E] text-lg">
                {shortLink.link || "Short.link"}
              </div>
              <button
                  onClick={() => shortLink.link && handleCopy(shortLink.link)}
                  className="create-tab__action-btn w-[222px] h-[55px] bg-[#2D53A5] text-white rounded-xl font-bold shrink-0"
              >
                Копировать
              </button>
            </div>

            <div className="create-tab__qr-section flex flex-row items-center justify-between">
              <span className="create-tab__label text-2xl font-bold text-[#0B1120]">Ваш QR-код:</span>

              {/* QR-код по центру */}
              <div className="create-tab__qr-image w-[220px] h-[220px] bg-white border border-[#89939E] rounded-2xl flex items-center justify-center p-5 mx-auto">
                {qrUrl ? (
                    <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                    <div className="w-full h-full bg-[#D9D9D9] flex items-center justify-center rounded-lg">
                      <span className="text-gray-400 text-sm">QR Code</span>
                    </div>
                )}
              </div>

              <div className="create-tab__actions flex flex-col gap-5">
                <button className="create-tab__action-btn w-[222px] h-[55px] bg-[#2D53A5] text-white rounded-xl font-bold">
                  Копировать
                </button>
                <button className="create-tab__action-btn w-[222px] h-[55px] bg-[#2D53A5] text-white rounded-xl font-bold">
                  Скачать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}