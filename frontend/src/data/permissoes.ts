import type { AbaPermissao, ModuloPermissao } from '../types';

export interface ModuloCatalogo {
  key: ModuloPermissao;
  label: string;
  path: string;
}

export interface AbaCatalogo {
  key: AbaPermissao;
  label: string;
  path: string;
  modulos: ModuloCatalogo[];
}

/**
 * Catálogo de abas e módulos usado pela aba de Permissões da ficha de usuário.
 * É a fonte única de verdade: o formulário, a validação e a migração dos
 * registros legados leem a estrutura daqui.
 */
export const ABAS_PERMISSAO: AbaCatalogo[] = [
  {
    key: 'inicio',
    label: 'Início',
    path: '/',
    modulos: [
      { key: 'dashboard', label: 'Dashboard', path: '/' },
    ],
  },
  {
    key: 'pessoas',
    label: 'Pessoas',
    path: '/cadastros',
    modulos: [
      { key: 'pessoas', label: 'Pessoas', path: '/cadastros' },
      { key: 'clientes', label: 'Clientes', path: '/cadastros/clientes' },
      { key: 'fornecedores', label: 'Fornecedores', path: '/cadastros/fornecedores' },
      { key: 'usuarios', label: 'Usuários', path: '/cadastros/usuarios' },
    ],
  },
  {
    key: 'estoque',
    label: 'Estoque',
    path: '/estoque',
    modulos: [
      { key: 'produtos', label: 'Produtos', path: '/estoque/produtos' },
      { key: 'categorias', label: 'Categorias', path: '/estoque/categorias' },
      { key: 'marcas', label: 'Marcas', path: '/estoque/marcas' },
      { key: 'entradas', label: 'Entradas', path: '/estoque/entradas' },
      { key: 'saidas', label: 'Saídas', path: '/estoque/saidas' },
      { key: 'transferencias', label: 'Transferências', path: '/estoque/transferencias' },
      { key: 'estoque-atual', label: 'Estoque atual', path: '/estoque/atual' },
      { key: 'movimentacoes', label: 'Movimentações', path: '/estoque/movimentacoes' },
      { key: 'historico', label: 'Histórico', path: '/estoque/historico' },
      { key: 'inventario', label: 'Inventário', path: '/estoque/inventario' },
      { key: 'lotes', label: 'Lotes', path: '/estoque/lotes' },
      { key: 'ajustes', label: 'Ajustes', path: '/estoque/ajustes' },
    ],
  },
  {
    key: 'fiscal',
    label: 'Fiscal',
    path: '/fiscal',
    modulos: [
      { key: 'vendas', label: 'Vendas', path: '/fiscal/vendas' },
      { key: 'pdv', label: 'PDV', path: '/fiscal/pdv' },
      { key: 'nfe', label: 'NF-e', path: '/fiscal/nfe' },
      { key: 'notas-fiscais', label: 'Notas fiscais', path: '/fiscal/notas-fiscais' },
      { key: 'nfce', label: 'NFC-e', path: '/fiscal/nfce' },
      { key: 'documentos-fiscais', label: 'Documentos fiscais', path: '/fiscal/documentos' },
      { key: 'tributos', label: 'Tributos', path: '/fiscal/tributos' },
      { key: 'comissoes', label: 'Comissões', path: '/fiscal/comissoes' },
      { key: 'orcamentos', label: 'Orçamentos', path: '/fiscal/orcamentos' },
      { key: 'pedidos', label: 'Pedidos', path: '/fiscal/pedidos' },
    ],
  },
  {
    key: 'financeiro',
    label: 'Financeiro',
    path: '/financeiro',
    modulos: [
      { key: 'visao-geral', label: 'Visão geral', path: '/financeiro/visao-geral' },
      { key: 'contas-a-pagar', label: 'Contas a pagar', path: '/financeiro/contas-a-pagar' },
      { key: 'contas-a-receber', label: 'Contas a receber', path: '/financeiro/contas-a-receber' },
      { key: 'fluxo-de-caixa', label: 'Fluxo de caixa', path: '/financeiro/fluxo-de-caixa' },
      { key: 'caixas', label: 'Caixas', path: '/financeiro/caixas' },
      { key: 'bancos', label: 'Bancos', path: '/financeiro/bancos' },
      { key: 'conciliacao', label: 'Conciliação', path: '/financeiro/conciliacao' },
    ],
  },
  {
    key: 'relatorios',
    label: 'Relatórios',
    path: '/relatorios',
    modulos: [
      { key: 'relatorio-vendas', label: 'Vendas', path: '/relatorios/vendas' },
      { key: 'relatorio-financeiro', label: 'Financeiro', path: '/relatorios/financeiro' },
      { key: 'relatorio-estoque', label: 'Estoque', path: '/relatorios/estoque' },
      { key: 'relatorio-clientes', label: 'Clientes', path: '/relatorios/clientes' },
      { key: 'relatorio-produtos', label: 'Produtos', path: '/relatorios/produtos' },
      { key: 'relatorio-gerencial', label: 'Gerencial', path: '/relatorios/gerencial' },
    ],
  },
  {
    key: 'configuracoes',
    label: 'Configurações',
    path: '/configuracoes',
    modulos: [
      { key: 'empresa', label: 'Dados da empresa', path: '/configuracoes/empresa' },
      { key: 'identidade', label: 'Logotipo e identidade', path: '/configuracoes/identidade' },
      { key: 'niveis-de-acesso', label: 'Níveis de acesso', path: '/configuracoes/niveis-de-acesso' },
      { key: 'seguranca', label: 'Senhas e políticas', path: '/configuracoes/seguranca' },
      { key: 'fiscais', label: 'Configurações fiscais', path: '/configuracoes/fiscais' },
      { key: 'fiscal-serie', label: 'Série e numeração', path: '/configuracoes/fiscal-serie' },
      { key: 'fiscal-produtos', label: 'Produtos e serviços (NCM)', path: '/configuracoes/fiscal-produtos' },
      { key: 'depositos', label: 'Depósitos e locais', path: '/configuracoes/depositos' },
      { key: 'unidades', label: 'Unidades de medida', path: '/configuracoes/unidades' },
      { key: 'moedas', label: 'Moedas', path: '/configuracoes/moedas' },
      { key: 'formas-pagamento', label: 'Formas de pagamento', path: '/configuracoes/formas-pagamento' },
      { key: 'parametros', label: 'Parâmetros do sistema', path: '/configuracoes/parametros' },
      { key: 'logs', label: 'Logs e auditoria', path: '/configuracoes/logs' },
      { key: 'backup', label: 'Backup e restauração', path: '/configuracoes/backup' },
      { key: 'integracoes', label: 'Integrações', path: '/configuracoes/integracoes' },
      { key: 'sobre', label: 'Sobre o sistema', path: '/configuracoes/sobre' },
    ],
  },
  {
    key: 'suporte',
    label: 'Suporte',
    path: '/suporte',
    modulos: [
      { key: 'duvidas', label: 'Perguntas frequentes', path: '/suporte/duvidas' },
      { key: 'manuais', label: 'Manuais do sistema', path: '/suporte/manuais' },
      { key: 'procedimentos', label: 'Roteiros de procedimentos', path: '/suporte/procedimentos' },
      { key: 'abrir-chamado', label: 'Abrir chamado', path: '/suporte/abrir-chamado' },
      { key: 'chamados', label: 'Meus chamados', path: '/suporte/chamados' },
    ],
  },
  {
    key: 'notificacoes',
    label: 'Notificações',
    path: '/notificacoes',
    modulos: [
      { key: 'notificacoes', label: 'Central de notificações', path: '/notificacoes' },
    ],
  },
];

export const ABAS_PERMISSAO_KEYS: AbaPermissao[] = ABAS_PERMISSAO.map((aba) => aba.key);

export const MODULOS_POR_ABA: Record<AbaPermissao, ModuloCatalogo[]> = ABAS_PERMISSAO.reduce(
  (acumulado, aba) => {
    acumulado[aba.key] = aba.modulos;
    return acumulado;
  },
  {} as Record<AbaPermissao, ModuloCatalogo[]>
);

export const TOTAL_MODULOS_PERMISSAO = ABAS_PERMISSAO.reduce(
  (total, aba) => total + aba.modulos.length,
  0
);
