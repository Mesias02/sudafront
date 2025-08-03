import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Player } from "../../types/player";
import { getPlayersByTeam, updatePlayer, deletePlayer } from "../../api/players";
import { getTeams, getTeamOfRepresentative } from "../../api/teams";
import { jwtDecode } from "jwt-decode";
import ConfirmDialog from "../../components/ConfirmDialog";

interface TokenPayload {
  sub: string;
  role: string;
}

export default function TeamPlayers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token")!;
  const payload = jwtDecode<TokenPayload>(token);
  const isRepresentative = payload.role === "REPRESENTANTE";

  const [teamId, setTeamId] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    cedula: "",
    dorsal: 0,
    carrera: ""
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; playerId?: number }>({ isOpen: false });

  useEffect(() => {
    const setup = async () => {
      try {
        if (isRepresentative) {
          const team = await getTeamOfRepresentative(token);
          if (parseInt(id!) !== team.id) {
            navigate("/unauthorized");
            return;
          }
          setTeamId(team.id);
          setTeamName(team.name);
          const data = await getPlayersByTeam(team.id, token);
          setPlayers(data);
        } else {
          const teamIdNumber = parseInt(id!);
          setTeamId(teamIdNumber);
          const teams = await getTeams(token);
          const currentTeam = teams.find((t: any) => t.id === teamIdNumber);
          setTeamName(currentTeam?.name || "");
          const data = await getPlayersByTeam(teamIdNumber, token);
          setPlayers(data);
        }
      } catch {
        setMessage("Error al cargar datos");
      }
    };
    setup();
    // eslint-disable-next-line
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.cedula || !form.carrera || form.dorsal <= 0) {
      setMessage("Todos los campos son obligatorios y válidos");
      return;
    }

    if (!/^\d{10}$/.test(form.cedula)) {
      setMessage("La cédula debe tener exactamente 10 dígitos numéricos");
      return;
    }

    const duplicate = players.find(p =>
      (p.cedula === form.cedula || p.name.toLowerCase() === form.name.toLowerCase() || p.dorsal === form.dorsal) &&
      (editId === null || p.id !== editId)
    );
    if (duplicate) {
      setMessage("Ya existe un jugador con la misma cédula, nombre o dorsal en este equipo");
      return;
    }

    try {
      const dataToSend = isRepresentative
        ? { ...form }
        : { ...form, teamId };

      await updatePlayer(editId!, dataToSend, token);
      setMessage("Jugador actualizado");
      setForm({ name: "", cedula: "", dorsal: 0, carrera: "" });
      setEditId(null);
      const data = await getPlayersByTeam(teamId!, token);
      setPlayers(data);
    } catch (err: any) {
      setMessage(err.response?.data || "Error al actualizar jugador");
    }
  };

  const handleEdit = (p: Player) => {
    setForm({
      name: p.name,
      cedula: p.cedula,
      dorsal: p.dorsal,
      carrera: p.carrera,
    });
    setEditId(p.id);
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({ isOpen: true, playerId: id });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.playerId) return;
    try {
      await deletePlayer(confirmDialog.playerId, token);
      setMessage("Jugador eliminado");
      const data = await getPlayersByTeam(teamId!, token);
      setPlayers(data);
    } catch {
      setMessage("Error al eliminar jugador");
    } finally {
      setConfirmDialog({ isOpen: false });
    }
  };

  return (
    <main className="team-players-container">
      <style>{`
        .team-players-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 24px;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 12px #0002;
        }
        @media (max-width: 700px) {
          .team-players-container {
            padding: 10px;
            border-radius: 6px;
          }
        }
        h2 {
          color: #2563eb;
          font-weight: bold;
        }
        .form-player-edit {
          display: grid;
          gap: 10px;
          max-width: 450px;
          margin-bottom: 18px;
          background: #f9fafb;
          padding: 18px 14px;
          border-radius: 10px;
        }
        @media (max-width: 500px) {
          .form-player-edit {
            max-width: 100%;
            padding: 10px 2px;
          }
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 18px;
          min-width: 540px;
        }
        th, td {
          padding: 10px 7px;
          text-align: center;
        }
        th {
          background: #e5e7eb;
          color: #22223b;
        }
        tr:nth-child(even) td {
          background: #f1f5f9;
        }
        @media (max-width: 700px) {
          table {
            min-width: 420px;
            font-size: 13px;
          }
          th, td {
            padding: 8px 3px;
          }
        }
        @media (max-width: 480px) {
          table {
            min-width: 300px;
            font-size: 11.5px;
          }
          th, td {
            padding: 6px 2px;
          }
        }
        .btn-back {
          margin-top: 10px;
          margin-bottom: 10px;
          background: #f3f4f6;
          border: none;
          border-radius: 10px;
          padding: 6px 16px;
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-back:hover {
          background: #e0e7ef;
        }
      `}</style>

      <h2>Jugadores del equipo {teamName}</h2>
      {message && <p>{message}</p>}

      {editId !== null && (
        <form onSubmit={handleSubmit} className="form-player-edit">
          <input
            type="text"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Cédula"
            value={form.cedula}
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,10}$/.test(value)) {
                setForm({ ...form, cedula: value });
              }
            }}
          />
          <input
            type="number"
            placeholder="Dorsal"
            value={form.dorsal}
            onChange={(e) => setForm({ ...form, dorsal: parseInt(e.target.value) || 0 })}
          />
          <input
            type="text"
            placeholder="Carrera"
            value={form.carrera}
            onChange={(e) => setForm({ ...form, carrera: e.target.value })}
          />
          <div style={{display: "flex", gap: 8}}>
            <button className="btn-tertiary" type="submit">Actualizar</button>
            <button type="button" onClick={() => {
              setForm({ name: "", cedula: "", dorsal: 0, carrera: "" });
              setEditId(null);
            }} className="btn-neutral">Cancelar</button>
          </div>
        </form>
      )}

      <button className="btn-back" onClick={() => navigate("/teams")}>
        Volver
      </button>

      <hr />
      <h3>Lista de jugadores</h3>
      <div style={{overflowX: "auto"}}>
        <table>
          <thead>
            <tr>
              <th>Nombre</th><th>Cédula</th><th>Dorsal</th><th>Carrera</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {players.sort((a, b) => a.id - b.id).map((p: Player) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.cedula}</td>
                <td>{p.dorsal}</td>
                <td>{p.carrera}</td>
                <td style={{ display: 'flex', gap: '5px', justifyContent: 'center', padding: '15px' }}>
  <button
    className="btn-primary btn-sm"
    onClick={() => handleEdit(p)}
  >
    Editar
  </button>
  <button
    className="btn-secondary btn-sm"
    onClick={() => handleDelete(p.id)}
  >
    Eliminar
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmDelete}
        title="¿Eliminar jugador?"
        message="¿Seguro que deseas eliminar este jugador? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        icon="🗑️"
      />
    </main>
  );
}
