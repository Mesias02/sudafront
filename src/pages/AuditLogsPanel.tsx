import React, { useState, useEffect } from "react";
import { getAuditLogs, AuditLogDTO, AuditLogFilters } from "../api/auditLogs";
import FilterBar from "../components/FilterBar";
import DataTable from "../components/DataTable";

export default function AuditLogsPanel() {
  const [logs, setLogs] = useState<AuditLogDTO[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogDTO[]>([]);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = localStorage.getItem("token")!;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const filterParams: AuditLogFilters = {};
      if (searchTerm) filterParams.userEmail = searchTerm;
      if (actionFilter) filterParams.action = actionFilter;
      if (startDate) filterParams.from = new Date(startDate).toISOString();
      if (endDate) filterParams.to = new Date(endDate).toISOString();

      const data = await getAuditLogs(filterParams, token);
      setLogs(data);
      setFilteredLogs(data);
    } catch (e) {
      console.error("Error al consultar logs:", e);
      setLogs([]);
      setFilteredLogs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtrado en tiempo real
  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter((log) => {
        const search = searchTerm.toLowerCase();
        return (
          log.userEmail.toLowerCase().includes(search) ||
          (log.action && log.action.toLowerCase().includes(search)) ||
          (log.entity && log.entity.toLowerCase().includes(search)) ||
          (log.details && log.details.toLowerCase().includes(search))
        );
      });
    }

    if (actionFilter) {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    if (startDate) {
      filtered = filtered.filter((log) => new Date(log.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter((log) => new Date(log.timestamp) <= new Date(endDate));
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter, startDate, endDate]);

  const clearFilters = () => {
    setSearchTerm("");
    setActionFilter("");
    setStartDate("");
    setEndDate("");
  };

  const getActionBadge = (action: string) => {
    const actionColors: { [key: string]: string } = {
      'CREATE': '#10b981',
      'UPDATE': '#f59e0b',
      'DELETE': '#ef4444',
      'LOGIN': '#3b82f6',
      'LOGOUT': '#6b7280',
      'VALIDATE': '#8b5cf6',
      'REGISTER': '#06b6d4'
    };
    const color = actionColors[action] || '#6b7280';
    return (
      <span 
        style={{
          background: color,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase'
        }}
      >
        {action}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Fecha y Hora',
      sortable: true,
      width: '180px',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'userEmail',
      label: 'Usuario',
      sortable: true,
      width: '200px'
    },
    {
      key: 'action',
      label: 'Acción',
      sortable: true,
      width: '120px',
      align: 'center' as const,
      render: (value: string) => getActionBadge(value)
    },
    {
      key: 'entity',
      label: 'Entidad',
      sortable: true,
      width: '120px',
      render: (value: string | null) => value || '-'
    },
    {
      key: 'entityId',
      label: 'ID Entidad',
      sortable: true,
      width: '100px',
      align: 'center' as const,
      render: (value: number | null) => value ? value.toString() : '-'
    },
    {
      key: 'details',
      label: 'Detalles',
      render: (value: string | null) => (
        <span style={{ 
          maxWidth: '300px', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block'
        }}>
          {value || '-'}
        </span>
      )
    }
  ];

  // Obtener acciones únicas para el filtro
  const uniqueActions = Array.from(new Set(logs.map(log => log.action).filter(Boolean)));

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#1f2937',
          margin: 0 
        }}>
          📋 Logs de Auditoría
        </h1>
        <button 
          className="btn-primary"
          onClick={fetchLogs}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading"></span>
              Actualizando...
            </>
          ) : (
            <>
              🔄 Actualizar
            </>
          )}
        </button>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por usuario, acción, entidad o detalles..."
        filters={[
          {
            label: 'Acción',
            value: actionFilter,
            options: [
              { value: '', label: 'Todas las acciones' },
              ...uniqueActions.map(action => ({ value: action, label: action }))
            ],
            onChange: setActionFilter
          }
        ]}
        dateFilters={{
          startDate,
          endDate,
          onStartDateChange: setStartDate,
          onEndDateChange: setEndDate
        }}
        onClear={clearFilters}
      />

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ margin: 0, color: '#374151' }}>
            Registros encontrados: <span style={{ color: '#3b82f6' }}>{filteredLogs.length}</span>
          </h3>
          {filteredLogs.length > 0 && (
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Último registro: {formatDate(filteredLogs[0]?.timestamp)}
            </div>
          )}
        </div>
      </div>

      <DataTable
        data={filteredLogs}
        columns={columns}
        loading={loading}
        emptyMessage="No se encontraron logs de auditoría"
        hoverable
        striped
      />

      {!loading && filteredLogs.length === 0 && logs.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '16px',
          marginTop: '16px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ color: '#374151', marginBottom: '8px' }}>No se encontraron resultados</h3>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Intenta ajustar los filtros para encontrar los logs que buscas
          </p>
          <button className="btn-neutral" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
