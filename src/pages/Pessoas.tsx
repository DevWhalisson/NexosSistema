import React from 'react';
import { 
  UserCheck, 
  Truck, 
  Briefcase,
  ClipboardList
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../components/shared';
import './ModulesPage.css';

export const Pessoas: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <ClipboardList size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Pessoas</h1>
          <p className="page-subtitle">Gerencie pessoas e contatos</p>
        </div>
      </div>

      <ModuleSection title="Pessoas e Contatos">
        <ModuleCard 
          icon={<UserCheck size={22} />} 
          title="Clientes" 
          path="/pessoas/clientes" 
        />
        <ModuleCard 
          icon={<Truck size={22} />} 
          title="Fornecedores" 
          path="/pessoas/fornecedores" 
        />
        <ModuleCard 
          icon={<Briefcase size={22} />} 
          title="Funcionários" 
          path="/pessoas/funcionarios" 
        />
      </ModuleSection>
    </div>
  );
};
