import { toastr } from '../../toastr-config.js';
import DropDownCard from '../DropDownCard.jsx';
import { useCallback, useEffect, useRef, useState } from 'react';

import '../../styles/qr-container.css';

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
      toastr.success('QR-код скопирован в буфер обмена');
    } catch (error) {
      console.error(error.name, error.message);
      if (!error.response?.status) {
        toastr.error('Не удалось скопировать QR-код', 'Ошибка');
      }
    }
  };

  const handleDownloadQr = async (format) => {
    try {
      if (format === 'svg') {
        if (!qrUrl) {
          toastr.error('QR-код ещё не готов', 'Ошибка');
          return;
        }
        const link = document.createElement('a');
        link.href = qrUrl;
        link.download = 'qr.svg';
        link.click();
        toastr.success('QR-код успешно скачан');
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

        toastr.success('QR-код успешно скачан');

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
    <div className="qr-container">
      <div className="qr-container__main-row">
        <p className="qr-container__label">Ваш QR-код:</p>

        <div className="qr-container__image-wrapper">
          <div className="qr-container__image">
            <img src={qrUrl || null} alt="QR Code" />
          </div>
        </div>

        <div className="qr-container__actions">
          <button onClick={handleCopyQr} className="qr-container__btn">
            Копировать
          </button>

          <DropDownCard
            trigger={
              <button className="qr-container__btn">
                Скачать
                <span className="material-symbols-outlined">expand_more</span>
              </button>
            }
          >
            <div className="qr-container__dropdown">
              <button
                className="qr-container__dropdown-item close-dropdown"
                onClick={async () => {
                  await handleDownloadQr('png');
                }}
              >
                PNG
              </button>
              <button
                className="qr-container__dropdown-item close-dropdown"
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
    </div>
  );
}
