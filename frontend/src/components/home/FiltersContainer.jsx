import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DropdownCard from '../DropDownCard.jsx';
import { toastr } from '../../toastr-config.js';
import RedShakeAnimation from '../RedShakeAnimation.jsx';

import '../../styles/filters-container.css';

export default function FiltersContainer({ applyFilters }) {
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const searchRef = useRef(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    is_active: searchParams.get('is_active') || null,
    order_by: searchParams.get('order_by') || null,
    order_dir: searchParams.get('order_dir') || null,
  });
  const filtersRef = useRef({});

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();
      setError(null);
      const params = {};
      if (searchRef.current && searchRef.current.trim()) {
        if (searchRef.current.trim().length < 3) {
          setError('Слишком короткий запрос. Введите не менее 3 символов.');
          return;
        }
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

  useEffect(() => {
    if (error) {
      toastr.error(error);
    }
  }, [error]);
  return (
    <div className="filters-container-new">
      <form className="filters-form-layout" onSubmit={handleSubmit}>
        <div className="search-bar-wrapper" onFocus={() => setError(null)}>
          <span className="material-symbols-outlined search-icon-left">
            search
          </span>
          <RedShakeAnimation error={error}>
            <input
              type="text"
              value={search}
              placeholder="Искать ссылку..."
              className="search-input-field"
              onChange={(e) => {
                setSearch(e.target.value);
                setError(null);
              }}
            />
          </RedShakeAnimation>
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearch('')}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        <div className="filters-actions-group">
          <DropdownCard
            trigger={
              <button type="button" className="filter-pill-btn">
                <span className="material-symbols-outlined">filter_alt</span>
                <span>
                  {filters.is_active === null
                    ? 'Все ссылки'
                    : filters.is_active
                      ? 'Активные'
                      : 'Неактивные'}
                </span>
              </button>
            }
          >
            <div className="dropdown-options-box close-dropdown">
              <TripleStateCheckbox
                filter={filters.is_active}
                setFilter={(value) =>
                  setFilters((prev) => ({ ...prev, is_active: value }))
                }
              />
            </div>
          </DropdownCard>

          <DropdownCard
            trigger={
              <button type="button" className="filter-pill-btn">
                <span className="material-symbols-outlined">sort</span>
                <span>{getOrderName()}</span>
              </button>
            }
          >
            <div className="dropdown-options-box">
              {sortOptions.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  className={`dropdown-option-item close-dropdown ${
                    option.value.order_by === filters.order_by &&
                    option.value.order_dir === filters.order_dir
                      ? 'is-active'
                      : ''
                  }`}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, ...option.value }))
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </DropdownCard>

          <button type="submit" className="apply-filters-main-btn">
            Применить
          </button>
        </div>
      </form>
    </div>
  );
}

function TripleStateCheckbox({ filter, setFilter }) {
  const options = [
    { label: 'Все ссылки', value: null },
    { label: 'Активные', value: true },
    { label: 'Неактивные', value: false },
  ];

  return (
    <div className="triple-state-list">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          className={`dropdown-option-item ${filter === opt.value ? 'is-active' : ''}`}
          onClick={() => setFilter(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
