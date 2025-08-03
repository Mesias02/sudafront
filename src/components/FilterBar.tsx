import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  dateFilters?: {
    startDate: string;
    endDate: string;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
  };
  onClear?: () => void;
  className?: string;
}

export default function FilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  dateFilters,
  onClear,
  className = ""
}: FilterBarProps) {
  return (
    <div className={`filter-bar ${className}`}>
      <div className="filter-bar-content">
        {/* Búsqueda principal */}
        <div className="search-container">
            <label className="filter-label">Buscar</label>  {/* ← AQUÍ EL NOMBRE */}
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="clear-search-btn"
                type="button"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filtros dropdown */}
        {filters.length > 0 && (
          <div className="filters-container">
            {filters.map((filter, index) => (
              <div key={index} className="filter-select-wrapper">
                <label className="filter-label">{filter.label}</label>
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className="filter-select"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Filtros de fecha */}
        {dateFilters && (
          <div className="date-filters-container">
            <div className="date-filter-wrapper">
              <label className="filter-label">Desde</label>
              <input
                type="date"
                value={dateFilters.startDate}
                onChange={(e) => dateFilters.onStartDateChange(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-filter-wrapper">
              <label className="filter-label">Hasta</label>
              <input
                type="date"
                value={dateFilters.endDate}
                onChange={(e) => dateFilters.onEndDateChange(e.target.value)}
                className="date-input"
              />
            </div>
          </div>
        )}

        {/* Botón limpiar filtros */}
        {onClear && (
          <button onClick={onClear} className="clear-filters-btn">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Limpiar filtros
          </button>
        )}
      </div>

      <style>{`
        .filter-bar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .filter-bar-content {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
        }

        .search-container {
          flex: 1;
          min-width: 280px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          width: 20px;
          height: 20px;
          color: #6b7280;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border: 2px solid transparent;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .clear-search-btn {
          position: absolute;
          right: 8px;
          width: 24px;
          height: 24px;
          border: none;
          background: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .clear-search-btn:hover {
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
        }

        .clear-search-btn svg {
          width: 16px;
          height: 16px;
        }

        .filters-container {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-select-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 160px;
        }

        .filter-label {
          font-size: 14px;
          font-weight: 500;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .filter-select {
          padding: 10px 12px;
          border: 2px solid transparent;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
        }

        .date-filters-container {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .date-filter-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 140px;
        }

        .date-input {
          padding: 10px 12px;
          border: 2px solid transparent;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .date-input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
        }

        .clear-filters-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .clear-filters-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .clear-filters-btn svg {
          width: 16px;
          height: 16px;
        }

        @media (max-width: 768px) {
          .filter-bar-content {
            flex-direction: column;
            align-items: stretch;
          }

          .search-container {
            min-width: auto;
          }

          .filters-container,
          .date-filters-container {
            justify-content: stretch;
          }

          .filter-select-wrapper,
          .date-filter-wrapper {
            flex: 1;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}