import React from 'react';
import { 
  FileText, 
  FileCheck, 
  Smartphone,
  FolderOpen,
  Calculator,
  Settings,
  Receipt
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../components/shared';
import './ModulesPage.css';

export const Fiscal: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <Receipt size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Fiscal</h1>
          <p className="page-subtitle">Notas fiscais e obrigações tributárias</p>
        </div>
      </div>

      <ModuleSection title="Notas Fiscais">
        <ModuleCard 
          icon={<FileText size={22} />} 
          title="Notas fiscais" 
          path="/fiscal/notas-fiscais" 
        />
        <ModuleCard 
          icon={<FileCheck size={22} />} 
          title="NF-e" 
          path="/fiscal/nfe" 
        />
        <ModuleCard 
          icon={<Smartphone size={22} />} 
          title="NFC-e" 
          path="/fiscal/nfce" 
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
        <ModuleCard 
          icon={<Settings size={22} />} 
          title="Configurações fiscais" 
          path="/fiscal/configuracoes" 
        />
      </ModuleSection>
    </div>
  );
};
