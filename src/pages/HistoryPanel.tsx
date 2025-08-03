import { useEffect, useState } from "react";
import { getValidationHistory, ValidationHistory } from "../api/validation";
import FilterBar from "../components/FilterBar";
import DataTable from "../components/DataTable";
import BackButton from "../components/BackButton";

export default function HistoryPanel() {
  const token = localStorage.getItem("token")!;
  const [history, setHistory] = useState<ValidationHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ValidationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      const data = await getValidationHistory(token);
      setHistory(data);
      setFilteredHistory(data);
      setLoading(false);
    };
    loadHistory();
  }, [token]);

  // Filtrado en tiempo real
  useEffect(() => {
    let filtered = history;

    if (searchTerm) {
      filtered = filtered.filter((item) => {
        const search = searchTerm.toLowerCase();
        return (
          item.validatedBy.toLowerCase().includes(search) ||
          item.entityType.toLowerCase().includes(search) ||
          item.entityId.toString().includes(search)
        );
      });
    }

    if (entityFilter) {
      filtered = filtered.filter((item) => item.entityType === entityFilter);
    }

    if (startDate) {
      filtered = filtered.filter((item) => item.validatedAt >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((item) => item.validatedAt <= endDate);
    }

    setFilteredHistory(filtered);
  }, [history, searchTerm, entityFilter, startDate, endDate]);

  const clearFilters = () => {
    setSearchTerm("");
    setEntityFilter("");
    setStartDate("");
    setEndDate("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEntityBadge = (entityType: string) => {
    const config = {
      'TEAM': { color: '#3b82f6', label: 'Equipo', icon: '⚽' },
      'PLAYER': { color: '#10b981', label: 'Jugador', icon: '👤' }
    };
    
    const entity = config[entityType as keyof typeof config] || { color: '#6b7280', label: entityType, icon: '📋' };
    
    return (
      <span 
        style={{
          background: entity.color,
          color: 'white',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {entity.icon} {entity.label}
      </span>
    );
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px',
      align: 'center' as const
    },
    {
      key: 'entityType',
      label: 'Entidad',
      sortable: true,
      width: '120px',
      align: 'center' as const,
      render: (value: string) => getEntityBadge(value)
    },
    {
      key: 'entityId',
      label: 'ID Entidad',
      sortable: true,
      width: '100px',
      align: 'center' as const
    },
    {
      key: 'validatedBy',
      label: 'Validado Por',
      sortable: true
    },
    {
      key: 'validatedAt',
      label: 'Fecha de Validación',
      sortable: true,
      width: '180px',
      render: (value: string) => formatDate(value)
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <BackButton to="/admin/validacion" />
      
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        color: '#ffffff',
        marginBottom: '24px' 
      }}>
        📋 Historial de Validaciones
      </h1>
      
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
            Registros encontrados: <span style={{ color: '#3b82f6' }}>{filteredHistory.length}</span>
          </h3>
          {filteredHistory.length > 0 && (
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Total de validaciones: {history.length}
            </div>
          )}
        </div>
      </div>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por validador, entidad o ID..."
        filters={[
          {
            label: 'Tipo de Entidad',
            value: entityFilter,
            options: [
              { value: '', label: 'Todas las entidades' },
              { value: 'TEAM', label: 'Equipos' },
              { value: 'PLAYER', label: 'Jugadores' }
            ],
            onChange: setEntityFilter
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

      <DataTable
        data={filteredHistory}
        columns={columns}
        loading={loading}
        emptyMessage="No hay registros de validación"
        hoverable
        striped
      />

      {!loading && filteredHistory.length === 0 && history.length > 0 && (
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
            Intenta ajustar los filtros para encontrar el historial que buscas
          </p>
          <button className="btn-neutral" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
