import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './ModuleCard.css';

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  path: string;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ icon, title, path }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <button className="module-card" onClick={handleClick}>
      <div className="module-card-icon">
        {icon}
      </div>
      <div className="module-card-content">
        <h3 className="module-card-title">{title}</h3>
        <span className="module-card-action">
          Abrir módulo
          <ChevronRight size={14} />
        </span>
      </div>
    </button>
  );
};
