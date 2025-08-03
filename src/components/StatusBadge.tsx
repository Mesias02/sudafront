import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig = {
  // Estados de partidos
  'PENDING': { color: 'yellow', label: 'Pendiente', icon: '⏳' },
  'COMPLETED': { color: 'green', label: 'Completado', icon: '✅' },
  'CANCELLED': { color: 'red', label: 'Cancelado', icon: '❌' },
  
  // Estados de validación
  'VALIDATED': { color: 'green', label: 'Validado', icon: '✅' },
  'NOT_VALIDATED': { color: 'yellow', label: 'Sin validar', icon: '⏳' },
  
  // Estados generales
  'ACTIVE': { color: 'green', label: 'Activo', icon: '✅' },
  'INACTIVE': { color: 'gray', label: 'Inactivo', icon: '⭕' },
  'DISABLED': { color: 'red', label: 'Deshabilitado', icon: '🚫' },
  
  // Estados de usuarios
  'ADMIN': { color: 'purple', label: 'Administrador', icon: '👑' },
  'JUGADOR': { color: 'blue', label: 'Jugador', icon: '⚽' },
  'MESA': { color: 'orange', label: 'Mesa', icon: '📋' },
};

export default function StatusBadge({ 
  status, 
  variant = 'default', 
  size = 'md',
  className = '' 
}: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    color: 'gray',
    label: status,
    icon: '❓'
  };

  const sizeClasses = {
    sm: 'status-badge-sm',
    md: 'status-badge-md',
    lg: 'status-badge-lg'
  };

  return (
    <span className={`status-badge status-badge-${config.color} ${sizeClasses[size]} ${variant === 'outlined' ? 'outlined' : ''} ${className}`}>
      <span className="status-icon">{config.icon}</span>
      <span className="status-label">{config.label}</span>
      
      <style>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border-radius: 20px;
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .status-badge-sm {
          padding: 2px 8px;
          font-size: 11px;
        }

        .status-badge-md {
          padding: 4px 12px;
          font-size: 12px;
        }

        .status-badge-lg {
          padding: 6px 16px;
          font-size: 14px;
        }

        .status-icon {
          font-size: 0.9em;
        }

        /* Colores para variante default */
        .status-badge-yellow {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          border: 1px solid #f59e0b;
        }

        .status-badge-green {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #065f46;
          border: 1px solid #10b981;
        }

        .status-badge-red {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #991b1b;
          border: 1px solid #ef4444;
        }

        .status-badge-blue {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          color: #1e40af;
          border: 1px solid #3b82f6;
        }

        .status-badge-purple {
          background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
          color: #6b21a8;
          border: 1px solid #8b5cf6;
        }

        .status-badge-orange {
          background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
          color: #9a3412;
          border: 1px solid #f97316;
        }

        .status-badge-gray {
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          color: #374151;
          border: 1px solid #6b7280;
        }

        /* Variante outlined */
        .status-badge.outlined {
          background: transparent !important;
          border-width: 2px;
        }

        .status-badge-yellow.outlined {
          color: #f59e0b;
          border-color: #f59e0b;
        }

        .status-badge-green.outlined {
          color: #10b981;
          border-color: #10b981;
        }

        .status-badge-red.outlined {
          color: #ef4444;
          border-color: #ef4444;
        }

        .status-badge-blue.outlined {
          color: #3b82f6;
          border-color: #3b82f6;
        }

        .status-badge-purple.outlined {
          color: #8b5cf6;
          border-color: #8b5cf6;
        }

        .status-badge-orange.outlined {
          color: #f97316;
          border-color: #f97316;
        }

        .status-badge-gray.outlined {
          color: #6b7280;
          border-color: #6b7280;
        }

        .status-badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </span>
  );
}