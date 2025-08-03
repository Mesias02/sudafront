import { useEffect, useState } from "react";
import { getPublicTeams } from "../../api/teams";

interface Team {
  id: number;
  name: string;
  players: Player[];
}

interface Player {
  id: number;
  name: string;
  dorsal: number;
}

export default function TeamsPublicPanel() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [openTeamId, setOpenTeamId] = useState<number | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const data = await getPublicTeams();
    setTeams(data);
  };

  const handleToggle = (teamId: number) => {
    setOpenTeamId(openTeamId === teamId ? null : teamId);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Equipos del Campeonato</h1>

      {teams.map((team) => (
        <div
          key={team.id}
          className="mb-6 bg-white/10 p-0 rounded-2xl shadow-lg transition"
        >
          {/* Nombre del equipo como "acordeón" */}
          <div
            onClick={() => handleToggle(team.id)}
            className="flex justify-between items-center cursor-pointer select-none px-6 py-4 text-xl font-semibold rounded-2xl hover:bg-[#19343e]/60 transition"
          >
            <span>{team.name}</span>
            <span
              className={`transform transition-transform duration-200 ${
                openTeamId === team.id ? "rotate-90" : ""
              }`}
            >
              ▶
            </span>
          </div>

          {/* Lista de jugadores */}
          {openTeamId === team.id && (
            <div className="px-6 pb-4 animate-fade-in">
              <table className="min-w-full border-collapse border border-gray-700 text-base mt-2 bg-white/5 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-[#1f3a45] text-white">
                    <th className="p-3 border border-gray-700">Dorsal</th>
                    <th className="p-3 border border-gray-700">Jugador</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((player) => (
                    <tr
                      key={player.id}
                      className="text-center hover:bg-[#244e5d]/80 transition"
                    >
                      <td className="p-3 border border-gray-700">{player.dorsal}</td>
                      <td className="p-3 border border-gray-700">{player.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}

      {teams.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No hay equipos registrados.
        </p>
      )}
    </div>
  );
}
