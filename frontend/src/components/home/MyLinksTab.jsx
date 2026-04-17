import useLinks from '../../hooks/useLinks.js';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function MyLinksTab() {
  const { isLoading, error, getLinks, clearError } = useLinks();
  const [linksList, setLinksList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const updateLinks = async () => {
    const offset = (currentPage - 1) * limit;
    const data = await getLinks(offset, limit);
    if (data) {
      setLinksList(data.links || []);
      setTotalCount(data.total || 0);
    }
    setLinksList(links);
  };

  useEffect(() => {
    updateLinks();
  }, [currentPage]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <h1>Мои ссылки</h1>
      {isLoading ? (
        <div>Загрузка...</div>
      ) : (
        <ul>
          {linksList.map((link, index) => (
            <li key={link.id}>
              <p>{(currentPage - 1) * limit + index + 1}</p>
              <p>{link.short_code}</p>
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
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            className={currentPage === pageNum ? 'active' : ''}
            onClick={() => setCurrentPage(pageNum)}
          >
           {pageNum}
          </button>
        ))}
      </div>
    </div>
  );
}
