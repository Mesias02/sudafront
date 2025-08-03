import { useEffect, useState, useMemo } from "react";
import { getTeamOfRepresentative } from "../../api/teams";
import { getPlayersByTeam, updatePlayer, deletePlayer } from "../../api/players";
import { Player } from "../../types/player";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import DataTable from "../../components/DataTable";
import FilterBar from "../../components/FilterBar";

export default function MyTeamPanel() {
  const [team, setTeam] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", cedula: "", dorsal: "", carrera: "" });
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [carreraFilter, setCarreraFilter] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; playerId?: number }>({ isOpen: false });
  const token = localStorage.getItem("token")!;
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const teamData = await getTeamOfRepresentative(token);
        setTeam(teamData);
        const playersData = await getPlayersByTeam(teamData.id, token);
        setPlayers(playersData);
      } catch (err) {
        setMessage("Error al cargar tu equipo. Es posible que no tengas uno asignado.");
      }
    };
    loadData();
  }, [token]);

  // Opciones únicas de carrera para el filtro
  const carreraOptions = useMemo(
    () =>
      Array.from(new Set(players.map((p) => p.carrera).filter(Boolean))).map((carrera) => ({
        value: carrera,
        label: carrera,
      })),
    [players]
  );

  // Filtrar y numerar jugadores
  const filteredPlayers = useMemo(() => {
    let arr = players;
    if (search) {
      const s = search.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.cedula.includes(s) ||
          String(p.dorsal).includes(s)
      );
    }
    if (carreraFilter) arr = arr.filter((p) => p.carrera === carreraFilter);
    return arr.map((p, i) => ({ ...p, index: i + 1 }));
  }, [players, search, carreraFilter]);

  const handleEdit = (player: Player) => {
    setEditId(player.id);
    setEditForm({
      name: player.name,
      cedula: player.cedula,
      dorsal: String(player.dorsal),
      carrera: player.carrera,
    });
  };

  const handleUpdate = async (id: number) => {
    if (
      !editForm.name ||
      !editForm.cedula ||
      !editForm.carrera ||
      editForm.dorsal.trim() === ""
    ) {
      setMessage("Todos los campos son obligatorios");
      return;
    }

    const dorsalNum = Number(editForm.dorsal);
    if (isNaN(dorsalNum) || dorsalNum <= 0) {
      setMessage("El dorsal debe ser un número mayor a 0");
      return;
    }

    const duplicateDorsal = players.some(
      (p) => p.dorsal === dorsalNum && p.id !== id
    );

    if (duplicateDorsal) {
      setMessage("Ya existe un jugador con ese dorsal en tu equipo.");
      return;
    }

    try {
      await updatePlayer(id, { ...editForm, dorsal: dorsalNum, teamId: team.id }, token);
      const updatedPlayers = await getPlayersByTeam(team.id, token);
      setPlayers(updatedPlayers);
      setEditId(null);
      setEditForm({ name: "", cedula: "", dorsal: "", carrera: "" });
      setMessage("Jugador actualizado correctamente.");
    } catch (err: any) {
      setMessage("Error al actualizar jugador: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = (id: number) => {
    setConfirmDialog({ isOpen: true, playerId: id });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.playerId) return;
    try {
      await deletePlayer(confirmDialog.playerId, token);
      const updatedPlayers = await getPlayersByTeam(team.id, token);
      setPlayers(updatedPlayers);
      setMessage("Jugador eliminado correctamente.");
    } catch (err: any) {
      setMessage("Error al eliminar jugador: " + (err.response?.data?.message || err.message));
    } finally {
      setConfirmDialog({ isOpen: false });
    }
  };

  const handleDorsalInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setEditForm({ ...editForm, dorsal: value });
    }
  };

  // Columnas para DataTable
  const columns = [
    { key: "index", label: "#", sortable: false },
    { key: "name", label: "Nombre", sortable: true,
      render: (_: any, row: any) =>
        editId === row.id ?
          <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /> :
          row.name
    },
    { key: "cedula", label: "Cédula", sortable: true,
      render: (_: any, row: any) =>
        editId === row.id ?
          <input value={editForm.cedula} onChange={e => setEditForm({ ...editForm, cedula: e.target.value })} /> :
          row.cedula
    },
    { key: "dorsal", label: "Dorsal", sortable: true,
      render: (_: any, row: any) =>
        editId === row.id ?
          <input
            type="text"
            value={editForm.dorsal}
            onChange={handleDorsalInput}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
          /> :
          row.dorsal
    },
    { key: "carrera", label: "Carrera", sortable: true,
      render: (_: any, row: any) =>
        editId === row.id ?
          <input value={editForm.carrera} onChange={e => setEditForm({ ...editForm, carrera: e.target.value })} /> :
          row.carrera
    },
    {
      key: "actions",
      label: "Acciones",
      sortable: false,
      render: (_: any, row: any) =>
        editId === row.id ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-tertiary btn-sm" onClick={() => handleUpdate(row.id)}>Guardar</button>
            <button className="btn-neutral btn-sm" onClick={() => setEditId(null)}>Cancelar</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary btn-sm" onClick={() => handleEdit(row)}>Editar</button>
            <button className="btn-secondary btn-sm" onClick={() => handleDelete(row.id)}>Eliminar</button>
          </div>
        )
    }
  ];

  if (!team) return <p>{message || "Cargando equipo..."}</p>;

  return (
    <div className="max-w-5xl mx-auto py-10">
                  <button className="btn-back" onClick={() => navigate("/my-team")}></button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        
 <h2 className="text-3xl font-bold text-white drop-shadow  ">
    Mi equipo: {team.name}
  </h2>

        {message && (
          <div style={{
            padding: "10px 14px",
            marginBottom: "16px",
            background: message.includes("Error") ? "#fee2e2" : "#d1fae5",
            color: message.includes("Error") ? "#991b1b" : "#065f46",
            borderRadius: "10px",
            border: `1px solid ${message.includes("Error") ? "#fca5a5" : "#a7f3d0"}`
          }}>
            {message}
          </div>
        )}

        <h3 className="text-xl font-semibold mb-2 text-white">Jugadores registrados</h3>

        <FilterBar
          searchTerm={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por nombre, cédula o dorsal..."
          filters={[
            
          ]}
          onClear={() => { setSearch(""); setCarreraFilter(""); }}
        />

        <DataTable
          data={filteredPlayers}
          columns={columns}
          loading={false}
          emptyMessage="No hay jugadores registrados."
          hoverable
          striped
        />

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
      </div>
    </div>
  );
}
