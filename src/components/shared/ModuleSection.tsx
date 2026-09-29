import React from 'react';
import './ModuleSection.css';

interface ModuleSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const ModuleSection: React.FC<ModuleSectionProps> = ({ title, description, children }) => {
  return (
    <div className="module-section">
      <div className="module-section-header">
        <h2 className="module-section-title">{title}</h2>
        {description && <p className="module-section-description">{description}</p>}
      </div>
      <div className="module-section-grid">
        {children}
      </div>
    </div>
  );
};
