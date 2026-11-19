import React from 'react';
import { 
  Eye, 
  CreditCard, 
  Banknote,
  TrendingUp,
  Wallet,
  Building2,
  GitCompare,
  DollarSign
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../../components/common';
import '../../styles/ModulesPage.css';

export const Financeiro: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <DollarSign size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Financeiro</h1>
          <p className="page-subtitle">Controle contas e fluxo de caixa</p>
        </div>
      </div>

      <ModuleSection title="Operações">
        <ModuleCard 
          icon={<Eye size={22} />} 
          title="Visão geral" 
          path="/financeiro/visao-geral" 
        />
        <ModuleCard 
          icon={<CreditCard size={22} />} 
          title="Contas a pagar" 
          path="/financeiro/contas-a-pagar" 
        />
        <ModuleCard 
          icon={<Banknote size={22} />} 
          title="Contas a receber" 
          path="/financeiro/contas-a-receber" 
        />
      </ModuleSection>

      <ModuleSection title="Caixa e Bancos">
        <ModuleCard 
          icon={<TrendingUp size={22} />} 
          title="Fluxo de caixa" 
          path="/financeiro/fluxo-de-caixa" 
        />
        <ModuleCard 
          icon={<Wallet size={22} />} 
          title="Caixas" 
          path="/financeiro/caixas" 
        />
        <ModuleCard 
          icon={<Building2 size={22} />} 
          title="Bancos" 
          path="/financeiro/bancos" 
        />
        <ModuleCard 
          icon={<GitCompare size={22} />} 
          title="Conciliação" 
          path="/financeiro/conciliacao" 
        />
      </ModuleSection>
    </div>
  );
};
