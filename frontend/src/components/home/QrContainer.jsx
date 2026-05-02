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
    init();
  }, [initQr]);

  useEffect(() => {
    return () => URL.revokeObjectURL(qrUrl);
  }, [qrUrl]);

  return (
    <div className="create-tab__qr-section">
      <p className="create-tab__label">Ваш QR-код:</p>
      <div className="create-tab__qr-image">
        <img
          style={{ width: '200px', height: '200px' }}
          src={qrUrl || null}
          alt="QR Code"
        />
      </div>
      <div className="create-tab__actions">
        <button onClick={handleCopyQr} className="create-tab__action-btn">
          Копировать
        </button>
        <DropDownCard
          trigger={<button className="create-tab__action-btn">Скачать</button>}
        >
          <div className="create-tab__qr-dropdown">
            <button
              className="create-tab__qr-dropdown__element"
              onClick={async () => {
                await handleDownloadQr('png');
              }}
            >
              PNG
            </button>
            <button
              className="create-tab__qr-dropdown__element"
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
