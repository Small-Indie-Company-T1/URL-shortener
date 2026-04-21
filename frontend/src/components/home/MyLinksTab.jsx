import useLinks from '../../hooks/useLinks.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MyLinksTab() {
  const { isLoading, error, getLinks, clearError } = useLinks();
  const [linksList, setLinksList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const isUpdating = useRef(false);
  const limit = 10;

  const updateLinks = useCallback(async () => {
    const offset = (currentPage - 1) * limit;
    const data = await getLinks(offset, limit);
    if (data) {
      setLinksList(data.links || []);
      setTotalCount(data.total || 0);
    }
  }, [getLinks, setLinksList, setTotalCount, currentPage]);

  useEffect(() => {
    const update = async () => {
      if (isUpdating.current) return;
      isUpdating.current = true;
      await updateLinks();
      isUpdating.current = false;
    };

    update();
  }, [updateLinks]);

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
              <p>{'http://localhost/r/' + link.short_code}</p>
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
          <button key={pageNum} onClick={() => setCurrentPage(pageNum)}>
            {pageNum}
          </button>
        ))}
      </div>
    </div>
  );
}
