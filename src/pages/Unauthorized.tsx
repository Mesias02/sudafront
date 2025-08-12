import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <main className="container">
      <h2 style={{ color: "crimson" }}>⚠️ Acceso no autorizado</h2>
      <p>No tienes permiso para acceder a este equipo o sección.</p>
     <BackButton to="/" className="mb-3" />

    </main>
  );
}
