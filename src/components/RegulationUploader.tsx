import { useState } from "react";
import { uploadRegulation } from "../api/regulations";

export default function RegulationUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token")!;

  const handleUpload = async () => {
    if (!file) {
      setMessage("Selecciona un archivo PDF.");
      return;
    }
    try {
      await uploadRegulation(file, token);
      setMessage("Reglamento subido correctamente");
      setFile(null);
    } catch (e) {
      setMessage("Error al subir el reglamento");
    }
  };

  return (
    <main className="container">
      <h2>Subir nuevo reglamento (PDF)</h2>
      <input
        type="file"
        accept="application/pdf"
        onChange={e => setFile(e.target.files?.[0] ?? null)}
      />
      <button onClick={handleUpload}>Subir</button>
      {message && <p>{message}</p>}
    </main>
  );
}
