import useLinks from '../../hooks/useLinks.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/MyLinks.css';

const MOCK_LINKS = [
  {
    id: 1,
    short_code: 'qa2LmN',
    original_url:
      'https://github.com/arina/project-tlink-very-long-url-example',
    created_at: '2026-04-28T12:00:00Z',
  },
  {
    id: 2,
    short_code: '3xKp9R',
    original_url: 'https://webstorm.com/work/setup',
    created_at: '2026-04-27T15:30:00Z',
  },
  {
    id: 3,
    short_code: 'dQw4w9',
    original_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    created_at: '2026-04-25T09:15:00Z',
  },
];

export default function MyLinksTab() {
  const { isLoading, getLinks } = useLinks();
  const [linksList, setLinksList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const isUpdating = useRef(false);
  const limit = 7;

  const updateLinks = useCallback(async () => {
    const offset = (currentPage - 1) * limit;
    const data = await getLinks(offset, limit);

    if (data && data.links && data.links.length > 0) {
      setLinksList(data.links);
      setTotalCount(data.total);
    } else {
      setLinksList(MOCK_LINKS);
      setTotalCount(MOCK_LINKS.length);
    }
  }, [getLinks, currentPage]);

  useEffect(() => {
    const update = async () => {
      if (isUpdating.current) return;
      isUpdating.current = true;
      await updateLinks();
      isUpdating.current = false;
    };
    update();
  }, [updateLinks]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="links-page-wrapper">
      <div className="links-container">
        <h1 className="links-title">Мои ссылки</h1>

        <div className="links-table-wrapper">
          <div className="links-table">
            <div className="links-table__header">
              <span>#</span>
              <span>Ссылка</span>
              <span>Дата</span>
              <span></span>
            </div>

            <div className="links-list">
              {isLoading && linksList.length === 0 ? (
                <div className="links-loading">Загрузка...</div>
              ) : (
                linksList.map((link, index) => (
                  <div key={link.id} className="links-item">
                    <span className="links-item__index">
                      {(currentPage - 1) * limit + index + 1}
                    </span>
                    <span className="links-item__url">{link.original_url}</span>
                    <span className="links-item__date">
                      {link.created_at
                        .substring(0, 10)
                        .split('-')
                        .reverse()
                        .join('.')}
                    </span>
                    <Link
                      to={`/home/my-links/${link.short_code}`}
                      state={{ link }}
                      className="links-item__more"
                    >
                      <span className="material-symbols-outlined">
                        more_horiz
                      </span>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="links-footer">
          <div className="links-stats-pill">
            <span className="stats-label">Ссылок:</span>
            <span className="stats-value">{totalCount}</span>
            <span className="stats-divider">•</span>
            <span className="stats-label">Страница</span>
            <span className="stats-value">
              {currentPage}/{totalPages}
            </span>
          </div>

          <div className="links-pagination">
            <button
              className="pag-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              className="pag-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
