import { useEffect, useState } from "react";
import { getTeams, createTeam, updateTeam, disableTeam, getTeamOfRepresentative } from "../api/teams";
import { getPlayers } from "../api/users";
import { Team, TeamDTO } from "../types/team";
import { User } from "../types/User";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import FilterBar from "../components/FilterBar";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";

interface TokenPayload {
  sub: string;
  role: string;
}

export default function TeamPanel() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<User[]>([]);
  const [form, setForm] = useState<TeamDTO>({ name: "", contactNumber: "", representativeId: 0 });
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, teamId: number | null, teamName: string }>({
    isOpen: false, teamId: null, teamName: ""
  });

  const token = localStorage.getItem("token")!;
  const payload: TokenPayload = jwtDecode(token);
  const role = payload.role;
  const isAdmin = role === "ADMIN";

  const loadTeams = async () => {
    try {
      setLoading(true);
      if (!isAdmin) {
        const team = await getTeamOfRepresentative(token);
        setTeams([team]);
        setFilteredTeams([team]);
      } else {
        const data = await getTeams(token);
        setTeams(data);
        setFilteredTeams(data);
      }
    } catch {
      setMessage("Error al cargar equipos");
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async () => {
    try {
      const data = await getPlayers(token);
      setPlayers(data);
    } catch {
      setMessage("Error al cargar jugadores");
    }
  };

  useEffect(() => {
    loadTeams();
    loadPlayers();
    // eslint-disable-next-line
  }, []);

  // Filtrado en tiempo real
  useEffect(() => {
    let filtered = teams;

    if (searchTerm) {
      filtered = filtered.filter((t) => {
        const search = searchTerm.toLowerCase();
        return (
          t.name.toLowerCase().includes(search) ||
          t.representative?.name?.toLowerCase().includes(search) ||
          t.contactNumber.includes(search)
        );
      });
    }

    setFilteredTeams(filtered);
  }, [teams, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setMessage("El nombre del equipo es obligatorio");
    if (!form.contactNumber.trim()) return setMessage("El número de contacto es obligatorio");
    if (!form.representativeId || form.representativeId === 0) return setMessage("Debe seleccionar un representante");

    const existe = teams.find(t => t.name.toLowerCase().trim() === form.name.toLowerCase().trim() && t.id !== editId);
    if (existe) return setMessage("Ya existe un equipo con ese nombre");

    const repYaUsado = teams.find(t => t.representative.id === form.representativeId && t.id !== editId);
    if (repYaUsado) return setMessage("Este representante ya está asignado a otro equipo");

    try {
      if (editId !== null) {
        await updateTeam(editId, form, token);
        setMessage("Equipo actualizado correctamente");
      } else {
        await createTeam(form, token);
        setMessage("Equipo creado correctamente");
      }
      setForm({ name: "", contactNumber: "", representativeId: 0 });
      setSearch("");
      setEditId(null);
      setShowModal(false);
      loadTeams();
    } catch (error: any) {
      setMessage(error.response?.data || "Error al guardar equipo");
    }
  };

  const handleDeleteClick = (team: Team) => {
    setConfirmDialog({ isOpen: true, teamId: team.id, teamName: team.name });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.teamId) return;
    try {
      await disableTeam(confirmDialog.teamId, token);
      setMessage("Equipo desactivado");
      loadTeams();
    } catch {
      setMessage("Error al desactivar equipo");
    } finally {
      setConfirmDialog({ isOpen: false, teamId: null, teamName: "" });
    }
  };

  const handleEdit = (team: Team) => {
    setForm({ name: team.name, contactNumber: team.contactNumber, representativeId: team.representative.id });
    setSearch(team.representative.name);
    setEditId(team.id);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setForm({ name: "", contactNumber: "", representativeId: 0 });
    setSearch("");
    setEditId(null);
    setShowModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
  };

  const selectedAlready = players.find(p => p.id === form.representativeId);

  // Solo mostrar usuarios con rol JUGADOR en la búsqueda
  const playerCandidates = players.filter(
    (p) => p.role === "JUGADOR" && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      width: '80px',
      align: 'center' as const
    },
    {
      key: 'name',
      label: 'Nombre',
      sortable: true
    },
    {
      key: 'representative',
      label: 'Representante',
      sortable: true,
      render: (_: any, team: Team) => team.representative?.name || 'Sin asignar'
    },
    {
      key: 'contactNumber',
      label: 'Contacto',
      sortable: true
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      render: (_: any, team: Team) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAdmin && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); handleEdit(team); }}
                className="btn-primary btn-sm"
              >
                ✏️ Editar
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteClick(team); }}
                className="btn-secondary btn-sm"
              >
                🗑️ Eliminar
              </button>
            </>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/teams/${team.id}/players`); }}
            className="btn-tertiary btn-sm"
          >
            👥 Ver jugadores
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="team-panel-responsive">
      <style>{`
        .team-panel-responsive {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }
        .team-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .team-panel-header h1 {
          font-size: 2rem;
          font-weight: bold;
          color: #fff;
          margin: 0;
        }
        .team-panel-modal-form {
          display: grid;
          gap: 16px;
        }
        @media (max-width: 700px) {
          .team-panel-header h1 {
            font-size: 1.4rem;
          }
          .team-panel-responsive {
            padding: 12px;
          }
        }
        /* TABLA responsive */
        .team-panel-table-container {
          width: 100%;
          overflow-x: auto;
          background: rgba(255,255,255,0.97);
          border-radius: 14px;
          box-shadow: 0 2px 12px #0001;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }
        th, td {
          padding: 10px 12px;
          text-align: center;
        }
        th {
          background: #e5e7eb;
          font-weight: bold;
          color: #22223b;
        }
        tr:nth-child(even) td {
          background: #f8fafc;
        }
        @media (max-width: 700px) {
          .team-panel-table-container {
            border-radius: 7px;
          }
          table {
            min-width: 480px;
            font-size: 13px;
          }
        }
        @media (max-width: 500px) {
          .team-panel-table-container {
            box-shadow: none;
            background: transparent;
          }
          table {
            min-width: 320px;
            font-size: 11.5px;
          }
          th, td {
            padding: 8px 4px;
          }
        }
      `}</style>

      <div className="team-panel-header">
        <h1>⚽ Gestión de Equipos</h1>
        {!showModal && isAdmin && (
          <button 
            className="btn-primary"
            onClick={handleCreateNew}
          >
            + Agregar Equipo
          </button>
        )}
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '24px',
          background: message.includes('Error') ? '#fee2e2' : '#d1fae5',
          color: message.includes('Error') ? '#991b1b' : '#065f46',
          borderRadius: '12px',
          border: `1px solid ${message.includes('Error') ? '#fca5a5' : '#a7f3d0'}`
        }}>
          {message}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, teamId: null, teamName: "" })}
        onConfirm={handleDeleteConfirm}
        title="Desactivar Equipo"
        message={`¿Estás seguro de que deseas desactivar el equipo "${confirmDialog.teamName}"? Esta acción no se puede deshacer.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        type="danger"
      />

      <Modal
  isOpen={showModal}
  onClose={() => { setShowModal(false); setEditId(null); }}
  title={editId ? "Editar Equipo" : "Crear Equipo"}
  size="md"
>
  <form onSubmit={handleSubmit} className="team-panel-modal-form">
    {/* Instrucción antes del formulario */}
    <p style={{
      color: "#2563eb",
      fontWeight: "600",
      fontSize: "0.95rem",
      marginBottom: "16px",
      backgroundColor: "#e0f2fe",
      padding: "10px",
      borderRadius: "8px",
      border: "1px solid #bae6fd",
      textAlign: "center",
    }}>
      Antes de registrar un equipo, debe existir el jugador al que se le asignará.
    </p>

    {/* Resto del formulario igual */}
    <div>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
        Nombre del equipo
      </label>
      <input 
        type="text" 
        placeholder="Nombre del equipo" 
        value={form.name} 
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        style={{ width: '100%' }}
      />
    </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Número de contacto
            </label>
            <input 
              type="text" 
              placeholder="Número de contacto" 
              value={form.contactNumber} 
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Representante
            </label>
            <div style={{ position: "relative" }}>
              <input 
                type="text" 
                placeholder="Buscar representante" 
                value={selectedAlready ? selectedAlready.name : search} 
                onChange={(e) => { setSearch(e.target.value); setForm({ ...form, representativeId: 0 }); }}
                style={{ width: "100%" }}
              />
              {search && form.representativeId === 0 && (
                <div style={{ 
                  position: "absolute", 
                  background: "#fff", 
                  border: "1px solid #ccc", 
                  width: "100%", 
                  maxHeight: "120px", 
                  overflowY: "auto", 
                  zIndex: 1,
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  marginTop: '4px'
                }}>
                  {playerCandidates.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => { setForm({ ...form, representativeId: p.id }); setSearch(""); }} 
                      style={{ 
                        padding: "12px", 
                        cursor: "pointer", 
                        borderBottom: "1px solid #eee",
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {p.name}
                    </div>
                  ))}
                  {playerCandidates.length === 0 && (
                    <div style={{ padding: "12px", color: "#999" }}>No hay resultados</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button 
              className="btn-primary"
              type="submit"
            >
              {editId ? "Actualizar" : "Crear"}
            </button>
            <button 
              className="btn-neutral"
              type="button" 
              onClick={() => { setShowModal(false); setEditId(null); }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {!showModal && (
        <>
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nombre, representante o contacto..."
            onClear={clearFilters}
          />

          <div className="team-panel-table-container">
            {/* Si DataTable no es responsive, reemplaza el render por una tabla estándar aquí */}
            <DataTable
              data={filteredTeams}
              columns={columns}
              loading={loading}
              emptyMessage="No se encontraron equipos"
              hoverable
              striped
            />
          </div>
        </>
      )}
    </div>
  );
}
