import React, { useState } from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
}

export default function DataTable({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = "No hay datos disponibles",
  className = "",
  striped = true,
  hoverable = true
}: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  if (loading) {
    return (
      <div className="data-table-loading">
        <div className="loading-spinner"></div>
        <p>Cargando datos...</p>
        <style>{`
          .data-table-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f4f6;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .data-table-loading p {
            color: #6b7280;
            font-size: 16px;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`data-table-container ${className}`}>
      <div className="table-wrapper">
        <table className={`data-table ${striped ? 'striped' : ''} ${hoverable ? 'hoverable' : ''}`}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ 
                    width: column.width,
                    textAlign: column.align || 'left'
                  }}
                  className={column.sortable ? 'sortable' : ''}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="th-content">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="sort-icons">
                        <svg 
                          className={`sort-icon ${sortColumn === column.key && sortDirection === 'asc' ? 'active' : ''}`}
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg 
                          className={`sort-icon ${sortColumn === column.key && sortDirection === 'desc' ? 'active' : ''}`}
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  <div className="empty-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? 'clickable' : ''}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .data-table-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .data-table th {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 16px 20px;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .data-table th.sortable {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s ease;
        }

        .data-table th.sortable:hover {
          background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
        }

        .th-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .sort-icons {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .sort-icon {
          width: 12px;
          height: 12px;
          color: #9ca3af;
          transition: color 0.2s ease;
        }

        .sort-icon.active {
          color: #3b82f6;
        }

        .data-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
          vertical-align: middle;
        }

        .data-table.striped tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }

        .data-table.hoverable tbody tr:hover {
          background-color: #f3f4f6;
        }

        .data-table tbody tr.clickable {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .data-table tbody tr.clickable:hover {
          background-color: #eff6ff !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: #9ca3af;
        }

        .empty-content svg {
          width: 48px;
          height: 48px;
          stroke-width: 1.5;
        }

        .empty-content p {
          font-size: 16px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .data-table th,
          .data-table td {
            padding: 12px 16px;
          }

          .data-table {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}