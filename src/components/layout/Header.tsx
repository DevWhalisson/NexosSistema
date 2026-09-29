import React, { useState } from 'react';
import { 
  Bell, 
  Headset, 
  User, 
  ChevronDown, 
  Building2, 
  Check, 
  Menu,
  Box
} from 'lucide-react';
import './Header.css';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('EMPRESA EXEMPLO');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const companies = [
    'EMPRESA EXEMPLO',
    'EMPRESA ALPHA',
    'EMPRESA BETA',
  ];

  return (
    <header className="header">
      <div className="header-left">
        {onToggleSidebar && (
          <button className="mobile-menu-btn" onClick={onToggleSidebar}>
            <Menu size={20} />
          </button>
        )}
        
        <div className="header-logo">
          <div className="header-logo-icon">
            <Box size={20} />
          </div>
          <span className="header-logo-text">SISTEMA ERP</span>
        </div>
        
        <div className="header-divider" />
        
        <div className="company-selector">
          <button 
            className="company-button"
            onClick={() => setIsCompanyOpen(!isCompanyOpen)}
          >
            <Building2 size={16} />
            <span className="company-name">{selectedCompany}</span>
            <ChevronDown size={14} className={`dropdown-icon ${isCompanyOpen ? 'open' : ''}`} />
          </button>
          
          {isCompanyOpen && (
            <div className="company-dropdown">
              {companies.map((company) => (
                <button
                  key={company}
                  className={`company-option ${company === selectedCompany ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCompany(company);
                    setIsCompanyOpen(false);
                  }}
                >
                  <span>{company}</span>
                  {company === selectedCompany && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="header-right">
        <button className="header-btn">
          <Headset size={18} />
          <span>Suporte</span>
        </button>
        
        <div className="header-divider" />
        
        <button className="icon-button" title="Notificações">
          <Bell size={18} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="header-divider" />
        
        <div className="user-menu-container">
          <button 
            className="user-menu"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            <div className="user-avatar">
              <User size={16} />
            </div>
            <div className="user-info">
              <span className="user-name">Administrador</span>
              <span className="user-role">Admin</span>
            </div>
            <ChevronDown size={14} className={`dropdown-icon ${isUserMenuOpen ? 'open' : ''}`} />
          </button>
          
          {isUserMenuOpen && (
            <div className="user-dropdown">
              <button className="dropdown-item">Meu Perfil</button>
              <button className="dropdown-item">Configurações</button>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger">Sair</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
