import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlayerStats, PlayerStatsDTO } from "../../api/playerStats";

export default function PlayerProfile() {
  const { playerId } = useParams<{ playerId: string }>();
  const [stats, setStats] = useState<PlayerStatsDTO | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (playerId) {
      getPlayerStats(parseInt(playerId)).then(setStats);
    }
  }, [playerId]);

  if (!stats)
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
      }}>
        <span style={{ color: "#fff", fontSize: 20 }}>Cargando estadísticas...</span>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
      }}
    >
      <div style={{
        width: "100%",
        maxWidth: 400,
        padding: "2.5rem 1.5rem 2rem 1.5rem",
        background: "rgba(255,255,255,0.95)",
        borderRadius: 18,
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.25)",
        position: "relative"
      }}>
        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            left: 18,
            top: 18,
            background: "#f3f4f6",
            color: "#1e3c72",
            border: "none",
            padding: "8px 18px",
            borderRadius: 20,
            fontWeight: "bold",
            fontSize: 14,
            boxShadow: "0 2px 8px #0001",
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseOver={e => e.currentTarget.style.background = "#e0e7ef"}
          onMouseOut={e => e.currentTarget.style.background = "#f3f4f6"}
        >
          ← 
        </button>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#1e3c72",
            marginBottom: 30,
            textAlign: "center",
            letterSpacing: -1
          }}
        >
          Perfil del Jugador
        </h1>
        <table style={{ width: "100%", fontSize: 17, background: "transparent" }}>
          <tbody>
            <StatRow label="Nombre" value={stats.playerName} />
            <StatRow label="Equipo" value={stats.teamName} />
            <StatRow label="Partidos Jugados" value={stats.totalMatchesPlayed} />
            <StatRow label="Goles" value={stats.totalGoals} />
            <StatRow
              label="Tarjetas Amarillas"
              value={stats.yellowCards}
              badgeColor="#ffe066"
              badgeText="#222"
            />
            <StatRow
              label="Tarjetas Rojas"
              value={stats.redCards}
              badgeColor="#fc5252"
              badgeText="#fff"
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  badgeColor,
  badgeText
}: {
  label: string;
  value: any;
  badgeColor?: string;
  badgeText?: string;
}) {
  const isBadge = badgeColor !== undefined && typeof value === "number";
  return (
    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
      <td style={{
        padding: "14px 8px",
        fontWeight: 600,
        color: "#222",
        letterSpacing: 0.1,
        background: "transparent",
        width: "65%"
      }}>
        {label}
      </td>
      <td style={{
        padding: "14px 8px",
        textAlign: "right",
        color: "#1e293b",
        fontWeight: 500,
        background: "transparent"
      }}>
        {isBadge ? (
          <span style={{
            background: badgeColor,
            color: badgeText,
            padding: "3px 16px",
            borderRadius: "999px",
            fontWeight: 700,
            fontSize: 16,
            boxShadow: "0 2px 8px #0001"
          }}>
            {value}
          </span>
        ) : (
          value
        )}
      </td>
    </tr>
  );
}
