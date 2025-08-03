import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl'
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content ${sizeClasses[size]}`}>
        <button 
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          ×
        </button>
        
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
          </div>
        )}
        
        <div className="modal-body">
          {children}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          position: relative;
          animation: slideUp 0.3s ease;
          max-height: 90vh;
          overflow-y: auto;
          margin: 20px;
        }

        .modal-sm {
          width: 100%;
          max-width: 400px;
          padding: 20px;
        }

        .modal-md {
          width: 100%;
          max-width: 600px;
          padding: 24px;
        }

        .modal-lg {
          width: 100%;
          max-width: 800px;
          padding: 32px;
        }

        .modal-xl {
          width: 100%;
          max-width: 1200px;
          padding: 40px;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          z-index: 1;
        }

        .modal-close:hover {
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
        }

        .modal-header {
          margin-bottom: 24px;
          padding-right: 40px;
        }

        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .modal-body {
          color: #374151;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 16px;
          }

          .modal-sm, .modal-md, .modal-lg, .modal-xl {
            padding: 20px;
          }

          .modal-header h2 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}