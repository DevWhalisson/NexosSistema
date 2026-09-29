import React from 'react';
import { 
  ShoppingBag, 
  Monitor, 
  Percent,
  FileText, 
  ClipboardList,
  ShoppingCart
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../components/shared';
import './ModulesPage.css';

export const Comercial: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <ShoppingCart size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Comercial</h1>
          <p className="page-subtitle">Vendas, orçamentos e pedidos</p>
        </div>
      </div>

      <ModuleSection title="Vendas">
        <ModuleCard 
          icon={<ShoppingBag size={22} />} 
          title="Vendas" 
          path="/comercial/vendas" 
        />
        <ModuleCard 
          icon={<Monitor size={22} />} 
          title="PDV" 
          path="/comercial/pdv" 
        />
        <ModuleCard 
          icon={<Percent size={22} />} 
          title="Comissões" 
          path="/comercial/comissoes" 
        />
      </ModuleSection>

      <ModuleSection title="Orçamentos e Pedidos">
        <ModuleCard 
          icon={<FileText size={22} />} 
          title="Orçamentos" 
          path="/comercial/orcamentos" 
        />
        <ModuleCard 
          icon={<ClipboardList size={22} />} 
          title="Pedidos" 
          path="/comercial/pedidos" 
        />
      </ModuleSection>
    </div>
  );
};
