import React from 'react';
import {
  Headset,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  HelpCircle,
  BookOpen,
  FileText,
  TicketPlus,
  ClipboardList
} from 'lucide-react';
import { ModuleCard, ModuleSection } from '../../components/common';
import '../../styles/ModulesPage.css';
import './Suporte.css';

interface CanalSuporte {
  icon: React.ReactNode;
  title: string;
  valor: string;
  detalhe: string;
}

const canais: CanalSuporte[] = [
  {
    icon: <Phone size={20} />,
    title: 'Telefone',
    valor: '0800 000 0000',
    detalhe: 'Atendimento de segunda a sexta, das 8h às 18h',
  },
  {
    icon: <Mail size={20} />,
    title: 'E-mail',
    valor: 'suporte@nexos.com.br',
    detalhe: 'Resposta em até 1 dia útil',
  },
  {
    icon: <MessageCircle size={20} />,
    title: 'WhatsApp',
    valor: '(11) 90000-0000',
    detalhe: 'Conversa rápida com a equipe de atendimento',
  },
  {
    icon: <Clock size={20} />,
    title: 'Chat online',
    valor: 'Disponível em horário comercial',
    detalhe: 'Espera média de 3 minutos',
  },
];

export const Suporte: React.FC = () => {
  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <Headset size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Suporte</h1>
          <p className="page-subtitle">
            Canais de atendimento, base de conhecimento e acompanhamento de chamados
          </p>
        </div>
      </div>

      <div className="supp-channels">
        {canais.map((canal) => (
          <div className="supp-channel" key={canal.title}>
            <div className="supp-channel-icon">{canal.icon}</div>
            <div className="supp-channel-content">
              <h3 className="supp-channel-title">{canal.title}</h3>
              <p className="supp-channel-value">{canal.valor}</p>
              <p className="supp-channel-detail">{canal.detalhe}</p>
            </div>
          </div>
        ))}
      </div>

      <ModuleSection
        title="Base de conhecimento"
        description="Consulte as respostas antes de abrir um chamado"
      >
        <ModuleCard
          icon={<HelpCircle size={22} />}
          title="Perguntas frequentes"
          path="/suporte/duvidas"
        />
        <ModuleCard
          icon={<BookOpen size={22} />}
          title="Manuais do sistema"
          path="/suporte/manuais"
        />
        <ModuleCard
          icon={<FileText size={22} />}
          title="Roteiros de procedimentos"
          path="/suporte/procedimentos"
        />
      </ModuleSection>

      <ModuleSection title="Chamados" description="Acompanhe e registre solicitações">
        <ModuleCard
          icon={<TicketPlus size={22} />}
          title="Abrir chamado"
          path="/suporte/abrir-chamado"
        />
        <ModuleCard
          icon={<ClipboardList size={22} />}
          title="Meus chamados"
          path="/suporte/chamados"
        />
      </ModuleSection>
    </div>
  );
};
