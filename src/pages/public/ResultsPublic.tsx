import { useEffect, useState } from "react";
import { getMatches, getMatchStats, MatchDTO, MatchStatsDTO, validateMatch, cancelValidation } from "../../api/matches";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import FilterBar from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";

interface TokenPayload {
  sub: string;
  role: string;
}

export default function ResultsPublic() {
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const token = localStorage.getItem("token");
  const role = token ? jwtDecode<TokenPayload>(token).role : null;
  const navigate = useNavigate();
  const location = useLocation();

  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState<MatchStatsDTO | null>(null);
  const [modalMatch, setModalMatch] = useState<MatchDTO | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchMatches = () => {
    setLoading(true);
    getMatches().then((data) => {
      let filtered;
      if (role === "ADMIN") {
        filtered = data.filter((m) => m.status === "COMPLETED");
      } else {
        filtered = data.filter((m) => m.status === "COMPLETED" && m.validated);
      }
      setMatches(filtered);
      setFilteredMatches(filtered);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchMatches();

    if (location.state && (location.state as any).refresh) {
      window.history.replaceState({}, document.title);
    }

    const interval = setInterval(() => {
      fetchMatches();
    }, 15000);

    return () => clearInterval(interval);
  }, [location.state]);

  // Filtrado en tiempo real
  useEffect(() => {
    let filtered = matches;

    if (searchTerm) {
      filtered = filtered.filter((m) => {
        const search = searchTerm.toLowerCase();
        return (
          m.homeTeamName.toLowerCase().includes(search) ||
          m.awayTeamName.toLowerCase().includes(search) ||
          m.location.toLowerCase().includes(search)
        );
      });
    }

    if (statusFilter === "validated") {
      filtered = filtered.filter((m) => m.validated);
    } else if (statusFilter === "not_validated") {
      filtered = filtered.filter((m) => !m.validated);
    }

    if (startDate) {
      filtered = filtered.filter((m) => m.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((m) => m.date <= endDate);
    }

    setFilteredMatches(filtered);
  }, [matches, searchTerm, statusFilter, startDate, endDate]);

  const openModal = async (match: MatchDTO) => {
    setShowModal(true);
    setModalMatch(match);
    setStats(null);
    setStatsLoading(true);
    try {
      const data = await getMatchStats(match.id);
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setStats(null);
    setModalMatch(null);
  };

  const handleValidate = async (m: MatchDTO) => {
    try {
      await validateMatch(m.id, token!);
      fetchMatches();
    } catch {
      alert("Error al validar el partido");
    }
  };

  const handleCancelValidation = async (m: MatchDTO) => {
    if (!window.confirm("¿Seguro que deseas cancelar la validación?")) return;
    try {
      await cancelValidation(m.id, token!);
      fetchMatches();
    } catch {
      alert("Error al cancelar validación");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
  };

  const columns = [
    {
      key: 'date',
      label: 'Fecha',
      sortable: true,
      width: '120px'
    },
    {
      key: 'time',
      label: 'Hora',
      width: '140px',
      render: (_: any, match: MatchDTO) => 
        `${match.startTime.slice(0, 5)} - ${match.endTime.slice(0, 5)}`
    },
    {
      key: 'homeTeamName',
      label: 'Local',
      sortable: true
    },
    {
      key: 'awayTeamName',
      label: 'Visitante',
      sortable: true
    },
    {
      key: 'score',
      label: 'Marcador',
      align: 'center' as const,
      width: '120px',
      render: (_: any, match: MatchDTO) => (
        <span style={{ 
          fontWeight: 'bold', 
          fontSize: '16px',
          color: '#1f2937'
        }}>
          {(match.homeScore != null && match.awayScore != null) 
            ? `${match.homeScore} - ${match.awayScore}` 
            : "-"
          }
        </span>
      )
    },
    {
      key: 'location',
      label: 'Lugar',
      sortable: true
    },
    {
      key: 'validated',
      label: 'Estado',
      align: 'center' as const,
      width: '120px',
      render: (validated: boolean) => (
        <StatusBadge 
          status={validated ? 'VALIDATED' : 'NOT_VALIDATED'} 
          size="sm" 
        />
      )
    }
  ];

  // Agregar columna de acciones solo para admin
  if (role === "ADMIN") {
    columns.push({
      key: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      width: '200px',
      render: (_: any, match: MatchDTO) => (
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {!match.validated && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleValidate(match); }}
              style={{
                padding: '4px 8px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Validar
            </button>
          )}
          {match.validated && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleCancelValidation(match); }}
              style={{
                padding: '4px 8px',
                background: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          )}
          {!match.validated && (
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/my-matches/${match.id}/events`); }}
              style={{
                padding: '4px 8px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Editar
            </button>
          )}
        </div>
      )
    });
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        color: '#1f2937',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        Resultados de Partidos
      </h1>

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por equipos o lugar..."
        filters={[
          {
            label: 'Estado',
            value: statusFilter,
            options: [
              { value: '', label: 'Todos los estados' },
              { value: 'validated', label: 'Validados' },
              { value: 'not_validated', label: 'Sin validar' }
            ],
            onChange: setStatusFilter
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
        data={filteredMatches}
        columns={columns}
        onRowClick={openModal}
        loading={loading}
        emptyMessage="No hay resultados disponibles"
        hoverable
        striped
      />

      {showModal && modalMatch && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 50,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '16px',
              textAlign: 'center',
              color: '#1f2937'
            }}>
              {modalMatch.homeTeamName} {modalMatch.homeScore} - {modalMatch.awayScore} {modalMatch.awayTeamName}
            </h3>
            
            <div style={{ marginBottom: '16px', color: '#6b7280' }}>
              <p><strong>Estado:</strong> {modalMatch.validated ? "Validado" : "Sin validar"}</p>
              <p><strong>Lugar:</strong> {modalMatch.location}</p>
              <p><strong>Fecha y hora:</strong> {modalMatch.date} ({modalMatch.startTime.slice(0, 5)}-{modalMatch.endTime.slice(0, 5)})</p>
            </div>

            {modalMatch.validated && (
              <div style={{ 
                background: '#f0fdf4', 
                padding: '12px', 
                borderRadius: '8px',
                border: '1px solid #bbf7d0'
              }}>
                <p style={{ margin: 0, color: '#166534' }}>
                  <strong>Validado por:</strong> {modalMatch.validatedByName || "-"}
                </p>
                <p style={{ margin: 0, color: '#166534' }}>
                  <strong>Fecha validación:</strong> {modalMatch.validatedAt ? new Date(modalMatch.validatedAt).toLocaleString() : "-"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}