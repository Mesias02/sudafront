import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = 'warning',
  icon
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: icon || '🗑️',
      confirmBg: '#ef4444',
      confirmHover: '#dc2626',
      iconBg: '#1a1818',
      iconColor: '#ef4444'
    },
    warning: {
      icon: icon || '⚠️',
      confirmBg: '#f59e0b',
      confirmHover: '#d97706',
      iconBg: '#23221c',
      iconColor: '#fbbf24'
    },
    info: {
      icon: icon || 'ℹ️',
      confirmBg: '#2563eb',
      confirmHover: '#1d4ed8',
      iconBg: '#192033',
      iconColor: '#60a5fa'
    }
  };

  const config = typeConfig[type];

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="confirm-overlay" onClick={onClose} tabIndex={-1}>
      <div
        className="confirm-dialog"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="confirm-icon-container" style={{
          background: config.iconBg,
          color: config.iconColor
        }}>
          <span className="confirm-icon">{config.icon}</span>
        </div>

        <div className="confirm-content">
          <h3 className="confirm-title" id="confirm-title">{title}</h3>
          <p className="confirm-message">{message}</p>
        </div>

        <div className="confirm-actions">
          <button
            className="confirm-cancel"
            onClick={onClose}
            tabIndex={0}
          >
            {cancelText}
          </button>
          <button
            className="confirm-confirm"
            onClick={handleConfirm}
            style={{
              background: config.confirmBg,
              borderColor: config.confirmBg
            }}
            onMouseOver={e => (e.currentTarget.style.background = config.confirmHover)}
            onMouseOut={e => (e.currentTarget.style.background = config.confirmBg)}
            tabIndex={0}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        .confirm-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(152, 153, 178, 0.78);
          backdrop-filter: blur(8px) saturate(160%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.22s cubic-bezier(.23,1.24,.32,1) both;
          padding: 18px;
        }

        .confirm-dialog {
          background:rgb(39, 39, 143);
          border-radius: 2rem;
          padding: 38px 28px 28px 28px;
          max-width: 380px;
          width: 100%;
          box-shadow: 0 12px 36px 0 rgba(0, 0, 0, 0.32), 0 0 0 1.5px #2223;
          animation: slideUp 0.22s cubic-bezier(.23,1.24,.32,1) both;
          text-align: center;
          color: #f3f4f6;
        }

        .confirm-icon-container {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px auto;
          box-shadow: 0 2px 16px #0002;
        }

        .confirm-icon {
          font-size: 38px;
        }

        .confirm-content {
          margin-bottom: 34px;
        }

        .confirm-title {
          font-size: 1.45rem;
          font-weight: 700;
          color: #f3f4f6;
          margin: 0 0 10px 0;
          letter-spacing: -0.01em;
          line-height: 1.12;
        }

        .confirm-message {
          font-size: 1.08rem;
          color: #cbd5e1;
          margin: 0;
          line-height: 1.6;
          font-weight: 500;
        }

        .confirm-actions {
          display: flex;
          gap: 18px;
          justify-content: center;
          align-items: center;
        }

        .confirm-cancel, .confirm-confirm {
          padding: 12px 0;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.17s;
          border: 2.2px solid;
          min-width: 115px;
          letter-spacing: .01em;
        }

        .confirm-cancel {
          background: transparent;
          color: #cbd5e1;
          border-color:rgb(39, 54, 215);
        }
        .confirm-cancel:hover, .confirm-cancel:focus {
          background:rgb(21, 21, 208);
          border-color:rgb(21, 21, 208);
          color: #fff;
        }
        .confirm-confirm {
          color: #fff;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px) scale(.96);}
          to { opacity: 1; transform: none;}
        }
        @media (max-width: 530px) {
          .confirm-dialog {
            padding: 20px 6px 16px 6px;
            margin: 0;
          }
          .confirm-actions {
            flex-direction: column;
            gap: 9px;
          }
          .confirm-cancel, .confirm-confirm {
            width: 100%;
            min-width: unset;
          }
        }
      `}</style>
    </div>
  );
}
