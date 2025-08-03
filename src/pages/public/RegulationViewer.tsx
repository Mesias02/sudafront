import { useEffect, useState } from "react";
import { getLatestRegulationUrl } from "../../api/regulations"; // O regulation, según tu ruta

export default function RegulationViewer() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Cada vez que este componente se renderiza, pone un parámetro aleatorio para evitar cache
    const url = getLatestRegulationUrl();
    setPdfUrl(url + "?t=" + Date.now());
  }, []);

  return (
    <main className="container">
      <h2>Reglamento del Torneo</h2>
      {!pdfUrl && <p>Cargando reglamento...</p>}
      {pdfUrl && (
        <>
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            style={{ border: "none" }}
            title="Reglamento"
            onError={() => setError("No se puede visualizar el PDF, pero puedes descargarlo abajo.")}
          />
          <br />
          <a href={pdfUrl} download="reglamento.pdf">
            Descargar PDF
          </a>
        </>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
