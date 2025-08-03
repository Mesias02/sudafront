import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  className?: string;
}

export default function BackButton({ to, onClick, className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button 
      className={`back-button ${className}`}
      onClick={handleClick}
      type="button"
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        className="back-arrow"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>

      <style>{`
        .back-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #64748b;
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .back-button:hover {
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          border-color: #cbd5e1;
          color: #475569;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .back-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .back-arrow {
          width: 20px;
          height: 20px;
          stroke-width: 2.5;
        }

        @media (max-width: 768px) {
          .back-button {
            width: 40px;
            height: 40px;
          }

          .back-arrow {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>
    </button>
  );
}