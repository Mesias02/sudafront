import axios from "axios";
const API = process.env.REACT_APP_API_URL || "/api";

export const getTeams = async (token: string) => {
  const res = await axios.get(`${API}/teams`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const createTeam = async (team: any, token: string) => {
  return await axios.post(`${API}/teams`, team, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateTeam = async (id: number, team: any, token: string) => {
  return await axios.put(`${API}/teams/${id}`, team, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const deleteTeam = async (id: number, token: string) => {
  return await axios.delete(`${API}/teams/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getTeamOfRepresentative = async (token: string) => {
  const res = await axios.get(`${API}/teams/by-representative`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getTeamStats = async (id: number) => {
  const res = await axios.get(`${API}/teams/${id}/stats`);
  return res.data;
};

export const disableTeam = async (id: number, token: string) => {
  return await axios.put(`${API}/teams/${id}/disable`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
export const getPublicTeams = async () => {
  const res = await axios.get(`${API}/teams/public`);
  return res.data;
};
