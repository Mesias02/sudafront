import axios from "axios";
import { MatchEventResponseDTO } from "./matchEvents";

const API = process.env.REACT_APP_API_URL || "/api";
export interface MatchDTO {
  id: number;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  homeScore: number;
  awayScore: number;
  validated: boolean;
  validatedAt?: string | null;
  validatedByName?: string | null;
}

export interface MatchCreateDTO {
  homeTeamId: number;
  awayTeamId: number;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface MatchDetailDTO {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  homeScore: number,
  awayScore: number ,
  validated: boolean
}

export interface MatchStatsDTO {
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number;
  awayGoals: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
  events: MatchEventResponseDTO[];
}

export interface MatchEvent {
  id: number;
  type: string;
  detail: string;
  playerName: string;
  minute: number;
  teamId: number;
}
export interface MatchDTO {
  id: number;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  homeScore: number;
  awayScore: number;
  validated: boolean;
}

// Nuevo DTO para la vista pública:
export interface PublicMatchDTO {
  id: number;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

export const getPublicMatches = async (): Promise<PublicMatchDTO[]> => {
  const res = await axios.get(`${API}/matches/public`);
  return res.data;
};

export const getMatchById = async (id: number, token: string): Promise<MatchDetailDTO> => {
  const res = await axios.get(`${API}/matches/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMatches = async (): Promise<MatchDTO[]> => {
  const res = await axios.get(`${API}/matches`);
  return res.data;
};

export const getMatchesToValidate = async (token: string): Promise<MatchDTO[]> => {
  const res = await axios.get(`${API}/matches/to-validate`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createMatch = async (match: MatchCreateDTO, token: string): Promise<MatchDTO> => {
  const res = await axios.post(`${API}/matches`, match, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateMatch = async (id: number, match: any, token: string) => {
  const res = await axios.put(`${API}/matches/${id}`, match, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteMatch = async (id: number, token: string) => {
  await axios.delete(`${API}/matches/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const finishMatch = async (matchId: number, token: string) => {
  const res = await axios.put(`${API}/matches/${matchId}/finish`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const validateMatch = async (matchId: number, token: string) => {
  const res = await axios.put(`${API}/matches/${matchId}/validate`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getMatchStats = async (id: number): Promise<MatchStatsDTO> => {
  const res = await axios.get(`${API}/matches/${id}/stats`);
  return res.data;
};

export const recalculateMatchScore = async (matchId: number, token: string): Promise<any> => {
  const res = await axios.put(`${API}/matches/${matchId}/recalculate-score`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const cancelValidation = async (matchId: number, token: string) => {
  const res = await axios.put(`${API}/matches/${matchId}/cancel-validation`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
