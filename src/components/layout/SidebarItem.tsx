import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isCollapsed: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon, 
  label, 
  path, 
  isCollapsed 
}) => {
  return (
    <NavLink 
      to={path}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      title={isCollapsed ? label : undefined}
    >
      <span className="nav-icon">{icon}</span>
      {!isCollapsed && <span className="nav-label">{label}</span>}
    </NavLink>
  );
};
