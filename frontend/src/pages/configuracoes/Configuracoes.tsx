import React from 'react';
import {
  Building2,
  Palette,
  Users,
  ShieldCheck,
  KeyRound,
  Receipt,
  FileStack,
  Tags,
  Warehouse,
  Ruler,
  Coins,
  CreditCard,
  SlidersHorizontal,
  ScrollText,
  DatabaseBackup,
  Plug,
  Info,
  Settings
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../../components/common';
import '../../styles/ModulesPage.css';

export const Configuracoes: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <Settings size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Parâmetros da empresa, módulos e sistema</p>
        </div>
      </div>

      <ModuleSection title="Empresa">
        <ModuleCard 
          icon={<Building2 size={22} />} 
          title="Dados da empresa" 
          path="/configuracoes/empresa" 
        />
        <ModuleCard 
          icon={<Palette size={22} />} 
          title="Logotipo e identidade" 
          path="/configuracoes/identidade" 
        />
      </ModuleSection>

      <ModuleSection title="Acessos e Segurança">
        <ModuleCard 
          icon={<Users size={22} />} 
          title="Usuários" 
          path="/cadastros/usuarios" 
        />
        <ModuleCard 
          icon={<ShieldCheck size={22} />} 
          title="Níveis de acesso" 
          path="/configuracoes/niveis-de-acesso" 
        />
        <ModuleCard 
          icon={<KeyRound size={22} />} 
          title="Senhas e políticas" 
          path="/configuracoes/seguranca" 
        />
      </ModuleSection>

      <ModuleSection title="Fiscal">
        <ModuleCard 
          icon={<Receipt size={22} />} 
          title="Configurações fiscais" 
          path="/configuracoes/fiscais" 
        />
        <ModuleCard 
          icon={<FileStack size={22} />} 
          title="Série e numeração" 
          path="/configuracoes/fiscal-serie" 
        />
        <ModuleCard 
          icon={<Tags size={22} />} 
          title="Produtos e serviços (NCM)" 
          path="/configuracoes/fiscal-produtos" 
        />
      </ModuleSection>

      <ModuleSection title="Estoque">
        <ModuleCard 
          icon={<Warehouse size={22} />} 
          title="Depósitos e locais" 
          path="/configuracoes/depositos" 
        />
        <ModuleCard 
          icon={<Ruler size={22} />} 
          title="Unidades de medida" 
          path="/configuracoes/unidades" 
        />
      </ModuleSection>

      <ModuleSection title="Financeiro">
        <ModuleCard 
          icon={<Coins size={22} />} 
          title="Moedas" 
          path="/configuracoes/moedas" 
        />
        <ModuleCard 
          icon={<CreditCard size={22} />} 
          title="Formas de pagamento" 
          path="/configuracoes/formas-pagamento" 
        />
      </ModuleSection>

      <ModuleSection title="Sistema">
        <ModuleCard 
          icon={<SlidersHorizontal size={22} />} 
          title="Parâmetros do sistema" 
          path="/configuracoes/parametros" 
        />
        <ModuleCard 
          icon={<ScrollText size={22} />} 
          title="Logs e auditoria" 
          path="/configuracoes/logs" 
        />
        <ModuleCard 
          icon={<DatabaseBackup size={22} />} 
          title="Backup e restauração" 
          path="/configuracoes/backup" 
        />
        <ModuleCard 
          icon={<Plug size={22} />} 
          title="Integrações" 
          path="/configuracoes/integracoes" 
        />
        <ModuleCard 
          icon={<Info size={22} />} 
          title="Sobre o sistema" 
          path="/configuracoes/sobre" 
        />
      </ModuleSection>
    </div>
  );
};
