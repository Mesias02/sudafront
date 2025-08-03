import { useEffect, useState } from "react";
import { createPlayer, getPlayers } from "../api/players";
import { getTeams } from "../api/teams";
import { Player } from "../types/player";
import { Team } from "../types/team";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import FilterBar from "../components/FilterBar";

export default function PlayerForm() {
  const token = localStorage.getItem("token")!;
  const navigate = useNavigate();

  // Datos
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [modalMessage, setModalMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    cedula: "",
    dorsal: "",
    carrera: "",
    teamId: 0
  });
  const [openModal, setOpenModal] = useState(false);

  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await getPlayers(token);
      // Tipamos a y b como Player para TS
      const sortedPlayers = data.sort((a: Player, b: Player) =>
        a.name.localeCompare(b.name)
      );
      setPlayers(sortedPlayers);

      const teamData = await getTeams(token);
      setTeams(teamData);
    };
    load();
  }, [token]);

  const handleDorsalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^\d*$/.test(e.target.value)) {
      setForm({ ...form, dorsal: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dorsalNum = Number(form.dorsal);

    // Validaciones
    if (!form.name || !form.cedula || !form.carrera || !form.dorsal.trim() || form.teamId === 0) {
      setModalMessage("Todos los campos son obligatorios");
      return;
    }
    if (!/^\d{10}$/.test(form.cedula)) {
      setModalMessage("La cédula debe tener exactamente 10 dígitos numéricos");
      return;
    }
    if (isNaN(dorsalNum) || dorsalNum <= 0) {
      setModalMessage("El dorsal debe ser un número mayor a 0");
      return;
    }
    if (players.find(p => p.cedula === form.cedula && p.team?.id === form.teamId)) {
      setModalMessage("Ya existe un jugador con esa cédula en ese equipo");
      return;
    }
    if (players.find(p => p.dorsal === dorsalNum && p.team?.id === form.teamId)) {
      setModalMessage("Ya existe un jugador con ese dorsal en ese equipo");
      return;
    }

    // Envío
    try {
      await createPlayer({ ...form, dorsal: dorsalNum }, token);
      setModalMessage("Jugador registrado correctamente");
      setForm({ name: "", cedula: "", dorsal: "", carrera: "", teamId: 0 });

      const data = await getPlayers(token);
      const sortedPlayers2 = data.sort((a: Player, b: Player) =>
        a.name.localeCompare(b.name)
      );
      setPlayers(sortedPlayers2);

      setTimeout(() => {
        setOpenModal(false);
        setModalMessage("");
      }, 1200);
    } catch {
      setModalMessage("Error al registrar jugador");
    }
  };

  // Lista filtrada
  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cedula.includes(searchTerm) ||
    p.dorsal.toString().includes(searchTerm) ||
    p.carrera.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.team?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="container">
      {/* Botón Volver */}
      <button
        onClick={() => navigate("/panel")}
        style={{
          backgroundColor: "#f3f4f6",
          borderRadius: 12,
          padding: "8px 12px",
          border: "none",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          cursor: "pointer",
          width: 40,
          height: 40,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <span style={{ fontSize: 18, color: "#374151" }}>←</span>
      </button>

      <h2 style={{ color: "#2563eb", fontWeight: "bold", marginBottom: 20 }}>
        Gestión de jugadores
      </h2>

      <button className="btn-primary" onClick={() => setOpenModal(true)} style={{ marginBottom: 28 }}>
        Registrar jugador
      </button>

      {/* Modal de registro */}
      <Modal
        isOpen={openModal}
        onClose={() => { setOpenModal(false); setModalMessage(""); }}
        title="Registrar jugador"
        size="sm"
      >
        {modalMessage && (
          <div
            style={{
              padding: "10px 14px",
              marginBottom: 12,
              background: modalMessage.includes("Error") ? "#fee2e2" :
                         modalMessage.includes("registrado") ? "#d1fae5" : "#fffbe5",
              color: modalMessage.includes("Error") ? "#991b1b" :
                     modalMessage.includes("registrado") ? "#065f46" : "#924400",
              borderRadius: 10,
              border: `1px solid ${modalMessage.includes("Error") ? "#fca5a5" : "#a7f3d0"}`
            }}
          >
            {modalMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14, maxWidth: 350 }}>
          <input
            type="text"
            placeholder="Nombre"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Cédula"
            maxLength={10}
            value={form.cedula}
            onChange={e => {
              if (/^\d{0,10}$/.test(e.target.value)) {
                setForm({ ...form, cedula: e.target.value });
              }
            }}
          />
          <input
            type="text"
            placeholder="Dorsal"
            value={form.dorsal}
            onChange={handleDorsalInput}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
          />
          <input
            type="text"
            placeholder="Carrera"
            value={form.carrera}
            onChange={e => setForm({ ...form, carrera: e.target.value })}
          />
          <select
            value={form.teamId}
            onChange={e => setForm({ ...form, teamId: Number(e.target.value) })}
          >
            <option value={0}>Selecciona un equipo</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
            <button className="btn-primary" type="submit">Guardar</button>
            <button className="btn-secondary" type="button" onClick={() => { setOpenModal(false); setModalMessage(""); }}>Cancelar</button>
          </div>
        </form>
      </Modal>

      <hr style={{ margin: "32px 0" }} />

      <h3 style={{ marginBottom: 16, color: "#374151", fontWeight: 600 }}>
        Lista de jugadores registrados
      </h3>

      {/* Filtro */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar jugadores…"
        onClear={() => setSearchTerm("")}
      />

      {/* Tabla filtrada */}
     {/* Tabla filtrada */}
<div style={{
  width: "100%",
  overflowX: "auto",
  marginBottom: 24,
  borderRadius: 12,
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  background: "#fff"
}}>
  <table style={{
    minWidth: 650,
    width: "100%",
    borderCollapse: "collapse"
  }}>
    <thead>
      <tr>
        <th>#</th>
        <th>Nombre</th>
        <th>Cédula</th>
        <th>Dorsal</th>
        <th>Carrera</th>
        <th>Equipo</th>
      </tr>
    </thead>
    <tbody>
      {filteredPlayers.map((p, i) => (
        <tr key={p.id}>
          <td>{i + 1}</td>
          <td>{p.name}</td>
          <td>{p.cedula}</td>
          <td>{p.dorsal}</td>
          <td>{p.carrera}</td>
          <td>{p.team?.name || "Sin equipo"}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </main>
  );
}
