import RegulationUploader from "../components/RegulationUploader";
import RegulationViewer from "../pages/public/RegulationViewer";
import RegulationHistory from "../components/RegulationHistory";

export default function RegulationAdminPanel() {
  return (
    <main className="container" style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <h1 style={{
        fontSize: "2rem",
        fontWeight: "bold",
        color: "#2563eb",
        marginBottom: 28,
        textAlign: "left"
      }}>
        Gestión de Reglamento
      </h1>

      <section style={{ marginBottom: 32 }}>
     
        <RegulationViewer />
      </section>

      <hr style={{ margin: "32px 0", border: "none", borderTop: "2px solid #e5e7eb" }} />

      <section style={{ marginBottom: 32 }}>

        <RegulationUploader />
      </section>

      <hr style={{ margin: "32px 0", border: "none", borderTop: "2px solid #e5e7eb" }} />

      <section>
        <h2 style={{
          fontSize: "1.2rem",
          fontWeight: 600,
          color: "#374151",
          marginBottom: 12
        }}>
          Historial de reglamentos
        </h2>
        <RegulationHistory />
      </section>
    </main>
  );
}
