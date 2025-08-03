import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlayersByTeam } from "../../api/players";
import { getTeamOfRepresentative } from "../../api/teams";
import { getMatches, MatchDTO } from "../../api/matches";
import {
  registerMatchReport,
  getMyReportForMatch,
} from "../../api/matchreport";

const getAvatar = (name: string) =>
  `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`;

export default function MatchReportForm() {
  const token = localStorage.getItem("token") || "";
  const { id } = useParams();
  const matchId = Number(id);
  const navigate = useNavigate();

  const [team, setTeam] = useState<{ id: number; name: string } | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [match, setMatch] = useState<MatchDTO | null>(null);
  const [lineup, setLineup] = useState<number[]>([]);
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const myTeam = await getTeamOfRepresentative(token);
        setTeam(myTeam);

        const allMatches = await getMatches();
        const thisMatch = allMatches.find((m) => m.id === matchId);
        setMatch(thisMatch || null);

        const teamPlayers = await getPlayersByTeam(myTeam.id, token);
        setPlayers(teamPlayers);

        try {
          const report = await getMyReportForMatch(matchId, token);
          setLineup(report.lineup || []);
          setCaptainId(report.captainId || null);
        } catch {
          setLineup([]);
          setCaptainId(null);
        }
      } catch {
        setMessage("Error cargando datos");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token, matchId]);

  const handleLineupChange = (playerId: number) => {
    setLineup((prev) => {
      if (prev.includes(playerId)) {
        if (captainId === playerId) setCaptainId(null);
        return prev.filter((id) => id !== playerId);
      } else if (prev.length < 7) {
        return [...prev, playerId];
      }
      return prev;
    });
  };

  const titulares = players.filter((p) => lineup.includes(p.id));
  const suplentes = players.filter((p) => !lineup.includes(p.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    if (lineup.length < 4 || lineup.length > 7) {
      setMessage("La alineación debe tener mínimo 4 y máximo 7 jugadores.");
      return;
    }
    if (!captainId || !lineup.includes(captainId)) {
      setMessage("El capitán debe ser uno de los titulares seleccionados.");
      return;
    }
    try {
      setLoading(true);
      await registerMatchReport(
        {
          matchId,
          teamId: team.id,
          captainId,
          lineup,
          observations: "",
        },
        token
      );
      setMessage("Reporte registrado con éxito.");
      setTimeout(() => navigate("/my-matches"), 1200);
    } catch (err: any) {
      setMessage(
        err?.response?.data?.error ||
          "Error registrando reporte. Intenta más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f6fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
          color: "#333",
        }}
      >
        Cargando...
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f6fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 8px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 28,
          boxShadow: "0 8px 32px #0002, 0 2px 4px #0001",
          padding: "40px 32px 32px 32px",
        }}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            textAlign: "center",
            marginBottom: 6,
            color: "#1e293b",
            letterSpacing: "0.5px",
          }}
        >
          {match?.homeTeamName} <span style={{ color: "#2563eb", fontWeight: 900 }}>vs</span> {match?.awayTeamName}
        </h2>
        <div
          style={{
            color: "#2d3748",
            textAlign: "center",
            fontSize: "1rem",
            fontWeight: 500,
            marginBottom: 26,
          }}
        >
          <span style={{ marginRight: 16 }}>
            <b>Fecha:</b> {match?.date}
          </span>
          <span style={{ marginRight: 16 }}>
            <b>Hora:</b> {match?.startTime?.slice(0, 5)} - {match?.endTime?.slice(0, 5)}
          </span>
          <span>
            <b>Lugar:</b> {match?.location}
          </span>
        </div>
        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              color: "#111",
              marginBottom: 12,
              textAlign: "center",
              fontSize: "1.1rem",
            }}
          >
            Selecciona titulares (4-7):
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
              gap: "18px",
              marginBottom: 20,
            }}
          >
            {players.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 14,
                  borderRadius: 16,
                  boxShadow: lineup.includes(p.id)
                    ? "0 4px 18px #2563eb33"
                    : "0 1.5px 6px #2221",
                  border: lineup.includes(p.id)
                    ? "2.5px solid #2563eb"
                    : "2.5px solid #e5e7eb",
                  background: "#fafbff",
                  minWidth: 120,
                }}
              >
                <img
                  src={getAvatar(p.name)}
                  alt={p.name}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "2px solid #f1f5f9",
                    marginBottom: 7,
                    filter: lineup.includes(p.id)
                      ? "none"
                      : "grayscale(80%) blur(0.2px)",
                    opacity: lineup.includes(p.id) ? 1 : 0.75,
                  }}
                  draggable={false}
                />
                <label
                  htmlFor={`player-${p.id}`}
                  style={{
                    color: "#1e293b",
                    fontWeight: 600,
                    fontSize: "1rem",
                    marginBottom: 2,
                    textAlign: "center",
                  }}
                >
                  {p.name}
                </label>
                <input
                  type="checkbox"
                  id={`player-${p.id}`}
                  style={{ marginTop: 2, width: 20, height: 20, accentColor: "#2563eb" }}
                  checked={lineup.includes(p.id)}
                  onChange={() => handleLineupChange(p.id)}
                  disabled={!lineup.includes(p.id) && lineup.length >= 7}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: "0.97rem",
              color: "#222",
              textAlign: "center",
              marginBottom: 22,
              fontWeight: 500,
            }}
          >
            Seleccionados: <b>{lineup.length}</b> / 7
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              style={{
                fontWeight: 700,
                marginBottom: 8,
                display: "block",
                color: "#111",
              }}
            >
              Capitán:
            </label>
            <select
              value={captainId ?? ""}
              onChange={(e) => setCaptainId(Number(e.target.value))}
              required
              style={{
                width: "100%",
                borderRadius: 9,
                border: "2px solid #cbd5e1",
                padding: "8px 12px",
                fontWeight: 600,
                background: "#fff",
                fontSize: "1rem",
                color: "#1e293b",
                marginTop: 2,
                outline: "none",
              }}
            >
              <option value="">Selecciona capitán</option>
              {titulares.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              marginBottom: 14,
              padding: "13px 13px 6px 13px",
              borderRadius: 13,
              background: "#f3f7ff",
              border: "1.5px solid #2563eb22",
              boxShadow: "0 1px 3px #2222",
              color: "#223",
            }}
          >
            <div
              style={{
                marginBottom: 2,
                fontWeight: 700,
                color: "#111",
                fontSize: "1rem",
              }}
            >
              Titulares seleccionados:
            </div>
            {titulares.length === 0 ? (
              <div style={{ color: "#666", fontWeight: 500 }}>Ninguno</div>
            ) : (
              <ul style={{ paddingLeft: 20, color: "#1850ad", fontWeight: 600 }}>
                {titulares.map((p) => (
                  <li key={p.id}>
                    {p.name}
                    {captainId === p.id && (
                      <span style={{ marginLeft: 7, color: "#2563eb", fontWeight: 800, fontSize: "0.98em" }}>
                        (Capitán)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div
              style={{
                marginTop: 5,
                fontWeight: 600,
                color: "#1850ad",
                fontSize: "0.98rem",
              }}
            >
              Suplentes:
            </div>
            {suplentes.length === 0 ? (
              <div style={{ color: "#aaa", fontWeight: 500 }}>Ninguno</div>
            ) : (
              <ul style={{ paddingLeft: 20, color: "#444", fontWeight: 600 }}>
                {suplentes.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              marginTop: 15,
              background: "#2563eb",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.12rem",
              padding: "14px 0",
              borderRadius: 13,
              boxShadow: "0 4px 12px #2563eb55",
              border: "none",
              transition: "background .15s",
              cursor: loading || lineup.length < 4 || lineup.length > 7 || !captainId ? "not-allowed" : "pointer",
              opacity: loading || lineup.length < 4 || lineup.length > 7 || !captainId ? 0.6 : 1,
            }}
            disabled={loading || lineup.length < 4 || lineup.length > 7 || !captainId}
          >
            💾 Guardar Reporte
          </button>
        </form>
        {message && (
          <div
            style={{
              marginTop: 18,
              padding: "12px 10px",
              borderRadius: 10,
              textAlign: "center",
              fontWeight: 700,
              background: message.includes("éxito") ? "#d1fae5" : "#fee2e2",
              color: message.includes("éxito") ? "#065f46" : "#991b1b",
              fontSize: "1rem",
              boxShadow: "0 1px 3px #2221",
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
