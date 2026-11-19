import React from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  Package, 
  Users, 
  Boxes,
  BarChart3,
  PieChart
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../../components/common';
import '../../styles/ModulesPage.css';

export const Relatorios: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <PieChart size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Relatórios</h1>
          <p className="page-subtitle">Análises e relatórios gerenciais</p>
        </div>
      </div>

      <ModuleSection title="Relatórios Disponíveis">
        <ModuleCard 
          icon={<ShoppingBag size={22} />} 
          title="Vendas" 
          path="/relatorios/vendas" 
        />
        <ModuleCard 
          icon={<DollarSign size={22} />} 
          title="Financeiro" 
          path="/relatorios/financeiro" 
        />
        <ModuleCard 
          icon={<Package size={22} />} 
          title="Estoque" 
          path="/relatorios/estoque" 
        />
        <ModuleCard 
          icon={<Users size={22} />} 
          title="Clientes" 
          path="/relatorios/clientes" 
        />
        <ModuleCard 
          icon={<Boxes size={22} />} 
          title="Produtos" 
          path="/relatorios/produtos" 
        />
        <ModuleCard 
          icon={<BarChart3 size={22} />} 
          title="Gerencial" 
          path="/relatorios/gerencial" 
        />
      </ModuleSection>
    </div>
  );
};
