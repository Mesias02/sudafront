
import { useEffect, useState } from "react";
import { getRegulationHistory, getRegulationDownloadUrl } from "../api/regulations";

interface Regulation {
  id: number;
  fileName: string;
  version: number;
  uploadDate: string;
}

export default function RegulationHistory() {
  const [history, setHistory] = useState<Regulation[]>([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token")!;

  useEffect(() => {
    getRegulationHistory(token)
      .then(setHistory)
      .catch(() => setError("No se pudo cargar el historial."));
  }, [token]);

  return (
    <main className="container">
      <h3>Historial de versiones del reglamento</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {history.map(r => (
          <li key={r.id}>
            Versión {r.version} — Fecha: {new Date(r.uploadDate).toLocaleString()} —&nbsp;
            <a href={getRegulationDownloadUrl(r.id)}>Descargar PDF</a>
          </li>
        ))}
      </ul>
      {history.length === 0 && <p>No hay reglamentos subidos aún.</p>}
    </main>
  );
}
