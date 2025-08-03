import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPlayers, PlayerListDTO } from "../../api/playerStats";

export default function PlayerStatsPanel() {
  const [players, setPlayers] = useState<PlayerListDTO[]>([]);
  const [search, setSearch] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerListDTO[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    const data = await getAllPlayers();
    setPlayers(data);
    setFilteredPlayers(data);

    // Extraemos lista única de equipos
    const teamNames = Array.from(new Set(data.map(player => player.team.name)));
    setTeams(teamNames);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    applyFilters(value, selectedTeam);
  };

  const handleTeamFilter = (value: string) => {
    setSelectedTeam(value);
    applyFilters(search, value);
  };

  const applyFilters = (searchValue: string, teamValue: string) => {
    let filtered = players;

    if (searchValue.trim() !== "") {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        player.dorsal.toString().includes(searchValue)
      );
    }

    if (teamValue !== "") {
      filtered = filtered.filter(player => player.team.name === teamValue);
    }

    setFilteredPlayers(filtered);
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 24 }}>
      <h1>Estadísticas por Jugador</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Buscar por nombre o dorsal"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ padding: 8, flex: 1 }}
        />

        <select
          value={selectedTeam}
          onChange={(e) => handleTeamFilter(e.target.value)}
          style={{ padding: 8, width: "200px" }}
        >
          <option value="">Todos los equipos</option>
          {teams.map(team => (
            <option key={team} value={team}>{team}</option>
          ))}
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dorsal</th>
            <th>Equipo</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.map(player => (
            <tr
              key={player.id}
              onClick={() => navigate(`/player/${player.id}`)}
              style={{ cursor: "pointer" }}
            >
              <td>{player.name}</td>
              <td>{player.dorsal}</td>
              <td>{player.team.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
