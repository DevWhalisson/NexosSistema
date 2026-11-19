import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import './Placeholder.css';

interface PlaceholderProps {
  title: string;
  description: string;
  backPath?: string;
}

export const Placeholder: React.FC<PlaceholderProps> = ({ 
  title, 
  description,
  backPath 
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="placeholder-page">
      <div className="placeholder-content">
        <div className="placeholder-icon">
          <Construction size={48} />
        </div>
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-description">{description}</p>
        <p className="placeholder-status">Este módulo está sendo preparado.</p>
        <button className="placeholder-back-btn" onClick={handleBack}>
          <ArrowLeft size={18} />
          Voltar
        </button>
      </div>
    </div>
  );
};
