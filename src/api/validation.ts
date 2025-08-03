import axios from "axios";

const API = process.env.REACT_APP_API_URL || "/api/validation";
export interface PlayerPending {
  id: number;
  name: string;
  cedula: string;
  dorsal: number;
  carrera: string;
  teamId: number;
  teamName: string;  // ✅ ahora sí te llegará correctamente
  validated: boolean;
}
export interface TeamPending {
  id: number;
  name: string;
  contactNumber: string;
  representativeId: number;
  representativeName: string;
  validated: boolean;
}
export interface TeamPending {
  id: number;
  name: string;
  contactNumber: string;
  representativeId: number;
  representativeName: string;
  validated: boolean;
}

export interface PlayerPending {
  id: number;
  name: string;
  cedula: string;
  dorsal: number;
  carrera: string;
  teamId: number;
  teamName: string;
  validated: boolean;
}
export interface ValidationHistory {
  id: number;
  entityType: string;
  entityId: number;
  validatedBy: string;
  validatedAt: string;
}

export const getValidationHistory = async (token: string): Promise<ValidationHistory[]> => {
  const res = await axios.get(`${API}/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};


export const getPendingTeams = async (token: string) => {
  const res = await axios.get(`${API}/teams/pending`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPendingPlayers = async (token: string) => {
  const res = await axios.get(`${API}/players/pending`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const validateTeam = async (id: number, token: string) => {
  await axios.put(`${API}/teams/${id}/validate`, null, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const validatePlayer = async (id: number, token: string) => {
  await axios.put(`${API}/players/${id}/validate`, null, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Editar equipo
export const editTeam = async (id: number, data: { name: string; contactNumber: string }, token: string) => {
  await axios.put(`${API}/teams/${id}/edit`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Editar jugador
export const editPlayer = async (id: number, data: { name: string; cedula: string; dorsal: number; carrera: string }, token: string) => {
  await axios.put(`${API}/players/${id}/edit`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Rechazar (eliminar) equipo
export const rejectTeam = async (id: number, token: string) => {
  await axios.delete(`${API}/teams/${id}/reject`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Rechazar (eliminar) jugador
export const rejectPlayer = async (id: number, token: string) => {
  await axios.delete(`${API}/players/${id}/reject`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
