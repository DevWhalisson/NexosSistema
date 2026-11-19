import React from 'react';
import { 
  Users, 
  UserCheck, 
  Truck, 
  Briefcase,
  Tag, 
  Award,
  ClipboardList
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../../components/common';
import '../../styles/ModulesPage.css';

export const Cadastros: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <ClipboardList size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Pessoas</h1>
          <p className="page-subtitle">Gerencie pessoas, produtos e entidades</p>
        </div>
      </div>

      <ModuleSection title="Pessoas e Contatos">
        <ModuleCard 
          icon={<Users size={22} />} 
          title="Pessoas" 
          path="/cadastros/pessoas" 
        />
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
          icon={<Briefcase size={22} />} 
          title="Usuários" 
          path="/cadastros/funcionarios" 
        />
      </ModuleSection>

      <ModuleSection title="Catálogo">
        <ModuleCard 
          icon={<Tag size={22} />} 
          title="Categorias" 
          path="/cadastros/categorias" 
        />
        <ModuleCard 
          icon={<Award size={22} />} 
          title="Marcas" 
          path="/cadastros/marcas" 
        />
      </ModuleSection>
    </div>
  );
};
