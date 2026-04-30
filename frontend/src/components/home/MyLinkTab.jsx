import { useLocation, useNavigate } from 'react-router-dom';
import useLinks from '../../hooks/useLinks.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import QrContainer from './QrContainer.jsx';

export default function MyLinkTab() {
  const { isLoading, createQr, deleteLink, getClicks } = useLinks();
  const [isDeleted, setIsDeleted] = useState(false);
  const [clicks, setClicks] = useState([]);
  const isUpdating = useRef(false);

  const location = useLocation();
  const link = location.state?.link;

  const handleDelete = useCallback(async () => {
    setIsDeleted(await deleteLink(link.short_code));
  }, [setIsDeleted, deleteLink, link]);

  const downloadQr = useCallback(
    async (format) => await createQr(link.short_code, format),
    [createQr, link]
  );

  const updateClicks = useCallback(async () => {
    const data = await getClicks(link.id);
    if (data) {
      setClicks(data.clicks);
    }
  }, [getClicks, setClicks, link]);

  const navigate = useNavigate();
  useEffect(() => {
    if (isDeleted) {
      navigate('/home/my-links', { replace: true });
    }
  }, [isDeleted, navigate]);

  useEffect(() => {
    const update = async () => {
      if (isUpdating.current) return;
      isUpdating.current = true;
      await updateClicks();
      isUpdating.current = false;
    };
    update();
  }, [updateClicks]);

  return (
    <div>
      <p>{'http://localhost:5173/' + link.short_code}</p>
      <p>{link.original_url}</p>
      <QrContainer downloadQr={downloadQr} />
      <div>
        <ul>
          {clicks.map((item, index) => (
            <li key={index}>{item.ip_address}</li>
          ))}
        </ul>
      </div>
      <button onClick={handleDelete} disabled={isLoading}>
        <span className="material-symbols-outlined">delete</span>
        {!isLoading ? 'Удалить ссылку' : 'Удаление...'}
      </button>
    </div>
  );
}
