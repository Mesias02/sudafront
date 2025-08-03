import { useEffect, useState } from "react";
import { getTeams } from "../api/teams";
import {
  getMatches,
  createMatch,
  updateMatch,
  deleteMatch,
  MatchDTO,
  MatchCreateDTO,
} from "../api/matches";
import ConfirmDialog from "../components/ConfirmDialog";

interface TeamDTO {
  id: number;
  name: string;
}

const initialFormState: MatchCreateDTO & { id?: number; status?: string } = {
  homeTeamId: 0,
  awayTeamId: 0,
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  status: "PENDING",
};

export default function MatchManager() {
  const token = localStorage.getItem("token") || "";

  const [teams, setTeams] = useState<TeamDTO[]>([]);
  const [matches, setMatches] = useState<MatchDTO[]>([]);
  const [form, setForm] = useState<typeof initialFormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ConfirmDialog state
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; matchId?: number }>({ isOpen: false });

  useEffect(() => {
    getTeams(token)
      .then(setTeams)
      .catch(() => setError("No se pudieron cargar los equipos"));
    fetchMatches();
    // eslint-disable-next-line
  }, [token]);

  const fetchMatches = () => {
    getMatches()
      .then((data) => {
        const sorted = data.slice().sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return a.startTime.localeCompare(b.startTime);
        });
        setMatches(sorted);
      })
      .catch(() => setError("No se pudieron cargar los partidos"));
  };

  function handleChange(
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name.includes("Id") ? Number(value) : value,
    }));
  }

  function validate(): string | null {
    if (!form.homeTeamId || !form.awayTeamId)
      return "Selecciona ambos equipos.";
    if (form.homeTeamId === form.awayTeamId)
      return "Los equipos no pueden ser iguales.";
    if (!form.date) return "Selecciona una fecha.";
    if (!form.startTime || !form.endTime)
      return "Selecciona la hora inicio y fin.";
    if (form.startTime >= form.endTime)
      return "La hora de inicio debe ser antes de la hora de fin.";
    if (!form.location.trim()) return "Ingresa el lugar del partido.";
    if (!form.status) return "Selecciona el estado.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      if (editId) {
        await updateMatch(editId, form, token);
        setMessage("Partido actualizado con éxito.");
      } else {
        await createMatch(form, token);
        setMessage("Partido creado con éxito.");
      }
      setForm(initialFormState);
      setEditId(null);
      fetchMatches();
    } catch (err: any) {
      let msg = "Error al guardar el partido";
      if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(match: MatchDTO) {
    setForm({
      homeTeamId: teams.find((t) => t.name === match.homeTeamName)?.id || 0,
      awayTeamId: teams.find((t) => t.name === match.awayTeamName)?.id || 0,
      date: match.date,
      startTime: match.startTime,
      endTime: match.endTime,
      location: match.location,
      status: match.status,
    });
    setEditId(match.id);
    setError(null);
    setMessage("");
  }

  function handleDelete(matchId: number) {
    setConfirmDialog({ isOpen: true, matchId });
  }

  async function confirmDeleteMatch() {
    if (!confirmDialog.matchId) return;
    try {
      await deleteMatch(confirmDialog.matchId, token);
      setMessage("Partido eliminado con éxito.");
      fetchMatches();
    } catch (err: any) {
      setError("Error al eliminar el partido");
    }
    setConfirmDialog({ isOpen: false });
  }

  function handleCancelEdit() {
    setForm(initialFormState);
    setEditId(null);
    setError(null);
    setMessage("");
  }

  const localOptions = teams.filter((t) => t.id !== form.awayTeamId);
  const visitanteOptions = teams.filter((t) => t.id !== form.homeTeamId);

  // Traducción de estado para el filtro
  const estadoTraducido = (status: string) => {
    switch (status) {
      case "PENDING": return "pendiente";
      case "COMPLETED": return "jugado";
      case "CANCELLED": return "cancelado";
      default: return status.toLowerCase();
    }
  };

  // Filtro mejorado
  const filteredMatches = matches.filter((m) => {
    const matchStatus = estadoTraducido(m.status);
    return (
      m.homeTeamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.awayTeamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      matchStatus.includes(searchTerm.toLowerCase()) ||
      m.date.includes(searchTerm) ||
      m.startTime.includes(searchTerm)
    );
  });

  return (
    <div className="match-manager-main">
      <style>{`
        .match-manager-main { background: #f8fafc; padding: 40px 0; min-height: 100vh; }
        .match-manager-container { background: #fff; border-radius: 14px; box-shadow: 0 4px 24px #0001; max-width: 900px; margin: 0 auto; padding: 30px 30px 40px 30px; }
        .mm-header { text-align: center; font-size: 2rem; font-weight: bold; letter-spacing: 1px; margin-bottom: 32px; }
        .mm-teams-row { display: flex; align-items: stretch; justify-content: center; gap: 32px; margin-bottom: 18px; }
        .mm-card { background: #f1f5f9; flex: 1; padding: 24px 18px; border-radius: 12px; text-align: center; box-shadow: 0 2px 10px #0001; min-width: 180px; }
        .mm-card label { font-size: 1.15rem; font-weight: 500; margin-bottom: 10px; display: block; color: #222; }
        .mm-card select { font-size: 1rem; width: 90%; padding: 9px 8px; border-radius: 6px; border: 1px solid #cbd5e1; margin-top: 10px; background: #fff; color: #222; }
        .mm-vs { display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: bold; color: #64748b; min-width: 65px; }
        .mm-fields-row { display: flex; gap: 18px; margin-bottom: 18px; align-items: flex-end; }
        .mm-fields-row > div { flex: 1; }
        .mm-fields-row label { font-size: 1rem; font-weight: 500; color: #222; }
        .mm-fields-row input, .mm-fields-row select { width: 100%; font-size: 1rem; border-radius: 6px; border: 1px solid #cbd5e1; padding: 8px 8px; margin-top: 5px; background: #fff; color: #222; }
        .mm-fields-row input:focus, .mm-fields-row select:focus, .mm-card select:focus { border: 1.5px solid #2563eb; outline: none; }
        .mm-btns-row { display: flex; gap: 16px; margin-bottom: 12px; }
        .mm-btn-main { background: #2563eb; color: #fff; border: none; border-radius: 6px; padding: 10px 20px; cursor: pointer; }
        .mm-btn-main:hover { background: #1e40af; }
        .mm-btn-cancel { background: #6b7280; color: #fff; border: none; border-radius: 6px; padding: 10px 20px; cursor: pointer; }
        .mm-btn-cancel:hover { background: #4b5563; }
        .mm-message { padding: 14px 0; margin-bottom: 14px; border-radius: 7px; text-align: center; font-weight: 500; }
        .mm-message.error { background: #fee2e2; color: #991b1b; }
        .mm-message.success { background: #bbf7d0; color: #14532d; }
        .mm-table-container { overflow-x: auto; margin-top: 26px; }
        .mm-table { width: 100%; border-collapse: collapse; background: #fff; color: #222 !important; }
        .mm-table th, .mm-table td { padding: 10px 12px; text-align: center; border-bottom: 1px solid #e2e8f0; }
        .mm-table th { background: #e5e7eb !important; color: #1e293b !important; font-weight: bold; opacity: 1 !important; }
        .mm-table td { color: #222 !important; opacity: 1 !important; }
        .mm-table tr:nth-child(even) td { background: #f9fafb; }
        .mm-table-status { padding: 3px 10px; border-radius: 10px; font-weight: bold; font-size: 13px; display: inline-block; }
        .mm-status-pending { background: #fef3c7; color: #92400e; }
        .mm-status-completed { background: #d1fae5; color: #065f46; }
        .mm-status-cancelled { background: #fee2e2; color: #991b1b; }
        @media (max-width: 768px) {
  .match-manager-container {
    padding: 12px 2vw 22px 2vw;
    max-width: 99vw;
  }
  .mm-header {
    font-size: 1.2rem;
    margin-bottom: 22px;
  }
  .mm-teams-row {
    flex-direction: column;
    gap: 12px;
  }
  .mm-card {
    min-width: unset;
    padding: 14px 7px;
  }
  .mm-fields-row {
    flex-direction: column;
    gap: 10px;
  }
  .mm-fields-row > div {
    width: 100%;
  }
  .mm-table th, .mm-table td {
    font-size: 13px;
    padding: 6px 4px;
  }
  .mm-table-container {
    margin-top: 18px;
  }
  input, select {
    font-size: 1rem;
  }
}

@media (max-width: 430px) {
  .mm-header { font-size: 1rem; }
  .mm-card label { font-size: 1rem; }
  .mm-btn-main, .mm-btn-cancel {
    padding: 7px 10px;
    font-size: 0.98rem;
  }
  .mm-table th, .mm-table td {
    font-size: 11px;
    padding: 4px 2px;
  }
}

      `}</style>
      <div className="match-manager-container">
        <div className="mm-header">{editId ? "Editar Partido" : "Programar Partido"}</div>
        {error && <div className="mm-message error">{error}</div>}
        {message && <div className="mm-message success">{message}</div>}

        <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
          <div className="mm-teams-row">
            <div className="mm-card">
              <label>LOCAL</label>
              <select
                name="homeTeamId"
                value={form.homeTeamId}
                onChange={handleChange}
              >
                <option value={0}>Selecciona local</option>
                {localOptions.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="mm-vs">VS</div>
            <div className="mm-card">
              <label>VISITANTE</label>
              <select
                name="awayTeamId"
                value={form.awayTeamId}
                onChange={handleChange}
              >
                <option value={0}>Selecciona visitante</option>
                {visitanteOptions.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mm-fields-row">
            <div>
              <label>Lugar
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Ingrese lugar del partido"
                />
              </label>
            </div>
            <div>
              <label>Fecha
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </label>
            </div>
            <div>
              <label>Inicio
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                />
              </label>
            </div>
            <div>
              <label>Fin
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                />
              </label>
            </div>
          </div>

          <div className="mm-btns-row">
            <button
              type="submit"
              disabled={loading}
              className="mm-btn-main"
            >
              {loading
                ? "Guardando..."
                : editId
                  ? "Actualizar Partido"
                  : "Guardar Partido"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="mm-btn-cancel"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Filtro */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Filtrar por equipo, estado, fecha..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 14px",
              border: "1.5px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "1rem",
              minWidth: "260px",
              background: "#f3f4f6"
            }}
          />
        </div>

        <div className="mm-table-container">
          <h3 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>Partidos Programados</h3>
          <table className="mm-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Local</th>
                <th>Visitante</th>
                <th>Lugar</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((match) => (
                <tr key={match.id}>
                  <td>{match.date}</td>
                  <td>{match.startTime.slice(0, 5)} - {match.endTime.slice(0, 5)}</td>
                  <td>{match.homeTeamName}</td>
                  <td>{match.awayTeamName}</td>
                  <td>{match.location}</td>
                  <td>
                    {match.status === "PENDING" ? (
                      <span className="mm-table-status mm-status-pending">Pendiente</span>
                    ) : match.status === "COMPLETED" ? (
                      <span className="mm-table-status mm-status-completed">Jugado</span>
                    ) : (
                      <span className="mm-table-status mm-status-cancelled">Cancelado</span>
                    )}
                  </td>
<td style={{ display: 'flex', gap: '5px', justifyContent: 'center', padding: '15px' }}>
  <button
    className="btn-primary btn-sm"
    onClick={() => handleEdit(match)}
  >
    Editar
  </button>
  <button
    className="btn-secondary btn-sm"
    onClick={() => handleDelete(match.id)}
  >
    Eliminar
  </button>
</td>


                </tr>
              ))}
              {filteredMatches.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#6b7280", padding: "16px 0" }}>
                    No hay partidos programados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmDeleteMatch}
        title="¿Eliminar partido?"
        message="¿Seguro que deseas eliminar este partido? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        icon="🗑️"
      />
    </div>
  );
}
