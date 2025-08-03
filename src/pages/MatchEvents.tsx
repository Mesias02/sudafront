import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMatchEvents,
  createMatchEvent,
  updateMatchEvent,
  deleteMatchEvent,
  MatchEventResponseDTO,
} from "../api/matchEvents";
import { getPlayersByTeam } from "../api/players";
import { getMatchById, finishMatch, recalculateMatchScore } from "../api/matches";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import ConfirmDialog from "../components/ConfirmDialog";

interface Player {
  id: number;
  name: string;
  teamName: string;
}

interface TokenPayload {
  sub: string;
  role: string;
}

export default function MatchEvents() {
  const { id } = useParams();
  const matchId = parseInt(id!);
  const token = localStorage.getItem("token")!;
  const role = token ? jwtDecode<TokenPayload>(token).role : null;
  const navigate = useNavigate();

  const [events, setEvents] = useState<MatchEventResponseDTO[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [homeTeamName, setHomeTeamName] = useState("");
  const [awayTeamName, setAwayTeamName] = useState("");
  const [matchStatus, setMatchStatus] = useState<string>("PENDING");
  const [validated, setValidated] = useState<boolean>(false);

  const [form, setForm] = useState({
    playerId: 0,
    minute: 0,
    type: "GOL",
    detail: "",
  });

  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    playerId: 0,
    minute: 0,
    type: "GOL",
    detail: "",
  });

  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; eventId?: number }>({ isOpen: false });

  const loadData = async () => {
    const [match, eventData] = await Promise.all([
      getMatchById(matchId, token),
      getMatchEvents(matchId, token),
    ]);

    setEvents(eventData);
    setHomeTeamName(match.homeTeamName);
    setAwayTeamName(match.awayTeamName);
    setMatchStatus(match.status);
    setValidated(match.validated);

    const [home, away] = await Promise.all([
      getPlayersByTeam(match.homeTeamId, token),
      getPlayersByTeam(match.awayTeamId, token),
    ]);

    setPlayers([
      ...home.map((p: any) => ({ ...p, teamName: match.homeTeamName })),
      ...away.map((p: any) => ({ ...p, teamName: match.awayTeamName })),
    ]);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async () => {
    if (!form.playerId || form.minute <= 0) {
      toast.error("Selecciona jugador y minuto válido.");
      return;
    }
    await createMatchEvent(
      {
        matchId,
        playerId: form.playerId,
        minute: form.minute,
        type: form.type,
        detail: form.detail,
      },
      token
    );
    toast.success("Evento registrado correctamente");
    await recalculateMatchScore(matchId, token);
    setForm({ playerId: 0, minute: 0, type: "GOL", detail: "" });
    loadData();
  };

  const handleFinishMatch = async () => {
    await finishMatch(matchId, token);
    toast.success("Partido finalizado");
    setMatchStatus("COMPLETED");
    navigate("/resultados");
    loadData();
  };

  const handleEditEvent = (e: MatchEventResponseDTO) => {
    setEditingEventId(e.id);
    setEditForm({
      playerId: players.find((p) => p.name === e.playerName)?.id ?? 0,
      minute: e.minute,
      type: e.type,
      detail: e.detail || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.playerId || editForm.minute <= 0) {
      toast.error("Selecciona jugador y minuto válido.");
      return;
    }
    await updateMatchEvent(
      editingEventId!,
      {
        matchId,
        playerId: editForm.playerId,
        minute: editForm.minute,
        type: editForm.type,
        detail: editForm.detail,
      },
      token
    );
    setEditingEventId(null);
    toast.success("Evento editado correctamente");
    await recalculateMatchScore(matchId, token);
    loadData();
  };

  const handleDeleteEvent = (eventId: number) => {
    setConfirmDialog({ isOpen: true, eventId });
  };

  const confirmDeleteEvent = async () => {
    if (!confirmDialog.eventId) return;
    await deleteMatchEvent(confirmDialog.eventId, token);
    toast.success("Evento eliminado");
    await recalculateMatchScore(matchId, token);
    setConfirmDialog({ isOpen: false });
    loadData();
  };

  const canEditOrDelete = () =>
    role === "ADMIN" || (role === "MESA" && matchStatus === "PENDING");

  const allowForm =
    matchStatus === "PENDING" || (matchStatus === "COMPLETED" && !validated);

  const countEvents = (team: string, type: string, detail?: string) => {
    return events.filter(
      (e) =>
        e.teamName === team &&
        e.type === type &&
        (!detail || e.detail?.toUpperCase() === detail.toUpperCase())
    ).length;
  };

  const renderIcon = (e: MatchEventResponseDTO) => {
    if (e.type === "GOL") return "⚽";
    if (e.type === "TARJETA") return e.detail === "ROJA" ? "🟥" : "🟨";
    return "";
  };

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "20px auto",
        padding: 16,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#eee",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 24, fontWeight: "700", fontSize: 24 }}>
        Eventos del Partido #{matchId}
      </h2>

      {allowForm && (
        <section
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 40,
            justifyContent: "center",
          }}
        >
          {[homeTeamName, awayTeamName].filter(teamName => teamName && teamName.trim() !== "")
  .map((teamName, idx) => (
            <article
              key={teamName}
              style={{
                flex: "1 1 300px",
                backgroundColor: idx === 0 ? "#1e40af" : "#991b1b",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s ease",
                cursor: "default",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            >
              <h3
                style={{
                  textAlign: "center",
                  fontWeight: "700",
                  fontSize: 20,
                  marginBottom: 16,
                  color: "#fff",
                  textShadow: "0 0 8px rgba(0,0,0,0.5)",
                }}
              >
                Registrar Evento - {teamName}
              </h3>

              <select
                style={{
                  width: "100%",
                  padding: 10,
                  marginBottom: 14,
                  borderRadius: 8,
                  border: "1.5px solid #ddd",
                  fontSize: 16,
                  outline: "none",
                  cursor: "pointer",
                  transition: "border-color 0.2s ease",
                }}
                value={form.playerId}
                onChange={(e) => setForm({ ...form, playerId: parseInt(e.target.value) })}
                onFocus={e => (e.currentTarget.style.borderColor = "#60a5fa")}
                onBlur={e => (e.currentTarget.style.borderColor = "#ddd")}
              >
                <option value={0}>-- Selecciona jugador --</option>
                {players
                  .filter((p) => p.teamName === teamName)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>

              <input
                type="number"
                min={0}
                placeholder="Minuto"
                style={{
                  width: "100%",
                  padding: 10,
                  marginBottom: 14,
                  borderRadius: 8,
                  border: "1.5px solid #ddd",
                  fontSize: 16,
                  outline: "none",
                  transition: "border-color 0.2s ease",
                }}
                value={form.minute}
                onChange={(e) => setForm({ ...form, minute: parseInt(e.target.value) })}
                onFocus={e => (e.currentTarget.style.borderColor = "#60a5fa")}
                onBlur={e => (e.currentTarget.style.borderColor = "#ddd")}
              />

              <select
                style={{
                  width: "100%",
                  padding: 10,
                  marginBottom: 14,
                  borderRadius: 8,
                  border: "1.5px solid #ddd",
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "border-color 0.2s ease",
                }}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                onFocus={e => (e.currentTarget.style.borderColor = "#60a5fa")}
                onBlur={e => (e.currentTarget.style.borderColor = "#ddd")}
              >
                <option value="GOL">Gol</option>
                <option value="TARJETA">Tarjeta</option>
              </select>

              {form.type === "TARJETA" && (
                <select
                  style={{
                    width: "100%",
                    padding: 10,
                    marginBottom: 14,
                    borderRadius: 8,
                    border: "1.5px solid #ddd",
                    fontSize: 16,
                    cursor: "pointer",
                    transition: "border-color 0.2s ease",
                  }}
                  value={form.detail}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  onFocus={e => (e.currentTarget.style.borderColor = "#60a5fa")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#ddd")}
                >
                  <option value="">-- Tipo tarjeta --</option>
                  <option value="AMARILLA">Amarilla</option>
                  <option value="ROJA">Roja</option>
                </select>
              )}

              <button
                disabled={form.playerId === 0 || form.minute <= 0}
                onClick={handleSubmit}
                style={{
                  marginTop: "auto",
                  padding: "14px 0",
                  backgroundColor:
                    form.playerId === 0 || form.minute <= 0 ? "#93c5fd" : "#3b82f6",
                  color: "white",
                  fontWeight: "700",
                  fontSize: 18,
                  borderRadius: 10,
                  cursor:
                    form.playerId === 0 || form.minute <= 0
                      ? "not-allowed"
                      : "pointer",
                  transition: "background-color 0.3s ease",
                  border: "none",
                  boxShadow:
                    form.playerId === 0 || form.minute <= 0
                      ? "none"
                      : "0 6px 12px rgba(59, 130, 246, 0.6)",
                }}
                onMouseEnter={e => {
                  if (!(form.playerId === 0 || form.minute <= 0)) {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(37, 99, 235, 0.7)";
                  }
                }}
                onMouseLeave={e => {
                  if (!(form.playerId === 0 || form.minute <= 0)) {
                    e.currentTarget.style.backgroundColor = "#3b82f6";
                    e.currentTarget.style.boxShadow = "0 6px 12px rgba(59, 130, 246, 0.6)";
                  }
                }}
              >
                Guardar Evento
              </button>
            </article>
          ))}
        </section>
      )}

      {allowForm && (
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <button
            onClick={handleFinishMatch}
            style={{
              padding: "14px 28px",
              backgroundColor: "#10b981",
              border: "none",
              borderRadius: 12,
              color: "white",
              fontWeight: "700",
              fontSize: 20,
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              boxShadow: "0 6px 12px rgba(16, 185, 129, 0.6)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#10b981")}
          >
            🏁 Finalizar Partido
          </button>
        </div>
      )}

      <h3
        style={{
          color: "#eee",
          marginBottom: 20,
          fontWeight: "700",
          fontSize: 24,
          borderBottom: "2px solid #eee",
          paddingBottom: 6,
        }}
      >
        Eventos Registrados
      </h3>

      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 40,
          justifyContent: "center",
        }}
      >
        {[homeTeamName, awayTeamName].map((teamName, idx) => (
          <article
            key={teamName}
            style={{
              flex: "1 1 320px",
              backgroundColor: idx === 0 ? "#1e40af" : "#991b1b",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
              color: "white",
              display: "flex",
              flexDirection: "column",
              maxHeight: 430,
              overflowY: "auto",
            }}
          >
            <h4
              style={{
                marginBottom: 14,
                fontWeight: "700",
                fontSize: 20,
                textAlign: "center",
                borderBottom: "1px solid rgba(255,255,255,0.3)",
                paddingBottom: 10,
              }}
            >
              {teamName}
            </h4>

            <div
              style={{
                marginBottom: 24,
                fontSize: 16,
                display: "flex",
                justifyContent: "space-around",
                fontWeight: "600",
              }}
            >
              <span>⚽ {countEvents(teamName, "GOL")}</span>
              <span>🟨 {countEvents(teamName, "TARJETA", "AMARILLA")}</span>
              <span>🟥 {countEvents(teamName, "TARJETA", "ROJA")}</span>
            </div>

            <ul
              style={{
                listStyleType: "none",
                paddingLeft: 0,
                margin: 0,
                overflowY: "auto",
                flexGrow: 1,
                fontSize: 17,
              }}
            >
              {events
                .filter((e) => e.teamName === teamName)
                .map((e) =>
                  editingEventId === e.id ? (
                    <li
                      key={e.id}
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 10,
                        marginBottom: 16,
                      }}
                    >
                      <select
                        style={{
                          flex: "1 1 140px",
                          padding: 10,
                          borderRadius: 8,
                          border: "none",
                          fontSize: 16,
                          cursor: "pointer",
                        }}
                        value={editForm.playerId}
                        onChange={(ev) =>
                          setEditForm({
                            ...editForm,
                            playerId: parseInt(ev.target.value),
                          })
                        }
                      >
                        <option value={0}>-- Jugador --</option>
                        {players
                          .filter((p) => p.teamName === teamName)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>

                      <input
                        type="number"
                        min={0}
                        style={{
                          width: 70,
                          padding: 10,
                          borderRadius: 8,
                          border: "none",
                          fontSize: 16,
                        }}
                        value={editForm.minute}
                        onChange={(ev) =>
                          setEditForm({
                            ...editForm,
                            minute: parseInt(ev.target.value),
                          })
                        }
                      />

                      <select
                        style={{
                          flex: "1 1 120px",
                          padding: 10,
                          borderRadius: 8,
                          border: "none",
                          fontSize: 16,
                          cursor: "pointer",
                        }}
                        value={editForm.type}
                        onChange={(ev) =>
                          setEditForm({ ...editForm, type: ev.target.value })
                        }
                      >
                        <option value="GOL">Gol</option>
                        <option value="TARJETA">Tarjeta</option>
                      </select>

                      {editForm.type === "TARJETA" && (
                        <select
                          style={{
                            flex: "1 1 120px",
                            padding: 10,
                            borderRadius: 8,
                            border: "none",
                            fontSize: 16,
                            cursor: "pointer",
                          }}
                          value={editForm.detail}
                          onChange={(ev) =>
                            setEditForm({ ...editForm, detail: ev.target.value })
                          }
                        >
                          <option value="">-- Tipo tarjeta --</option>
                          <option value="AMARILLA">Amarilla</option>
                          <option value="ROJA">Roja</option>
                        </select>
                      )}

                      <button
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#22c55e",
                          border: "none",
                          borderRadius: 8,
                          color: "white",
                          cursor: "pointer",
                          fontWeight: "700",
                          transition: "background-color 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#16a34a")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#22c55e")
                        }
                        onClick={handleSaveEdit}
                      >
                        Guardar
                      </button>
                      <button
                        style={{
                          padding: "10px 20px",
                          backgroundColor: "#ef4444",
                          border: "none",
                          borderRadius: 8,
                          color: "white",
                          cursor: "pointer",
                          fontWeight: "700",
                          transition: "background-color 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#dc2626")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#ef4444")
                        }
                        onClick={() => setEditingEventId(null)}
                      >
                        Cancelar
                      </button>
                    </li>
                  ) : (
                    <li
                      key={e.id}
                      style={{
                        marginBottom: 10,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>
                        {renderIcon(e)} {e.minute}' - {e.type}{" "}
                        {e.detail && `(${e.detail})`} - {e.playerName}
                      </span>
                      {canEditOrDelete() && (
                        <div style={{ display: "flex", gap: 10 }}>
                          <button
                            onClick={() => handleEditEvent(e)}
                            style={{
                              backgroundColor: "#3b82f6",
                              border: "none",
                              borderRadius: 8,
                              color: "white",
                              padding: "8px 16px",
                              cursor: "pointer",
                              fontWeight: "700",
                              transition: "background-color 0.3s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#2563eb")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "#3b82f6")
                            }
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(e.id)}
                            style={{
                              backgroundColor: "#ef4444",
                              border: "none",
                              borderRadius: 8,
                              color: "white",
                              padding: "8px 16px",
                              cursor: "pointer",
                              fontWeight: "700",
                              transition: "background-color 0.3s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor = "#dc2626")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "#ef4444")
                            }
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </li>
                  )
                )}
            </ul>
          </article>
        ))}
      </section>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmDeleteEvent}
        title="¿Eliminar evento?"
        message="¿Seguro que deseas eliminar este evento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        icon="🗑️"
      />
    </main>
  );
}
