import axios from "axios";
const API = process.env.REACT_APP_API_URL || "/api";
export interface MatchEventResponseDTO {
  id: number;
  type: string;
  detail: string | null;
  minute: number;
  playerName: string;
  teamName: string;
  playerId?: number;   // Útil para edición
}

export interface MatchEventCreateDTO {
  matchId: number;
  playerId: number;
  minute: number;
  type: string;
  detail: string;
}

// Traer eventos de un partido
export const getMatchEvents = async (
  matchId: number,
  token: string
): Promise<MatchEventResponseDTO[]> => {
  const res = await axios.get(`${API}/match-events/${matchId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Crear evento
export const createMatchEvent = async (
  event: MatchEventCreateDTO,
  token: string
): Promise<any> => {
  const res = await axios.post(`${API}/match-events`, event, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// **NUEVO: Editar evento**
export const updateMatchEvent = async (
  eventId: number,
  event: MatchEventCreateDTO,
  token: string
): Promise<any> => {
  const res = await axios.put(`${API}/match-events/${eventId}`, event, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// **NUEVO: Eliminar evento**
export const deleteMatchEvent = async (
  eventId: number,
  token: string
): Promise<any> => {
  const res = await axios.delete(`${API}/match-events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
