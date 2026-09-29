import React from 'react';
import { 
  Users, 
  UserCheck, 
  Truck, 
  Briefcase,
  Package, 
  Tag, 
  Award,
  ClipboardList
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../components/shared';
import './ModulesPage.css';

export const Cadastros: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <ClipboardList size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Cadastros</h1>
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
          title="Funcionários" 
          path="/cadastros/funcionarios" 
        />
      </ModuleSection>

      <ModuleSection title="Produtos">
        <ModuleCard 
          icon={<Package size={22} />} 
          title="Produtos" 
          path="/cadastros/produtos" 
        />
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
