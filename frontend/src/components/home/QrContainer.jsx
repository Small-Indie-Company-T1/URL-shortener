import toastr from 'toastr';
import DropDownCard from '../DropDownCard.jsx';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function QrContainer({ downloadQr }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
      toastr.success('QR copied to clipboard.');
    } catch (error) {
      console.error(error.name, error.message);
      toastr.error('Failed to copy');
    }
  };

  const handleDownloadQr = async (format) => {
    if (format === 'svg') {
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = 'qr.svg';
      link.click();
    }
    if (format === 'png') {
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

      URL.revokeObjectURL(url);
    }
  };

  const initQr = useCallback(async () => {
    const blob = await downloadQr('svg');
    if (blob) {
      const url = URL.createObjectURL(blob);
      setQrUrl(url);
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

  // useEffect(() => {
  //   return () => URL.revokeObjectURL(qrUrl);
  // }, []);

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
        <button
          onMouseEnter={() => setDropdownOpen(true)}
          className="create-tab__action-btn"
        >
          Скачать
        </button>
        {dropdownOpen && (
          <DropDownCard
            onMouseLeave={() => setDropdownOpen(false)}
            data={[
              <button onClick={() => handleDownloadQr('png')}>PNG</button>,
              <button onClick={() => handleDownloadQr('svg')}>SVG</button>,
            ]}
          />
        )}
      </div>
    </div>
  );
}
