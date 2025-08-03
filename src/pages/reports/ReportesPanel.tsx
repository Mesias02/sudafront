import { useEffect, useState } from "react";
import { getTeams } from "../../api/teams";
import { getPlayersByTeam } from "../../api/players";
import {
  generateReport,
  exportReportPDF,
  exportReportExcel,
  getReportHistory,
  PlayerReportDTO,
  ReportHistoryDTO
} from "../../api/reports";
import BackButton from "../../components/BackButton";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function ReportesPanel() {
  const token = localStorage.getItem("token")!;
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<PlayerReportDTO[]>([]);
  const [history, setHistory] = useState<ReportHistoryDTO[]>([]);
  const [sortColumn, setSortColumn] = useState<string>("playerName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: 'generate' | 'pdf' | 'excel' | null;
    historyId?: number;
  }>({ isOpen: false, action: null });

  useEffect(() => {
    loadTeams();
    loadHistory();
  }, []);

  const loadTeams = async () => {
    const data = await getTeams(token);
    setTeams(data);
  };

  const loadHistory = async () => {
    const data = await getReportHistory(token);
    setHistory(data);
  };

  useEffect(() => {
    if (selectedTeam) {
      loadPlayersByTeam(parseInt(selectedTeam));
    } else {
      setPlayers([]);
      setFilteredPlayers([]);
    }
  }, [selectedTeam]);

  const loadPlayersByTeam = async (teamId: number) => {
    const data = await getPlayersByTeam(teamId, token);
    setPlayers(data);
    setFilteredPlayers(data);
  };

  const handleGenerateReportClick = () => {
    setConfirmDialog({ isOpen: true, action: 'generate' });
  };

  const handleGenerateReport = async () => {
    const filters = {
      teamId: selectedTeam ? parseInt(selectedTeam) : undefined,
      playerId: selectedPlayer ? parseInt(selectedPlayer) : undefined,
      dateStart: startDate || undefined,
      dateEnd: endDate || undefined,
    };

    try {
      setLoading(true);
      const data = await generateReport(filters, token);
      setReportData(data);
      await loadHistory();
    } catch {
      alert("Error al generar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDFClick = (historyId: number) => {
    setConfirmDialog({ isOpen: true, action: 'pdf', historyId });
  };

  const handleExportPDF = async (historyId: number) => {
    try {
      const blob = await exportReportPDF(historyId, token);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte.pdf");
      document.body.appendChild(link);
      link.click();
    } catch {
      alert("Error al exportar PDF");
    }
  };

  const handleExportExcelClick = (historyId: number) => {
    setConfirmDialog({ isOpen: true, action: 'excel', historyId });
  };

  const handleExportExcel = async (historyId: number) => {
    try {
      const blob = await exportReportExcel(historyId, token);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reporte.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch {
      alert("Error al exportar Excel");
    }
  };

  const handleConfirmAction = () => {
    switch (confirmDialog.action) {
      case 'generate':
        handleGenerateReport();
        break;
      case 'pdf':
        if (confirmDialog.historyId) handleExportPDF(confirmDialog.historyId);
        break;
      case 'excel':
        if (confirmDialog.historyId) handleExportExcel(confirmDialog.historyId);
        break;
    }
    setConfirmDialog({ isOpen: false, action: null });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const columnMapper = (column: string) => {
    switch (column) {
      case "playerName": return "playerName";
      case "teamName": return "teamName";
      case "PJ": return "totalMatchesPlayed";
      case "Goles": return "totalGoals";
      case "Amarillas": return "yellowCards";
      case "Rojas": return "redCards";
      default: return column;
    }
  };

  const sortedData = [...reportData].sort((a, b) => {
    const valueA = (a as any)[columnMapper(sortColumn)];
    const valueB = (b as any)[columnMapper(sortColumn)];
    if (typeof valueA === "string") {
      return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    } else {
      return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
    }
  });

  const getConfirmMessage = () => {
    switch (confirmDialog.action) {
      case 'generate':
        return "¿Estás seguro de que deseas generar un nuevo reporte con los filtros seleccionados?";
      case 'pdf':
        return "¿Deseas descargar este reporte en formato PDF?";
      case 'excel':
        return "¿Deseas descargar este reporte en formato Excel?";
      default:
        return "";
    }
  };

  const getConfirmTitle = () => {
    switch (confirmDialog.action) {
      case 'generate':
        return "Generar Reporte";
      case 'pdf':
        return "Descargar PDF";
      case 'excel':
        return "Descargar Excel";
      default:
        return "";
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <BackButton to="/panel" />

      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#374151',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          📊 Reportes
        </h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Equipo:
            </label>
            <select
              style={{ width: '100%' }}
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="">-- Todos los equipos --</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Jugador:
            </label>
            <select
              style={{ width: '100%' }}
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              disabled={!selectedTeam}
            >
              <option value="">-- Todos los jugadores --</option>
              {filteredPlayers.map((player: any) => (
                <option key={player.id} value={player.id}>
                  {player.name} #{player.dorsal}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Desde:
            </label>
            <input
              type="date"
              style={{ width: '100%' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Hasta:
            </label>
            <input
              type="date"
              style={{ width: '100%' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button
            className="btn-primary"
            onClick={handleGenerateReportClick}
            disabled={loading}
            style={{ minWidth: '200px' }}
          >
            {loading ? (
              <>
                <span className="loading"></span>
                Generando...
              </>
            ) : (
              <>Generar Reporte</>
            )}
          </button>
        </div>

        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '16px'
        }}>
          Vista Previa:
        </h3>

        <div style={{
          overflowX: 'auto',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                <th style={{ padding: '12px 16px', cursor: 'pointer', fontWeight: '600', color: '#374151' }}
                  onClick={() => handleSort("playerName")}
                >
                  Jugador {sortColumn === "playerName" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ padding: '12px 16px', cursor: 'pointer', fontWeight: '600', color: '#374151' }}
                  onClick={() => handleSort("teamName")}
                >
                  Equipo {sortColumn === "teamName" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ padding: '12px 16px', cursor: 'pointer', fontWeight: '600', color: '#374151' }}
                  onClick={() => handleSort("PJ")}
                >
                  PJ {sortColumn === "PJ" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ padding: '12px 16px', cursor: 'pointer', fontWeight: '600', color: '#374151' }}
                  onClick={() => handleSort("Goles")}
                >
                  Goles {sortColumn === "Goles" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ padding: '12px 16px', cursor: 'pointer', fontWeight: '600', color: '#374151' }}
                  onClick={() => handleSort("Amarillas")}
                >
                  Amarillas {sortColumn === "Amarillas" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ padding: '12px 16px', cursor: 'pointer', fontWeight: '600', color: '#374151' }}
                  onClick={() => handleSort("Rojas")}
                >
                  Rojas {sortColumn === "Rojas" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#6b7280'
                    }}
                  >
                    No hay datos para mostrar. Genera un reporte para ver los resultados.
                  </td>
                </tr>
              ) : (
                sortedData.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      background: idx % 2 === 0 ? 'white' : '#f9fafb'
                    }}
                  >
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{item.playerName}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{item.teamName}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', textAlign: 'center' }}>{item.totalMatchesPlayed}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', textAlign: 'center' }}>{item.totalGoals}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', textAlign: 'center' }}>{item.yellowCards}</td>
                    <td style={{ padding: '12px 16px', color: '#374151', textAlign: 'center' }}>{item.redCards}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#374151',
          marginTop: '48px',
          marginBottom: '16px'
        }}>
          Historial de reportes:
        </h3>

        <div style={{
          overflowX: 'auto',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>ID</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Generado</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Usuario</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: '#374151' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#6b7280'
                    }}
                  >
                    No hay reportes generados aún.
                  </td>
                </tr>
              ) : (
                history.map((h, idx) => (
                  <tr
                    key={h.id}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      background: idx % 2 === 0 ? 'white' : '#f9fafb'
                    }}
                  >
                    <td style={{ padding: '12px 16px', color: '#374151', textAlign: 'center' }}>{h.id}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{h.generatedAt}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{h.generatedBy}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          className="btn-tertiary btn-xs"
                          onClick={() => handleExportPDFClick(h.id)}
                        >
                          📄 PDF
                        </button>
                        <button
                          className="btn-primary btn-xs"
                          onClick={() => handleExportExcelClick(h.id)}
                        >
                          📊 Excel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, action: null })}
        onConfirm={handleConfirmAction}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        confirmText={confirmDialog.action === 'generate' ? "Generar" : "Descargar"}
        cancelText="Cancelar"
        type={confirmDialog.action === 'generate' ? 'info' : 'info'}
        icon={confirmDialog.action === 'generate' ? '📊' : confirmDialog.action === 'pdf' ? '📄' : '📊'}
      />
    </div>
  );
}
