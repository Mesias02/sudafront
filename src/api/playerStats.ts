import axios from "axios";

export interface PlayerStatsDTO {
  playerName: string;
  teamName: string;
  totalGoals: number;
  yellowCards: number;
  redCards: number;
  totalMatchesPlayed: number;
}

export interface PlayerListDTO {
  id: number;
  name: string;
  dorsal: number;
  team: {
    id: number;
    name: string;
  };
}
const API = process.env.REACT_APP_API_URL || "/api";

export async function getAllPlayers(): Promise<PlayerListDTO[]> {
  const response = await axios.get(`${API}/players/public`);
  return response.data;
}

export async function getPlayerStats(playerId: number): Promise<PlayerStatsDTO> {
  const response = await axios.get(`${API}/global/player/${playerId}`);
  return response.data;
}
