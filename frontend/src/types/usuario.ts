export type TipoUsuario = 'Usuario' | 'Administrador';

export type StatusUsuario = 'Ativo' | 'Inativo';

/** Abas (seções) do sistema que podem ser liberadas por perfil de acesso. */
export type AbaPermissao =
  | 'inicio'
  | 'pessoas'
  | 'estoque'
  | 'fiscal'
  | 'financeiro'
  | 'relatorios'
  | 'configuracoes'
  | 'suporte'
  | 'notificacoes';

/** Módulos existentes dentro de cada aba. A chave é única em todo o sistema. */
export type ModuloPermissao =
  | 'dashboard'
  | 'pessoas'
  | 'clientes'
  | 'fornecedores'
  | 'usuarios'
  | 'entradas'
  | 'saidas'
  | 'transferencias'
  | 'estoque-atual'
  | 'movimentacoes'
  | 'historico'
  | 'inventario'
  | 'lotes'
  | 'ajustes'
  | 'produtos'
  | 'categorias'
  | 'marcas'
  | 'notas-fiscais'
  | 'nfe'
  | 'nfce'
  | 'documentos-fiscais'
  | 'tributos'
  | 'vendas'
  | 'pdv'
  | 'comissoes'
  | 'orcamentos'
  | 'pedidos'
  | 'visao-geral'
  | 'contas-a-pagar'
  | 'contas-a-receber'
  | 'fluxo-de-caixa'
  | 'caixas'
  | 'bancos'
  | 'conciliacao'
  | 'relatorio-vendas'
  | 'relatorio-financeiro'
  | 'relatorio-estoque'
  | 'relatorio-clientes'
  | 'relatorio-produtos'
  | 'relatorio-gerencial'
  | 'empresa'
  | 'identidade'
  | 'niveis-de-acesso'
  | 'seguranca'
  | 'fiscais'
  | 'fiscal-serie'
  | 'fiscal-produtos'
  | 'depositos'
  | 'unidades'
  | 'moedas'
  | 'formas-pagamento'
  | 'parametros'
  | 'logs'
  | 'backup'
  | 'integracoes'
  | 'sobre'
  | 'duvidas'
  | 'manuais'
  | 'procedimentos'
  | 'abrir-chamado'
  | 'chamados'
  | 'notificacoes';

export type AcaoPermissao = 'visualizar' | 'incluir' | 'editar' | 'excluir';

export type PermissaoAcoes = Record<AcaoPermissao, boolean>;

/** Permissões agrupadas por aba e módulo. */
export type PermissoesModulo = Record<AbaPermissao, Record<ModuloPermissao, PermissaoAcoes>>;

export interface ComissoesUsuario {
  vendasAVista: number;
  vendasAPrazo: number;
  vendasCartao: number;
  servicos: number;
}

export interface Usuario {
  id: number;
  codigo: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  status: StatusUsuario;
  imagem?: string;
  comissoes: ComissoesUsuario;
  permissaoTotal: boolean;
  permissoes: PermissoesModulo;
}
