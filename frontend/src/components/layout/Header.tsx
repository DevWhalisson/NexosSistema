import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Bell, 
  Headset, 
  User, 
  ChevronDown, 
  Box,
  Home, 
  Users, 
  Package, 
  DollarSign, 
  FileText,
  BarChart3
} from 'lucide-react';
import './Header.css';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: <Home size={18} />, label: 'Início', path: '/' },
  { icon: <Users size={18} />, label: 'Pessoas', path: '/cadastros' },
  { icon: <Package size={18} />, label: 'Estoque', path: '/estoque' },
  { icon: <FileText size={18} />, label: 'Fiscal', path: '/fiscal' },
  { icon: <DollarSign size={18} />, label: 'Financeiro', path: '/financeiro' },
  { icon: <BarChart3 size={18} />, label: 'Relatórios', path: '/relatorios' },
];

export const Header: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <div className="header-logo-icon">
            <Box size={20} />
          </div>
          <span className="header-logo-text">NEXOS</span>
        </div>
      </div>
      
      <nav className="header-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `header-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="header-nav-icon">{item.icon}</span>
            <span className="header-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="header-right">
        <NavLink
          to="/suporte"
          className={({ isActive }) => `icon-button ${isActive ? 'active' : ''}`}
          title="Suporte"
          aria-label="Suporte"
        >
          <Headset size={18} />
        </NavLink>

        <NavLink
          to="/notificacoes"
          className={({ isActive }) => `icon-button ${isActive ? 'active' : ''}`}
          title="Notificações"
          aria-label="Notificações"
        >
          <Bell size={18} />
          <span className="notification-badge">3</span>
        </NavLink>

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
              <NavLink
                to="/configuracoes"
                className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsUserMenuOpen(false)}
              >
                Configurações
              </NavLink>
              <div className="dropdown-divider" />
              <button className="dropdown-item danger">Sair</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
