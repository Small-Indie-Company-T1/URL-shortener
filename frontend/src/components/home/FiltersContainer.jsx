import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DropdownCard from '../DropDownCard.jsx';

import '../../styles/my-links.css';

export default function FiltersContainer({ applyFilters }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const searchRef = useRef('');
  const [filters, setFilters] = useState({
    is_active: searchParams.get('is_active') || null,
    order_by: searchParams.get('order_by') || null,
    order_dir: searchParams.get('order_dir') || null,
  });
  const filtersRef = useRef({});

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const params = {};
      if (searchRef.current && searchRef.current.trim() !== '') {
        params.search = searchRef.current;
      }
      Object.entries(filtersRef.current).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params[key] = value;
        }
      });
      setSearchParams(params);
      applyFilters();
    },
    [setSearchParams, applyFilters]
  );

  const getOrderName = () => {
    if (filters.order_by === 'created_at' && filters.order_dir === 'asc') {
      return 'Раньше создано';
    }
    if (filters.order_by === 'clicks') {
      if (filters.order_dir === 'asc') return 'Меньше кликов';
      if (filters.order_dir === 'desc') return 'Больше кликов';
    }
    return 'Позже создано';
  };

  const sortOptions = [
    {
      label: 'Позже создано',
      value: { order_by: null, order_dir: null },
    },
    {
      label: 'Раньше создано',
      value: { order_by: 'created_at', order_dir: 'asc' },
    },
    {
      label: 'Меньше кликов',
      value: { order_by: 'clicks', order_dir: 'asc' },
    },
    {
      label: 'Больше кликов',
      value: { order_by: 'clicks', order_dir: 'desc' },
    },
  ];

  useEffect(() => {
    searchRef.current = search;
    filtersRef.current = filters;
  }, [search, filters]);

  return (
    <div className="links__filters">
      <form className="links__form" onSubmit={handleSubmit}>
        <fieldset>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              id="search"
              type="text"
              value={search}
              placeholder={'Искать ссылку...'}
              className="links__search"
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <div className="links__search__btns">
              {search && (
                <>
                  <span
                    className="material-symbols-outlined"
                    onClick={() => setSearch('')}
                  >
                    close
                  </span>
                  <div className="links__search__split"></div>
                </>
              )}
              <button type="submit" className="material-symbols-outlined">
                search
              </button>
            </div>
          </div>
          <DropdownCard
            trigger={
              <button type="button" className="material-symbols-outlined">
                filter_alt
              </button>
            }
          >
            <div className="bg-white p-4 rounded shadow-md flex flex-col gap-2">
              <TripleStateCheckbox
                filter={filters.is_active}
                setFilter={(value) =>
                  setFilters((prev) => ({ ...prev, is_active: value }))
                }
              />
              <DropdownCard
                trigger={
                  <button type="button" className="qr-container__dropdown-item">
                    <span className="material-symbols-outlined">sort</span>
                    {getOrderName()}
                  </button>
                }
              >
                <div className="qr-container__dropdown">
                  {sortOptions
                    .filter((option) => {
                      const isCurrentSelected =
                        option.value.order_by === filters.order_by &&
                        option.value.order_dir === filters.order_dir;
                      return !isCurrentSelected;
                    })
                    .map((option) => (
                      <button
                        key={option.label}
                        className="qr-container__dropdown-item close-dropdown"
                        onClick={async () => {
                          setFilters((prev) => ({
                            ...prev,
                            order_by: option.value.order_by,
                            order_dir: option.value.order_dir,
                          }));
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                </div>
              </DropdownCard>
              <button
                type="button"
                className="close-dropdown"
                onClick={handleSubmit}
              >
                Применить
              </button>
            </div>
          </DropdownCard>
        </fieldset>
      </form>
    </div>
  );
}

function TripleStateCheckbox({ filter, setFilter }) {
  const handleFilterChange = () => {
    if (filter === null) {
      setFilter(true);
    } else if (filter === true) {
      setFilter(false);
    } else {
      setFilter(null);
    }
  };

  const getCheckboxState = () => {
    if (filter === null) return { checked: false, indeterminate: true };
    if (filter === true) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: false };
  };

  const { checked, indeterminate } = getCheckboxState();
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className="qr-container__dropdown-item" onClick={handleFilterChange}>
      <input
        type="checkbox"
        name="активные"
        ref={inputRef}
        checked={checked}
        readOnly
      />
      <label>активные</label>
    </div>
  );
}
