import { useState } from "react";
import { forgotPassword } from "../api/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      const res = await forgotPassword(email);
      setMessage(res);
    } catch (e: any) {
      setError(e.response?.data || "Error al solicitar recuperación.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 350, margin: "auto" }}>
      <h2>Recuperar contraseña</h2>
      <input
        type="email"
        placeholder="Correo registrado"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit">Enviar instrucciones</button>
      {message && (
        <div style={{ color: "white", marginTop: 10 }}>
          {message}
          <br />
          {/* Ya no hace falta poner link para el token manual */}
          Revisa tu correo y haz clic en el enlace de recuperación.
        </div>
      )}
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
    </form>
  );
}
