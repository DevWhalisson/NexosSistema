import React from 'react';
import { 
  Home, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  FileText,
  BarChart3,
  Menu
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import './Sidebar.css';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { icon: <Home size={20} />, label: 'Início', path: '/' },
  { icon: <Users size={20} />, label: 'Pessoas', path: '/pessoas' },
  { icon: <ShoppingCart size={20} />, label: 'Comercial', path: '/comercial' },
  { icon: <Package size={20} />, label: 'Estoque', path: '/estoque' },
  { icon: <DollarSign size={20} />, label: 'Financeiro', path: '/financeiro' },
  { icon: <FileText size={20} />, label: 'Fiscal', path: '/fiscal' },
  { icon: <BarChart3 size={20} />, label: 'Relatórios', path: '/relatorios' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="collapse-button" onClick={onToggle}>
          <Menu size={20} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </aside>
  );
};
