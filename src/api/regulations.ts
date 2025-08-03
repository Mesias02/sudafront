import axios from "axios";

const API = process.env.REACT_APP_API_URL || "/api";


// Subir PDF del reglamento
export const uploadRegulation = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append("file", file);
  return await axios.post(`${API}/regulations/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    }
  });
};

// Obtener URL del reglamento vigente
export const getLatestRegulationUrl = () => `${API}/regulations/latest`;

// Obtener historial de reglamentos (solo admin)
export const getRegulationHistory = async (token: string) => {
  const res = await axios.get(`${API}/regulations/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Descargar un reglamento por id (opcional)
export const getRegulationDownloadUrl = (id: number) => `${API}/regulations/${id}/download`;
