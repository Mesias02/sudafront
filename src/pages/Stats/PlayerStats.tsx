import { useEffect, useState } from "react";
import { getPlayerStats } from "../../api/players"; // ✅ API centralizada

interface PlayerStatsProps {
  playerId: number;
}

interface PlayerStats {
  playerId: number;
  playerName: string;
  teamName: string;
  goals: number;
  yellowCards: number;
  redCards: number;
}

export default function PlayerStats({ playerId }: PlayerStatsProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPlayerStats(playerId);
        setStats(data);
      } catch (err) {
        setError("No se pudo cargar las estadísticas del jugador.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId]);

  if (loading) return <p>Cargando estadísticas...</p>;
  if (error) return <p>{error}</p>;
  if (!stats) return <p>Estadísticas no disponibles.</p>;

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8, marginTop: 16  } }>
      <h2>Estadísticas de {stats.playerName}</h2>
      <p><strong>Equipo:</strong> {stats.teamName}</p>
      <p><strong>Goles:</strong> {stats.goals}</p>
      <p><strong>Tarjetas Amarillas:</strong> {stats.yellowCards}</p>
      <p><strong>Tarjetas Rojas:</strong> {stats.redCards}</p>
    </div>
  );
}
