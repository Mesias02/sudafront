import axios from "axios";

const API = process.env.REACT_APP_API_URL || "/api";

export interface MatchReportDTO {
  matchId: number;
  teamId: number;
  captainId: number;
  lineup: number[];
  observations: string;
}

// Registrar o editar un reporte (POST)
export const registerMatchReport = async (
  report: MatchReportDTO,
  token: string
) => {
  const res = await axios.post(`${API}/match-reports`, report, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Obtener el reporte para el partido de tu equipo
export const getMyReportForMatch = async (
  matchId: number,
  token: string
) => {
  const res = await axios.get(`${API}/match-reports/${matchId}/by-team`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
