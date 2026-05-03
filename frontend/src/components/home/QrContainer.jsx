import { toastr } from '../../toastr-config.js';
import DropDownCard from '../DropDownCard.jsx';
import { useCallback, useEffect, useRef, useState } from 'react';

import '../../styles/create-tab.css';

export default function QrContainer({ downloadQr }) {
  const [pngBlob, setPngBlob] = useState(null);
  const [qrUrl, setQrUrl] = useState('');
  const isInit = useRef(false);

  const handleCopyQr = async () => {
    try {
      let blob = pngBlob;
      if (!blob) {
        blob = await downloadQr('png');
        setPngBlob(blob);
      }
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      toastr.success('QR-код скопирован в буфер обмена.');
    } catch (error) {
      console.error(error.name, error.message);
      if (!error.response?.status) {
        toastr.error('Не удалось скопировать QR-код.', 'Ошибка');
      }
    }
  };

  const handleDownloadQr = async (format) => {
    try {
      if (format === 'svg') {
        if (!qrUrl) {
          toastr.error('QR-код ещё не готов.', 'Ошибка');
          return;
        }
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = 'qr.svg';
        link.click();
        toastr.success('QR-код успешно скачан.');
      } else if (format === 'png') {
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

        toastr.success('QR-код успешно скачан.');

        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Ошибка скачивания QR:', error.message);
    }
  };

  const initQr = useCallback(async () => {
    try {
      const blob = await downloadQr('svg');
      if (blob) {
        const url = URL.createObjectURL(blob);
        setQrUrl(url);
      }
    } catch (error) {
      console.error('Ошибка инициализации QR:', error.message);
    }
  }, [downloadQr]);

  useEffect(() => {
    const init = async () => {
      if (isInit.current) return;
      isInit.current = true;
      await initQr();
      isInit.current = false;
    };
    void init();
  }, [initQr]);

  useEffect(() => {
    return () => URL.revokeObjectURL(qrUrl);
  }, [qrUrl]);

  return (
      <div className="create-tab__qr-section flex flex-col items-center">
        <p className="create-tab__label text-slate-500 mb-4 font-medium">Ваш QR-код:</p>
        <div className="create-tab__qr-image bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <img
              className="w-[200px] h-[200px] block"
              src={qrUrl || null}
              alt="QR Code"
          />
        </div>
        <div className="create-tab__actions flex gap-3 mt-6">
          {/* Кнопка "Копировать" - вторичная (светлая) */}
          <button
              onClick={handleCopyQr}
              className="create-tab__action-btn px-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Копировать
          </button>

          <DropDownCard
              trigger={
                <button className="create-tab__action-btn px-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95 text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-md flex items-center gap-2">
                  Скачать
                  <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </button>
              }
          >
            <div className="create-tab__qr-dropdown bg-white border border-slate-200 rounded-2xl shadow-xl py-2 min-w-[100px] mt-2 overflow-hidden flex flex-col">
              <button
                  className="create-tab__qr-dropdown__element w-full px-4 py-3 text-center text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-none bg-transparent cursor-pointer text-base font-bold tracking-wide"
                  onClick={async () => {
                    await handleDownloadQr('png');
                  }}
              >
                PNG
              </button>
              <div className="h-[1px] bg-slate-100 mx-2"></div> {/* Тонкая линия-разделитель */}
              <button
                  className="create-tab__qr-dropdown__element w-full px-4 py-3 text-center text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-none bg-transparent cursor-pointer text-base font-bold tracking-wide"
                  onClick={async () => {
                    await handleDownloadQr('svg');
                  }}
              >
                SVG
              </button>
            </div>
          </DropDownCard>
        </div>
      </div>
  );
}