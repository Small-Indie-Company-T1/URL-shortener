import useLinks from '../../hooks/useLinks.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DropdownCard from '../DropdownCard.jsx';
import '../../styles/my-links.css';

export default function MyLinksTab() {
  const { isLoading, getLinks, error, clearError } = useLinks();

  const [linksList, setLinksList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const searchRef = useRef('');
  const [filters, setFilters] = useState({
    is_active: searchParams.get('is_active') || true,
  });
  const filtersRef = useRef({});

  const isUpdating = useRef(false);
  const limit = 9;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const updateLinks = useCallback(async () => {
    const offset = (currentPage - 1) * limit;
    const data = await getLinks({
      offset: offset,
      limit: limit,
      original_url: searchRef.current,
      is_active: filtersRef.current.is_active,
    });

    if (data && data.links && data.links.length > 0) {
      setLinksList(data.links);
      setTotalCount(data.total);
    }
  }, [getLinks, currentPage]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSearchParams({ search: searchRef.current, ...filtersRef.current });
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        await updateLinks();
      }
    },
    [setCurrentPage, currentPage, updateLinks, setSearchParams]
  );

  useEffect(() => {
    const update = async () => {
      if (isUpdating.current) return;
      isUpdating.current = true;
      await updateLinks();
      isUpdating.current = false;
    };
    void update();
  }, [updateLinks]);

  useEffect(() => {
    searchRef.current = search;
    filtersRef.current = filters;
  }, [search, filters]);

  return (
    <div className="links-page-wrapper">
      <div className="links-container">
        <h1 className="links-title">Мои ссылки</h1>

        <div className="links-filters">
          <form className="create-tab__form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={search}
              placeholder={'Искать ссылку...'}
              className="create-tab__input"
              onChange={(e) => {
                setSearch(e.target.value);
                clearError();
              }}
            />
            <DropdownCard
              trigger={
                <span className="material-symbols-outlined">filter_alt</span>
              }
              closeOnClick={false}
            >
              <div className="create-tab__qr-dropdown">
                <input
                  type="checkbox"
                  name="активные"
                  checked={filters.is_active}
                  onChange={(e) => {
                    setFilters({ ...filters, is_active: e.target.checked });
                  }}
                />
                <label>активные</label>
              </div>
              <button
                type="button"
                className="close-dropdown"
                onClick={handleSubmit}
              >
                Apply
              </button>
            </DropdownCard>
          </form>
        </div>
        <div className="links-table-wrapper">
          <div className="links-table">
            <div className="links-table__header">
              <span>#</span>
              <span>Ссылка</span>
              <span>Дата</span>
              <span></span>
            </div>

            <div className="links-list">
              {isLoading ? (
                <div className="links-loading">Загрузка...</div>
              ) : linksList.length === 0 ? (
                <div className="links-loading">У вас пока нет ссылок</div>
              ) : (
                linksList.map((link, index) => (
                  <div key={link.id} className="links-item">
                    <span className="links-item__index">
                      {(currentPage - 1) * limit + index + 1}
                    </span>
                    <span className="links-item__url">
                      <Link to={link.original_url} target="_blank">
                        {link.original_url}
                      </Link>
                    </span>
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
