import { useLocation, useNavigate } from 'react-router-dom';
import useLinks from '../../hooks/useLinks.js';
import { useCallback, useEffect, useState } from 'react';

export default function MyLinkTab() {
  const { isLoading, deleteLink } = useLinks();
  const [isDeleted, setIsDeleted] = useState(false);

  const location = useLocation();
  const link = location.state.link;

  const handleDelete = useCallback(async () => {
    setIsDeleted(await deleteLink(link.short_code));
  }, [setIsDeleted, deleteLink, link]);

  const navigate = useNavigate();

  useEffect(() => {
    if (isDeleted) {
      navigate('/home/my-links', { replace: true });
    }
  }, [isDeleted, navigate]);

  return (
    <div>
      <p>{'https://localhost:5173/' + link.short_code}</p>
      <p>{link.original_url}</p>
      <div>
        <p>Your QR-code:</p>
      </div>
      <h1>Stats</h1>
      <button onClick={handleDelete} disabled={isLoading}>
        {!isLoading ? 'Удалить ссылку' : 'Удаление...'}
      </button>
    </div>
  );
}
