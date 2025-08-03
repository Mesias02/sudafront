import { useState } from "react";
import { login } from "../api/auth";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

interface TokenPayload {
  sub: string;
  role: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await login(email, password);
      localStorage.setItem("token", token);

      const payload: TokenPayload = jwtDecode(token);

      if (payload.role === "ADMIN") {
        window.location.href = "/panel";
      } else if (payload.role === "JUGADOR") {
        window.location.href = "/my-team";
      } else if (payload.role === "MESA") {
        window.location.href = "/matches";
      } else {
        window.location.href = "/unauthorized";
      }
    } catch {
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="soccer-icon">⚽</div>
          <h1>OLIMPIATEC</h1>
          <p>Sistema de Gestión de Campeonato</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
              <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="password-toggle"
  tabIndex={-1}
  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
>
  <span className="material-icons">
    {showPassword ? "visibility_off" : "visibility"}
  </span>
</button>

            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </button>

          <button
            type="button"
            className="btn-link forgot-password"
            onClick={handleForgotPassword}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>

        <div className="login-footer">
          <p>© 2025 OLIMPIATEC - Todos los derechos reservados</p>
        </div>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.2);
          position: relative;
          z-index: 1;
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .soccer-icon {
          font-size: 64px;
          margin-bottom: 16px;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }

        .login-header h1 {
          font-size: 32px;
          font-weight: 800;
          color: #1e3c72;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .login-header p {
          color: #64748b;
          font-size: 16px;
          margin: 0;
          font-weight: 500;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .form-input {
          width: 100%;
          padding: 16px 20px 16px 50px;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          font-size: 16px;
          background: #f9fafb;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
          transform: translateY(-1px);
        }

        .input-icon {
          position: absolute;
          left: 16px;
          font-size: 18px;
          color: #6b7280;
          z-index: 1;
          top: 50%;
          transform: translateY(-50%);
        }

        .password-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 2;
  width: 32px;         /* O el tamaño que veas bien */
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.password-toggle .material-icons {
  font-size: 2rem;     /* Igual a reset password */
  line-height: 1;
  /* Si no queda perfecto, puedes afinar con: */
  position: relative;
  top: -6px;           /* Juega con este valor para el ajuste pixel-perfect */
}

.password-toggle:hover {
  background: rgba(8, 85, 238, 0.09);
}


        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          color: #dc2626;
          font-size: 14px;
          font-weight: 500;
        }

        .error-icon {
          font-size: 16px;
        }

        .login-btn {
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 16px;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .forgot-password {
          margin-top: 16px;
          text-align: center;
          font-size: 14px;
        }

        .login-footer {
          margin-top: 32px;
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .login-footer p {
          color: #6b7280;
          font-size: 12px;
          margin: 0;
        }

        @media (max-width: 640px) {
          .login-card {
            padding: 32px 24px;
            margin: 16px;
          }

          .login-header h1 {
            font-size: 28px;
          }

          .soccer-icon {
            font-size: 48px;
          }
        }
      `}</style>
    </div>
  );
}
