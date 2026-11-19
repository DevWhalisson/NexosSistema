import React from 'react';
import {
  FileText,
  FileCheck,
  FolderOpen,
  Calculator,
  Receipt,
  ShoppingBag,
  Monitor,
  ClipboardList
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../../components/common';
import '../../styles/ModulesPage.css';

export const Fiscal: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <Receipt size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Fiscal</h1>
          <p className="page-subtitle">Notas fiscais, tributos e vendas</p>
        </div>
      </div>

      <ModuleSection title="Vendas e Notas Fiscais">
        <ModuleCard 
          icon={<ShoppingBag size={22} />} 
          title="Vendas" 
          path="/fiscal/vendas" 
        />
        <ModuleCard 
          icon={<Monitor size={22} />} 
          title="PDV" 
          path="/fiscal/pdv" 
        />
        <ModuleCard 
          icon={<FileCheck size={22} />} 
          title="NF-e" 
          path="/fiscal/nfe" 
        />
      </ModuleSection>

      <ModuleSection title="Orçamentos e Pedidos">
        <ModuleCard 
          icon={<FileText size={22} />} 
          title="Orçamentos" 
          path="/fiscal/orcamentos" 
        />
        <ModuleCard 
          icon={<ClipboardList size={22} />} 
          title="Pedidos" 
          path="/fiscal/pedidos" 
        />
      </ModuleSection>

      <ModuleSection title="Documentos e Tributos">
        <ModuleCard 
          icon={<FolderOpen size={22} />} 
          title="Documentos fiscais" 
          path="/fiscal/documentos" 
        />
        <ModuleCard 
          icon={<Calculator size={22} />} 
          title="Tributos" 
          path="/fiscal/tributos" 
        />
      </ModuleSection>
    </div>
  );
};
