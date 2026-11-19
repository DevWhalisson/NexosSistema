import React from 'react';
import { 
  UserCheck, 
  Truck, 
  Users,
  ClipboardList
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../../components/common';
import '../../styles/ModulesPage.css';

export const Pessoas: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <ClipboardList size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Pessoas</h1>
          <p className="page-subtitle">Gerencie cadastros e contatos</p>
        </div>
      </div>

      <ModuleSection title="Pessoas e Contatos">
        <ModuleCard 
          icon={<UserCheck size={22} />} 
          title="Clientes" 
          path="/cadastros/clientes" 
        />
        <ModuleCard 
          icon={<Truck size={22} />} 
          title="Fornecedores" 
          path="/cadastros/fornecedores" 
        />
        <ModuleCard 
          icon={<Users size={22} />} 
          title="Usuários" 
          path="/cadastros/usuarios" 
        />
      </ModuleSection>
    </div>
  );
};
