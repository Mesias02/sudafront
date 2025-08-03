import { useEffect, useState } from "react";
import { getGlobalStats, getStandings } from "../../api/stats";
import PlayerStats from "./PlayerStats";

interface TeamStats {
  teamId: number;
  teamName: string;
  goals: number;
  yellowCards: number;
  redCards: number;
}

interface PlayerStatsRow {
  playerId: number;
  playerName: string;
  teamName: string;
  goals: number;
  yellowCards: number;
  redCards: number;
}

interface GlobalStatsDTO {
  teamStats: TeamStats[];
  topScorers: PlayerStatsRow[];
  topCards: PlayerStatsRow[];
}

interface TeamStanding {
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  last5: string[];
}

export default function GlobalStats() {
  const [stats, setStats] = useState<GlobalStatsDTO | null>(null);
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  useEffect(() => {
    getGlobalStats().then(setStats);
    getStandings().then(setStandings);
  }, []);

  if (!stats) return <p>Cargando estadísticas...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 24 }}>
      <h1>Estadísticas Globales del Campeonato</h1>

      {/* Tabla de Clasificación */}
      <section>
        <h2>Tabla de Clasificación</h2>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table style={{ minWidth: 700 }}>
            <thead>
              <tr>
                <th>Equipo</th>
                <th>PJ</th>
                <th>G</th>
                <th>E</th>
                <th>P</th>
                <th>GF</th>
                <th>GC</th>
                <th>DG</th>
                <th>Pts</th>
                <th>Últ. 5</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, idx) => (
                <tr key={idx}>
                  <td>{team.teamName}</td>
                  <td>{team.played}</td>
                  <td>{team.wins}</td>
                  <td>{team.draws}</td>
                  <td>{team.losses}</td>
                  <td>{team.goalsFor}</td>
                  <td>{team.goalsAgainst}</td>
                  <td>{team.goalDifference}</td>
                  <td>{team.points}</td>
                  <td>
                    {team.last5.map((r, i) => (
                      <span
                        key={i}
                        title={r}
                        style={{
                          marginRight: 4,
                          color:
                            r === "W" ? "green" : r === "D" ? "gray" : "red"
                        }}
                      >
                        {r === "W" ? "✅" : r === "D" ? "➖" : "❌"}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top Goleadores */}
      <section>
        <h2>Top Goleadores</h2>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table style={{ minWidth: 400 }}>
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Equipo</th>
                <th>Goles</th>
              </tr>
            </thead>
            <tbody>
              {stats.topScorers.map(player => (
                <tr
                  key={player.playerId}
                  onClick={() => setSelectedPlayerId(player.playerId)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{player.playerName}</td>
                  <td>{player.teamName}</td>
                  <td>{player.goals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Jugadores con más Tarjetas */}
      <section>
        <h2>Jugadores con más Tarjetas</h2>
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table style={{ minWidth: 400 }}>
            <thead>
              <tr>
                <th>Jugador</th>
                <th>Equipo</th>
                <th>Amarillas</th>
                <th>Rojas</th>
              </tr>
            </thead>
            <tbody>
              {stats.topCards.map(player => (
                <tr
                  key={player.playerId}
                  onClick={() => setSelectedPlayerId(player.playerId)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{player.playerName}</td>
                  <td>{player.teamName}</td>
                  <td>{player.yellowCards}</td>
                  <td>{player.redCards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedPlayerId && (
        <>
          <PlayerStats playerId={selectedPlayerId} />
          <button
            onClick={() => setSelectedPlayerId(null)}
            style={{ marginTop: 12, display: "block" }}
          >
            Ocultar detalle
          </button>
        </>
      )}
    </div>
  );
}
