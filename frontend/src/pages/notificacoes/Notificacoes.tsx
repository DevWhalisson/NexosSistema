import React, { useMemo, useState } from 'react';
import {
  Bell,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CheckCheck,
  Inbox
} from 'lucide-react';
import '../../styles/ModulesPage.css';
import './Notificacoes.css';

type TipoNotificacao = 'info' | 'sucesso' | 'aviso' | 'erro';

interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  titulo: string;
  descricao: string;
  tempo: string;
  lida: boolean;
}

const icones: Record<TipoNotificacao, React.ReactNode> = {
  info: <Info size={18} />,
  sucesso: <CheckCircle2 size={18} />,
  aviso: <AlertTriangle size={18} />,
  erro: <XCircle size={18} />,
};

const notificacoesIniciais: Notificacao[] = [
  {
    id: 1,
    tipo: 'erro',
    titulo: 'Nota fiscal rejeitada',
    descricao: 'A NF-e nº 000123 foi rejeitada pela SEFAZ por divergência no valor total.',
    tempo: 'Há 10 minutos',
    lida: false,
  },
  {
    id: 2,
    tipo: 'aviso',
    titulo: 'Estoque abaixo do mínimo',
    descricao: 'O produto "Cabo HDMI 2m" atingiu o estoque mínimo configurado (4 unidades).',
    tempo: 'Há 3 horas',
    lida: false,
  },
  {
    id: 3,
    tipo: 'sucesso',
    titulo: 'Backup automático concluído',
    descricao: 'O backup diário do banco de dados foi concluído sem erros.',
    tempo: 'Há 5 horas',
    lida: false,
  },
  {
    id: 4,
    tipo: 'info',
    titulo: 'Novo usuário cadastrado',
    descricao: 'Maria Fernanda Alves foi cadastrada no sistema com perfil de Usuário.',
    tempo: 'Ontem',
    lida: true,
  },
  {
    id: 5,
    tipo: 'sucesso',
    titulo: 'Comissões calculadas',
    descricao: 'As comissões do período foram calculadas para 12 vendedores.',
    tempo: 'Ontem',
    lida: true,
  },
  {
    id: 6,
    tipo: 'aviso',
    titulo: 'Documentos fiscais pendentes',
    descricao: '3 notas fiscais aguardam transmissão para a SEFAZ.',
    tempo: 'Há 2 dias',
    lida: true,
  },
  {
    id: 7,
    tipo: 'info',
    titulo: 'Atualização disponível',
    descricao: 'Uma nova versão do sistema está disponível para instalação.',
    tempo: 'Há 3 dias',
    lida: true,
  },
];

type Filtro = 'todas' | 'nao-lidas';

export const Notificacoes: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>(notificacoesIniciais);
  const [filtro, setFiltro] = useState<Filtro>('todas');

  const naoLidas = useMemo(
    () => notificacoes.filter((notificacao) => !notificacao.lida).length,
    [notificacoes]
  );

  const visiveis = useMemo(
    () =>
      notificacoes.filter((notificacao) =>
        filtro === 'nao-lidas' ? !notificacao.lida : true
      ),
    [notificacoes, filtro]
  );

  const marcarComoLida = (id: number) => {
    setNotificacoes((anterior) =>
      anterior.map((notificacao) =>
        notificacao.id === id ? { ...notificacao, lida: true } : notificacao
      )
    );
  };

  const marcarTodasComoLidas = () => {
    setNotificacoes((anterior) =>
      anterior.map((notificacao) => ({ ...notificacao, lida: true }))
    );
  };

  return (
    <div className="modules-page">
      <div className="page-header">
        <div className="page-header-icon">
          <Bell size={24} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Notificações</h1>
          <p className="page-subtitle">
            Avisos, alertas e atualizações do sistema
            {naoLidas > 0 ? ` — ${naoLidas} não lida(s)` : ''}
          </p>
        </div>
      </div>

      <div className="ntf-toolbar">
        <div className="ntf-filters">
          <button
            type="button"
            className={`ntf-filter ${filtro === 'todas' ? 'active' : ''}`}
            onClick={() => setFiltro('todas')}
          >
            Todas
            <span className="ntf-filter-count">{notificacoes.length}</span>
          </button>
          <button
            type="button"
            className={`ntf-filter ${filtro === 'nao-lidas' ? 'active' : ''}`}
            onClick={() => setFiltro('nao-lidas')}
          >
            Não lidas
            <span className="ntf-filter-count">{naoLidas}</span>
          </button>
        </div>

        <button
          type="button"
          className="ntf-mark-all"
          onClick={marcarTodasComoLidas}
          disabled={naoLidas === 0}
        >
          <CheckCheck size={16} />
          Marcar todas como lidas
        </button>
      </div>

      {visiveis.length === 0 ? (
        <div className="ntf-empty">
          <Inbox size={40} />
          <h2>Nenhuma notificação por aqui</h2>
          <p>Não há avisos para exibir com o filtro selecionado.</p>
        </div>
      ) : (
        <ul className="ntf-list">
          {visiveis.map((notificacao) => (
            <li
              key={notificacao.id}
              className={`ntf-item ntf-item-${notificacao.tipo} ${
                notificacao.lida ? '' : 'unread'
              }`}
            >
              <div className="ntf-item-icon">{icones[notificacao.tipo]}</div>
              <div className="ntf-item-content">
                <div className="ntf-item-header">
                  <h3 className="ntf-item-title">{notificacao.titulo}</h3>
                  <span className="ntf-item-time">{notificacao.tempo}</span>
                </div>
                <p className="ntf-item-description">{notificacao.descricao}</p>
                {!notificacao.lida && (
                  <button
                    type="button"
                    className="ntf-item-action"
                    onClick={() => marcarComoLida(notificacao.id)}
                  >
                    Marcar como lida
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
