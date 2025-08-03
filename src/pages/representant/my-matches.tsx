import { useEffect, useState } from "react";
import { getMatches, MatchDTO } from "../../api/matches";
import { getTeamOfRepresentative } from "../../api/teams";
import { useNavigate } from "react-router-dom";
import { getMyReportForMatch } from "../../api/matchreport";
import StatusBadge from "../../components/StatusBadge";
import DataTable from "../../components/DataTable";

const ESTADO_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Jugado",
  CANCELLED: "Cancelado",
};

export default function MyMatches() {
  const [team, setTeam] = useState<{ id: number; name: string } | null>(null);
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<{ [matchId: number]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const token = localStorage.getItem("token") || "";
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const myTeam = await getTeamOfRepresentative(token);
        setTeam(myTeam);

        const allMatches = await getMatches();
        const myMatches = allMatches.filter(
          (m) => m.homeTeamName === myTeam.name || m.awayTeamName === myTeam.name
        );
        myMatches.sort((a, b) => b.date.localeCompare(a.date));
        setMatches(myMatches);
      } catch {
        setError("Error cargando partidos.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  useEffect(() => {
    async function fetchReports() {
      const reportStates: { [matchId: number]: boolean } = {};
      for (const match of matches) {
        try {
          await getMyReportForMatch(match.id, token);
          reportStates[match.id] = true;
        } catch {
          reportStates[match.id] = false;
        }
      }
      setReports(reportStates);
    }
    if (matches.length) {
      fetchReports();
    }
  }, [matches, token]);

  const filteredMatches = matches.filter((match) => {
    const normalized = (s: string) => (s || "").toLowerCase();
    const statusMatch =
      !statusFilter || match.status === statusFilter;
    const search =
      normalized(match.date).includes(normalized(searchTerm)) ||
      normalized(match.startTime).includes(normalized(searchTerm)) ||
      normalized(match.homeTeamName).includes(normalized(searchTerm)) ||
      normalized(match.awayTeamName).includes(normalized(searchTerm)) ||
      normalized(match.location).includes(normalized(searchTerm)) ||
      normalized(ESTADO_LABELS[match.status] || "").includes(normalized(searchTerm));
    return statusMatch && (!searchTerm || search);
  });

  const columns = [
    {
      key: "date",
      label: "Fecha",
      sortable: true,
    },
    {
      key: "startTime",
      label: "Hora",
      sortable: true,
      render: (_: string, row: MatchDTO) => (
        <>
          {row.startTime.slice(0, 5)} - {row.endTime.slice(0, 5)}
        </>
      ),
    },
    {
      key: "homeTeamName",
      label: "Local",
      sortable: true,
    },
    {
      key: "awayTeamName",
      label: "Visitante",
      sortable: true,
    },
    {
      key: "location",
      label: "Lugar",
      sortable: true,
    },
    {
      key: "status",
      label: "Estado",
      sortable: true,
      render: (status: string) => <StatusBadge status={status} size="sm" />,
    },
    {
      key: "actions",
      label: "Acciones",
      render: (_: any, match: MatchDTO) =>
        match.status !== "COMPLETED" ? (
          reports[match.id] ? (
            <button
              className="btn-tertiary btn-sm"
              onClick={() => navigate(`/my-matches/${match.id}/report`)}
              style={{ minWidth: 120 }}
            >
              ✏️ Editar Alineación
            </button>
          ) : (
            <button
              className="btn-primary btn-sm"
              onClick={() => navigate(`/my-matches/${match.id}/report`)}
              style={{ minWidth: 120 }}
            >
              📝 Registrar Alineación
            </button>
          )
        ) : null,
      align: "center" as const,
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#1e3c72 0%,#2a5298 100%)",
      padding: "40px 0"
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "0 20px",
      }}>
        <div
          className="text-3xl font-bold mb-8 text-white text-center drop-shadow"
          style={{
            textShadow: "0 2px 10px #1e40af33",
            letterSpacing: ".5px",
          }}
        >
          Mis Partidos
        </div>

        {/* FILTROS PANEL */}
        <div
          className="flex flex-col md:flex-row gap-3 mb-6 items-center justify-between"
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: 16,
            boxShadow: "0 2px 8px #0002",
            padding: 20,
            marginBottom: 40,
          }}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full md:w-80"
            style={{ fontSize: 16, background: "#f1f5f9" }}
            placeholder="Buscar equipo, lugar, fecha, estado..."
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-full md:w-60"
            style={{ fontSize: 16, background: "#f1f5f9" }}
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="COMPLETED">Jugado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
          <button
            className="btn-primary btn-sm"
            style={{
              minWidth: 130,
              fontWeight: 600,
              background: "#2563eb",
              color: "#fff",
              borderRadius: 8,
              border: "none",
              padding: "8px 20px",
              boxShadow: "0 2px 6px #2563eb22"
            }}
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
            }}
            type="button"
          >
            Limpiar filtros
          </button>
        </div>

        {/* TABLA */}
        <div style={{
          background: "rgba(255,255,255,0.97)",
          borderRadius: 18,
          boxShadow: "0 4px 24px #0002",
          padding: "30px 0",
          overflowX: "auto"
        }}>
          <div style={{
            minWidth: 900,
            padding: "0 24px"
          }}>
            <DataTable
              data={filteredMatches}
              columns={columns}
              loading={loading}
              emptyMessage="No se encontraron partidos"
              hoverable
              striped
            />
            {error && (
              <div className="text-center text-red-600 mt-4">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
