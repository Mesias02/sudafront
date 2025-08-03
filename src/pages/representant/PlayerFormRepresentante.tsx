import { useEffect, useState, useMemo } from "react";
import { createPlayer, getPlayersByTeam } from "../../api/players";
import { getTeamOfRepresentative } from "../../api/teams";
import { useNavigate } from "react-router-dom";
import { Player } from "../../types/player";
import Modal from "../../components/Modal";
import FilterBar from "../../components/FilterBar";
import DataTable from "../../components/DataTable";

export default function PlayerFormRepresentante() {
  const token = localStorage.getItem("token")!;
  const navigate = useNavigate();

  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    cedula: "",
    dorsal: "",
    carrera: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [carreraFilter, setCarreraFilter] = useState("");

  useEffect(() => {
    const loadTeamAndPlayers = async () => {
      try {
        const t = await getTeamOfRepresentative(token);
        setTeam(t);
        const playersOfTeam = await getPlayersByTeam(t.id, token);
        setPlayers(playersOfTeam);
      } catch (e) {
        setMessage("No tienes equipo asignado o hubo un error.");
      }
    };
    loadTeamAndPlayers();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dorsalNum = Number(form.dorsal);

    if (!form.name || !form.cedula || !form.carrera || form.dorsal.trim() === "") {
      setModalMessage("Todos los campos son obligatorios");
      return;
    }
    if (isNaN(dorsalNum) || dorsalNum <= 0) {
      setModalMessage("El dorsal debe ser un número mayor a 0");
      return;
    }
    const duplicateCedula = players.find((p) => p.cedula === form.cedula);
    if (duplicateCedula) {
      setModalMessage("Ya existe un jugador con esa cédula en tu equipo");
      return;
    }
    const duplicateDorsal = players.find((p) => p.dorsal === dorsalNum);
    if (duplicateDorsal) {
      setModalMessage("Ya existe un jugador con ese dorsal en tu equipo");
      return;
    }

    try {
      await createPlayer({ ...form, dorsal: dorsalNum, teamId: team.id }, token);
      setModalMessage("Jugador registrado correctamente");
      setForm({ name: "", cedula: "", dorsal: "", carrera: "" });
      const updatedPlayers = await getPlayersByTeam(team.id, token);
      setPlayers(updatedPlayers);

      setTimeout(() => {
        setOpenModal(false);
        setModalMessage("");
      }, 1200);
    } catch {
      setModalMessage("Error al registrar jugador");
    }
  };

  const handleDorsalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setForm({ ...form, dorsal: value });
    }
  };

  // Filtros únicos de carrera
  const carreraOptions = useMemo(
    () =>
      Array.from(new Set(players.map((p) => p.carrera).filter(Boolean))).map((carrera) => ({
        value: carrera,
        label: carrera,
      })),
    [players]
  );

  // Filtrado de jugadores
  const filteredPlayers = useMemo(() => {
    let arr = players;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.cedula.includes(search) ||
          String(p.dorsal).includes(search) ||
          (p.carrera?.toLowerCase().includes(search) ?? false)
      );
    }
    if (carreraFilter) arr = arr.filter((p) => p.carrera === carreraFilter);
    // Agregar índice para la tabla
    return arr.map((p, i) => ({ ...p, index: i + 1 }));
  }, [players, searchTerm, carreraFilter]);

  // Columnas para DataTable
  const columns = [
    { key: "index", label: "#", sortable: false },
    { key: "name", label: "Nombre", sortable: true },
    { key: "cedula", label: "Cédula", sortable: true },
    { key: "dorsal", label: "Dorsal", sortable: true },
    { key: "carrera", label: "Carrera", sortable: true },
  ];

  if (!team && !message) return <main className="container"><p>Cargando tu equipo...</p></main>;
  if (!team && message) return <main className="container"><p>{message}</p></main>;

  return (
    <main className="container max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 mt-10 mb-8">
                    <button className="btn-back" onClick={() => navigate("/my-team")}></button>

        <div className="flex flex-col md:flex-row justify-between mb-6">
          
          <h2 className="text-2xl font-bold mb-4 md:mb-0">
            Agregar jugador a: <span className="text-blue-800">{team.name}</span>
          </h2>
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => setOpenModal(true)}>
              Registrar jugador
            </button>
          </div>
        </div>

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
                marginBottom: "12px",
                background: modalMessage.includes("Error") ? "#fee2e2" :
                  modalMessage.includes("registrado") ? "#d1fae5" : "#fffbe5",
                color: modalMessage.includes("Error") ? "#991b1b" :
                  modalMessage.includes("registrado") ? "#065f46" : "#924400",
                borderRadius: "10px",
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
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Cédula"
              maxLength={10}
              value={form.cedula}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,10}$/.test(value)) {
                  setForm({ ...form, cedula: value });
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
              onChange={(e) => setForm({ ...form, carrera: e.target.value })}
            />
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button className="btn-primary" type="submit">
                Guardar
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setOpenModal(false); setModalMessage(""); }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal>

        <hr className="my-8" />

        <h3 className="text-xl font-semibold mb-2">Jugadores registrados en tu equipo</h3>

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nombre, cédula, dorsal, carrera..."
          
          onClear={() => { setSearchTerm(""); setCarreraFilter(""); }}
        />

        <DataTable
          data={filteredPlayers}
          columns={columns}
          loading={false}
          emptyMessage="No hay jugadores registrados."
          hoverable
          striped
        />
      </div>
    </main>
  );
}
