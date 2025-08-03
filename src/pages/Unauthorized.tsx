import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <main className="container">
      <h2 style={{ color: "crimson" }}>⚠️ Acceso no autorizado</h2>
      <p>No tienes permiso para acceder a este equipo o sección.</p>
      <button className="btn-primary" onClick={() => navigate("/")}>
        Volver al inicio
      </button>
    </main>
  );
}
