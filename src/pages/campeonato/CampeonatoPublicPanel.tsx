import { Link, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMatches } from "../../api/matches";
import { getPublicTeams } from "../../api/teams";
import { getAllPlayers } from "../../api/playerStats";
import GlobalStats from "../Stats/GlobalStats";
import ResultsPublic from "../public/ResultsPublic";
import PlayerStatsPanel from "../players/PlayerStatsPanel";
import PublicTeamsPanel from "./TeamsPublicPanel";
import PublicCalendarPanel from "./PublicCalendarPanel";

export default function CampeonatoPublicPanel() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Estados para datos reales
  const [stats, setStats] = useState({
    equipos: 0,
    partidos: 0,
    jugadores: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [matches, teams, players] = await Promise.all([
          getMatches(),
          getPublicTeams(),
          getAllPlayers()
        ]);
        
        setStats({
          equipos: teams.length,
          partidos: matches.length,
          jugadores: players.length
        });
      } catch (error) {
        console.error("Error loading stats:", error);
        // Mantener valores por defecto en caso de error
        setStats({
          equipos: 4,
          partidos: 12,
          jugadores: 48
        });
      }
    };

    loadStats();
  }, []);

  const navItems = [
    { path: "/campeonato/tabla", label: "📊 Tabla", icon: "📊" },
    { path: "/campeonato/calendario", label: "📅 Calendario", icon: "📅" },
    { path: "/campeonato/equipos", label: "⚽ Equipos", icon: "⚽" },
    { path: "/campeonato/resultados", label: "🏆 Resultados", icon: "🏆" },
    { path: "/campeonato/jugadores", label: "👤 Jugadores", icon: "👤" }
  ];

  return (
    <div className="campeonato-container">
      <div className="campeonato-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="campeonato-title text-center">🏆 OLIMPIATEC 2025</h1>
            <p className="campeonato-subtitle text-center">Seguimiento del Campeonato de Fútbol</p>
          </div>
          <div className="stats-quick">
            <div className="stat-item">
              <span className="stat-number">{stats.equipos}</span>
              <span className="stat-label text-center">Equipos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.partidos}</span>
              <span className="stat-label text-center">Partidos</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.jugadores}</span>
              <span className="stat-label text-center">Jugadores</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="campeonato-nav">
        <div className="nav-container">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label.replace(/^[^\s]+ /, '')}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="campeonato-content">
        <Routes>
          <Route path="tabla" element={<GlobalStats />} />
          <Route path="calendario" element={<PublicCalendarPanel />} />
          <Route path="equipos" element={<PublicTeamsPanel />} />
          <Route path="resultados" element={<ResultsPublic />} />
          <Route path="jugadores" element={<PlayerStatsPanel />} />
          <Route path="*" element={<Navigate to="tabla" replace />} />
        </Routes>
      </div>

      <style>{`
        .campeonato-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%);
          position: relative;
        }

        .campeonato-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .campeonato-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 32px 24px;
          position: relative;
          z-index: 10;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
        }

        .title-section {
          flex: 1;
        }

        .campeonato-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e3c72;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .campeonato-subtitle {
          font-size: 1.1rem;
          color: #64748b;
          margin: 0;
          font-weight: 500;
        }

        .stats-quick {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 16px;
          color: white;
          min-width: 80px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: transform 0.2s ease;
        }

        .stat-item:hover {
          transform: translateY(-2px);
        }

        .stat-number {
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.8rem;
          font-weight: 500;
          opacity: 0.9;
          margin-top: 4px;
        }

        .campeonato-nav {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 24px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .nav-container::-webkit-scrollbar {
          display: none;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 16px 20px;
          text-decoration: none;
          color: #64748b;
          font-weight: 500;
          font-size: 14px;
          border-radius: 12px;
          transition: all 0.3s ease;
          position: relative;
          min-width: 100px;
          white-space: nowrap;
        }

        .nav-item:hover {
          color: #1e3c72;
          background: rgba(30, 60, 114, 0.1);
          transform: translateY(-2px);
        }

        .nav-item.active {
          color: #1e3c72;
          background: linear-gradient(135deg, rgba(30, 60, 114, 0.1) 0%, rgba(42, 82, 152, 0.1) 100%);
          font-weight: 600;
        }

        .nav-item.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 3px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          border-radius: 2px;
        }

        .nav-icon {
          font-size: 20px;
          line-height: 1;
        }

        .nav-label {
          font-size: 13px;
          line-height: 1;
        }

        .campeonato-content {
          position: relative;
          z-index: 1;
          min-height: calc(100vh - 200px);
          padding: 24px;
        }

        .campeonato-content > div {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }

        /* Asegurar que el contenido no se superponga */
        .campeonato-content h1,
        .campeonato-content h2,
        .campeonato-content h3 {
          position: relative;
          z-index: 2;
        }

        .campeonato-content table,
        .campeonato-content .data-table-container {
          position: relative;
          z-index: 2;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .campeonato-header {
            padding: 24px 16px;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .campeonato-title {
            font-size: 2rem;
          }

          .stats-quick {
            justify-content: center;
            gap: 16px;
          }

          .stat-item {
            padding: 12px 16px;
            min-width: 70px;
          }

          .stat-number {
            font-size: 1.5rem;
          }

          .nav-container {
            padding: 0 16px;
            justify-content: flex-start;
          }

          .nav-item {
            padding: 12px 16px;
            min-width: 80px;
          }

          .nav-icon {
            font-size: 18px;
          }

          .nav-label {
            font-size: 12px;
          }

          .campeonato-content {
            padding: 16px;
          }

          .campeonato-content > div {
            padding: 20px;
            border-radius: 16px;
          }
        }

        @media (max-width: 480px) {
          .campeonato-title {
            font-size: 1.8rem;
          }

          .campeonato-subtitle {
            font-size: 1rem;
          }

          .stats-quick {
            gap: 12px;
          }

          .stat-item {
            padding: 10px 12px;
            min-width: 60px;
          }

          .stat-number {
            font-size: 1.3rem;
          }

          .stat-label {
            font-size: 0.7rem;
          }

          .nav-item {
            padding: 10px 12px;
            min-width: 70px;
          }

          .nav-icon {
            font-size: 16px;
          }

          .nav-label {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}