import axios from "axios";
const API = process.env.REACT_APP_API_URL || "/api";

export const getPlayersByTeam = async (teamId: number, token: string) => {
  const res = await axios.get(`${API}/players/by-team/${teamId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createPlayer = async (player: any, token: string) => {
  const res = await axios.post(`${API}/players`, player, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updatePlayer = async (id: number, player: any, token: string) => {
  const res = await axios.put(`${API}/players/${id}`, player, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deletePlayer = async (id: number, token: string) => {
  const res = await axios.delete(`${API}/players/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
export const getPlayers = async (token: string) => {
  const res = await axios.get(`${API}/players`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getPlayerStats = async (id: number) => {
  const res = await axios.get(`${API}/players/${id}/stats`);
  return res.data;
};
