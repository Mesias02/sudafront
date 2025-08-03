import { useEffect, useState } from "react";
import {
  getUsers,
  updateUser,
  disableUser
} from "../api/users";
import { registerUser } from "../api/auth";
import { getEmailFromToken } from "../utils/jwt";
import { User, RegisterDTO } from "../types/User";
import FilterBar from "../components/FilterBar";
import DataTable from "../components/DataTable";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import BackButton from "../components/BackButton";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Panel() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState<RegisterDTO>({
    name: "",
    email: "",
    password: "",
    role: "JUGADOR"
  });
  const [message, setMessage] = useState("");
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token")!;
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({ isOpen: false, userId: null, userName: "" });

  const loadUsers = () => {
    if (!token) {
      setError("No autorizado");
      return;
    }

    const email = getEmailFromToken(token);
    if (!email) {
      setError("Token inválido");
      return;
    }

    setLoading(true);
    getUsers(token)
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data);
        const me = data.find((u: User) => u.email === email);
        setCurrentRole(me?.role || null);
      })
      .catch(() => setError("Acceso denegado"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtrado en tiempo real
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter((u) => {
        const search = searchTerm.toLowerCase();
        return (
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
        );
      });
    }

    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  function passwordChecks(password: string) {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[\W_]/.test(password),
    };
  }

  function validatePassword(password: string): string | null {
    const c = passwordChecks(password);
    if (!c.length) return "La contraseña debe tener al menos 8 caracteres.";
    if (!c.upper) return "Debe incluir al menos una letra mayúscula.";
    if (!c.lower) return "Debe incluir al menos una letra minúscula.";
    if (!c.number) return "Debe incluir al menos un número.";
    if (!c.symbol) return "Debe incluir al menos un símbolo o carácter especial.";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setMessage("El nombre y el correo son obligatorios");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage("El correo no tiene un formato válido");
      return;
    }

    try {
      if (editId != null) {
        if (form.password.trim()) {
          const passwordError = validatePassword(form.password);
          if (passwordError) {
            setMessage(passwordError);
            return;
          }
        }
        await updateUser(editId, form, token);
        setMessage("Usuario actualizado correctamente");
      } else {
        if (!form.password.trim()) {
          setMessage("La contraseña es obligatoria al crear un usuario");
          return;
        }
        const passwordError = validatePassword(form.password);
        if (passwordError) {
          setMessage(passwordError);
          return;
        }
        await registerUser(form, token);
        setMessage("Usuario creado correctamente");
      }

      setForm({ name: "", email: "", password: "", role: "JUGADOR" });
      setEditId(null);
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      const backendMessage = err.response?.data || "Error al guardar usuario";
      setMessage(backendMessage);
    }
  };

  const handleDeleteClick = (user: User) => {
    setConfirmDialog({
      isOpen: true,
      userId: user.id,
      userName: user.name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.userId) return;
    try {
      await disableUser(confirmDialog.userId, token);
      setMessage("Usuario desactivado correctamente");
      loadUsers();
    } catch {
      setMessage("Error al desactivar usuario");
    } finally {
      setConfirmDialog({ isOpen: false, userId: null, userName: "" });
    }
  };

  const handleEdit = (u: User) => {
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setEditId(u.id);
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setForm({ name: "", email: "", password: "", role: "JUGADOR" });
    setEditId(null);
    setShowModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
  };

  function PasswordChecklist() {
    const c = passwordChecks(form.password);
    const checklist = [
      { key: "length", label: "Al menos 8 caracteres" },
      { key: "upper", label: "Una letra mayúscula (A-Z)" },
      { key: "lower", label: "Una letra minúscula (a-z)" },
      { key: "number", label: "Un número (0-9)" },
      { key: "symbol", label: "Un símbolo o caracter especial" },
    ];
    return (
      <ul style={{ marginBottom: 8, marginTop: -8 }}>
        {checklist.map(({ key, label }) => (
          <li key={key} style={{ color: c[key as keyof typeof c] ? "green" : "red", fontSize: 13 }}>
            {c[key as keyof typeof c] ? "✔️" : "❌"} {label}
          </li>
        ))}
      </ul>
    );
  }

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
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} size="sm" />
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'center' as const,
      render: (_: any, user: User) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            className="btn-primary btn-sm"
            onClick={(e) => { e.stopPropagation(); handleEdit(user); }}
          >
            Editar
          </button>
          <button
            className="btn-secondary btn-sm"
            onClick={(e) => { e.stopPropagation(); handleDeleteClick(user); }}
          >
            Eliminar
          </button>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <main className="container">
        <p style={{ color: "red" }}>{error}</p>
      </main>
    );
  }

  if (currentRole !== "ADMIN") {
    return (
      <main className="container">
        <p>No tienes permisos para ver esta sección.</p>
      </main>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <BackButton to="/" />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#FFFFFF',
          margin: 0 
        }}>
          Gestión de Usuarios
        </h1>
        {!showModal && (
          <button 
            className="btn-primary"
            onClick={handleCreateNew}
          >
            + Agregar Usuario
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
        onClose={() => setConfirmDialog({ isOpen: false, userId: null, userName: "" })}
        onConfirm={handleDeleteConfirm}
        title="Desactivar Usuario"
        message={`¿Estás seguro de que deseas desactivar al usuario "${confirmDialog.userName}"? Esta acción no se puede deshacer.`}
        confirmText="Desactivar"
        cancelText="Cancelar"
        type="danger"
      />

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditId(null); }}
        title={editId != null ? "Editar Usuario" : "Crear Usuario"}
        size="md"
      >
        <div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
  {/* --- INPUT NOMBRE --- */}
  <div style={{ position: "relative", maxWidth: 400, width: "100%", margin: "0 auto" }}>
    <input
      type="text"
      placeholder="Nombre"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      style={{
        width: "100%",
        paddingRight: 40,
        fontSize: 16,
        border: "none",
        borderBottom: "1px solid #cbd5e1",
        outline: "none",
        background: "transparent",
        boxSizing: "border-box",
        height: 44,
      }}
    />
    {/* Placeholder para alinear con el campo de contraseña */}
    <span style={{
      position: "absolute",
      right: 8,
      top: "50%",
      transform: "translateY(-50%)",
      width: 32,
      height: 32,
      display: "inline-block",
      opacity: 0
    }} />
  </div>

  {/* --- INPUT EMAIL --- */}
  <div style={{ position: "relative", maxWidth: 400, width: "100%", margin: "0 auto" }}>
    <input
      type="email"
      placeholder="Correo"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
      style={{
        width: "100%",
        paddingRight: 40,
        fontSize: 16,
        border: "none",
        borderBottom: "1px solid #cbd5e1",
        outline: "none",
        background: "transparent",
        boxSizing: "border-box",
        height: 44,
      }}
    />
    {/* Placeholder para alinear con el campo de contraseña */}
    <span style={{
      position: "absolute",
      right: 8,
      top: "50%",
      transform: "translateY(-50%)",
      width: 32,
      height: 32,
      display: "inline-block",
      opacity: 0
    }} />
  </div>

  {/* --- INPUT CONTRASEÑA CON OJO --- */}
  <div style={{ position: "relative", maxWidth: 400, width: "100%", margin: "0 auto" }}>
    <input
      type={showPassword ? "text" : "password"}
      placeholder={editId != null ? "Nueva contraseña (opcional)" : "Contraseña"}
      value={form.password}
      onChange={(e) => setForm({ ...form, password: e.target.value })}
      style={{
        width: "100%",
        paddingRight: 40,
        fontSize: 16,
        border: "none",
        borderBottom: "1px solid #cbd5e1",
        outline: "none",
        background: "transparent",
        boxSizing: "border-box",
        height: 44,
      }}
    />
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      style={{
        position: "absolute",
        right: 8,
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        borderRadius: "50%",
        padding: 0,
      }}
      tabIndex={-1}
      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
    >
      <span
        className="material-icons"
        style={{
          fontSize: "1.7rem",
          color: "#2563eb"
        }}
      >
        {showPassword ? "visibility_off" : "visibility"}
      </span>
    </button>
  </div>

  {form.password && <PasswordChecklist />}

  <select
    value={form.role}
    onChange={(e) => setForm({ ...form, role: e.target.value })}
    style={{
      maxWidth: 400,
      margin: "0 auto",
      height: 44,
      fontSize: 16,
      border: "none",
      borderBottom: "1px solid #cbd5e1",
      outline: "none",
      background: "transparent",
      boxSizing: "border-box",
    }}
  >
    <option value="ADMIN">ADMIN</option>
    <option value="JUGADOR">JUGADOR</option>
    <option value="MESA">MESA</option>
  </select>

  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
    <button className="btn-primary" type="submit">
      {editId != null ? "Actualizar Usuario" : "Crear Usuario"}
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

        </div>
      </Modal>

      {!showModal && (
        <>
          <FilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por nombre o email..."
            filters={[
              {
                label: 'Rol',
                value: roleFilter,
                options: [
                  { value: '', label: 'Todos los roles' },
                  { value: 'ADMIN', label: 'Administrador' },
                  { value: 'JUGADOR', label: 'Jugador' },
                  { value: 'MESA', label: 'Mesa' }
                ],
                onChange: setRoleFilter
              }
            ]}
            onClear={clearFilters}
          />

          <DataTable
            data={filteredUsers}
            columns={columns}
            loading={loading}
            emptyMessage="No se encontraron usuarios"
            hoverable
            striped
          />
        </>
      )}
    </div>
  );
}
