import React from 'react';
import { 
  PackagePlus, 
  PackageMinus, 
  ArrowLeftRight,
  Boxes,
  Activity,
  History,
  ClipboardCheck,
  Layers,
  Settings2,
  Package,
  Tag,
  Award
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../../components/common';
import '../../styles/ModulesPage.css';

export const Estoque: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <Package size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Estoque</h1>
          <p className="page-subtitle">Gerencie entradas, saídas e movimentações</p>
        </div>
      </div>

      <ModuleSection title="Produtos">
        <ModuleCard 
          icon={<Package size={22} />} 
          title="Produtos" 
          path="/estoque/produtos" 
        />
        <ModuleCard 
          icon={<Tag size={22} />} 
          title="Categorias" 
          path="/estoque/categorias" 
        />
        <ModuleCard 
          icon={<Award size={22} />} 
          title="Marcas" 
          path="/estoque/marcas" 
        />
      </ModuleSection>

      <ModuleSection title="Operações">
        <ModuleCard 
          icon={<PackagePlus size={22} />} 
          title="Entradas" 
          path="/estoque/entradas" 
        />
        <ModuleCard 
          icon={<PackageMinus size={22} />} 
          title="Saídas" 
          path="/estoque/saidas" 
        />
        <ModuleCard 
          icon={<ArrowLeftRight size={22} />} 
          title="Transferências" 
          path="/estoque/transferencias" 
        />
      </ModuleSection>

      <ModuleSection title="Consultas">
        <ModuleCard 
          icon={<Boxes size={22} />} 
          title="Estoque atual" 
          path="/estoque/atual" 
        />
        <ModuleCard 
          icon={<Activity size={22} />} 
          title="Movimentações" 
          path="/estoque/movimentacoes" 
        />
        <ModuleCard 
          icon={<History size={22} />} 
          title="Histórico" 
          path="/estoque/historico" 
        />
      </ModuleSection>

      <ModuleSection title="Controle">
        <ModuleCard 
          icon={<ClipboardCheck size={22} />} 
          title="Inventário" 
          path="/estoque/inventario" 
        />
        <ModuleCard 
          icon={<Layers size={22} />} 
          title="Lotes" 
          path="/estoque/lotes" 
        />
        <ModuleCard 
          icon={<Settings2 size={22} />} 
          title="Ajustes" 
          path="/estoque/ajustes" 
        />
      </ModuleSection>
    </div>
  );
};
