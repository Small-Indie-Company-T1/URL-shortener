import useLinks from '../../hooks/useLinks.js';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function MyLinksTab() {
  const { isLoading, error, getLinks, clearError } = useLinks();
  const [linksList, setLinksList] = useState([]);

  const updateLinks = useCallback(async () => {
    const { links } = await getLinks(0, 10);
    setLinksList(links);
  }, [getLinks]);

  useEffect(() => {
    const updateList = async () => await updateLinks();
    updateList();
  }, [updateLinks]);

  return (
    <div>
      <h1>Мои ссылки</h1>
      {isLoading ? (
        <div>Загрузка...</div>
      ) : (
        <ul>
          {linksList.map((link, index) => (
            <li key={link.id}>
              <p>{index + 1}</p>
              <p>{'https://localhost:5173/' + link.short_code}</p>
              <p>{link.original_url}</p>
              <p>{link.created_at.substring(0, 10)}</p>
              <Link
                to={`/home/my-links/${link.short_code}`}
                state={{ link: link }}
              >
                ...
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
