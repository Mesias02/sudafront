import axios from "axios";
const API = process.env.REACT_APP_API_URL || "/api";
export interface ReportFilterDTO {
  teamId?: number;
  playerId?: number;
  dateStart?: string;
  dateEnd?: string;
}

export interface PlayerReportDTO {
  playerName: string;
  teamName: string;
  totalMatchesPlayed: number;  
  totalGoals: number;          
  yellowCards: number;
  redCards: number;
}

export interface ReportHistoryDTO {
  id: number;
  generatedAt: string;

  generatedBy: string;  // ✅ Agregado el nombre de quien generó
}

// Generar reporte (se mantiene igual)
export const generateReport = async (filters: ReportFilterDTO, token: string) => {
  const res = await axios.post(`${API}/reports/generate`, filters, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Obtener historial
export const getReportHistory = async (token: string) => {
  const res = await axios.get(`${API}/reports/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data as ReportHistoryDTO[];
};

// Exportar PDF (ahora por historyId)
export const exportReportPDF = async (historyId: number, token: string) => {
  const res = await axios.post(`${API}/reports/export/pdf/${historyId}`, null, {
    responseType: "blob",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Exportar Excel (ahora por historyId)
export const exportReportExcel = async (historyId: number, token: string) => {
  const res = await axios.post(`${API}/reports/export/excel/${historyId}`, null, {
    responseType: "blob",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
