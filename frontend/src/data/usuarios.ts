import type { AbaPermissao, AcaoPermissao, ModuloPermissao, PermissoesModulo, Usuario } from '../types';
import { ABAS_PERMISSAO } from './permissoes';

type RegrasPermissao = Partial<Record<AbaPermissao, Partial<Record<ModuloPermissao, AcaoPermissao[]>>>>;

const acoes = (marcadas: AcaoPermissao[]): Record<AcaoPermissao, boolean> => ({
  visualizar: marcadas.includes('visualizar'),
  incluir: marcadas.includes('incluir'),
  editar: marcadas.includes('editar'),
  excluir: marcadas.includes('excluir'),
});

const construirPermissoes = (regras: RegrasPermissao): PermissoesModulo => {
  const permissoes = {} as PermissoesModulo;
  ABAS_PERMISSAO.forEach((aba) => {
    const modulos = {} as PermissoesModulo[AbaPermissao];
    aba.modulos.forEach((modulo) => {
      const marcadas = regras[aba.key]?.[modulo.key] ?? [];
      modulos[modulo.key] = acoes(marcadas);
    });
    permissoes[aba.key] = modulos;
  });
  return permissoes;
};

const semPermissoes = (): PermissoesModulo => construirPermissoes({});

const permissoesTotais = (): PermissoesModulo => {
  const todas: AcaoPermissao[] = ['visualizar', 'incluir', 'editar', 'excluir'];
  const regras: RegrasPermissao = {};
  ABAS_PERMISSAO.forEach((aba) => {
    const modulos: Partial<Record<ModuloPermissao, AcaoPermissao[]>> = {};
    aba.modulos.forEach((modulo) => {
      modulos[modulo.key] = todas;
    });
    regras[aba.key] = modulos;
  });
  return construirPermissoes(regras);
};

const permissoesOperacionais = (): PermissoesModulo =>
  construirPermissoes({
    inicio: {
      dashboard: ['visualizar'],
    },
    pessoas: {
      pessoas: ['visualizar'],
      clientes: ['visualizar', 'incluir', 'editar'],
      fornecedores: ['visualizar', 'incluir', 'editar'],
      usuarios: ['visualizar'],
    },
    estoque: {
      produtos: ['visualizar', 'incluir', 'editar'],
      categorias: ['visualizar'],
      marcas: ['visualizar'],
      entradas: ['visualizar', 'incluir'],
      saidas: ['visualizar', 'incluir'],
      'estoque-atual': ['visualizar'],
      movimentacoes: ['visualizar'],
    },
    fiscal: {
      vendas: ['visualizar', 'incluir', 'editar'],
      pdv: ['visualizar', 'incluir'],
      nfe: ['visualizar'],
      orcamentos: ['visualizar', 'incluir'],
      pedidos: ['visualizar'],
    },
    relatorios: {
      'relatorio-vendas': ['visualizar'],
      'relatorio-estoque': ['visualizar'],
    },
    notificacoes: {
      notificacoes: ['visualizar'],
    },
  });

// Dados fictícios de demonstração. Sem backend: a persistência real será
// implementada em etapa futura. Nenhum dado pessoal real é utilizado.
export const usuariosData: Usuario[] = [
  {
    id: 7001,
    codigo: '0001',
    nome: 'Ana Beatriz Souza',
    email: 'ana.souza@nexos.com.br',
    tipo: 'Administrador',
    status: 'Ativo',
    comissoes: { vendasAVista: 3, vendasAPrazo: 1.5, vendasCartao: 1, servicos: 2 },
    permissaoTotal: true,
    permissoes: permissoesTotais(),
  },
  {
    id: 7002,
    codigo: '0002',
    nome: 'Carlos Eduardo Lima',
    email: 'carlos.lima@nexos.com.br',
    tipo: 'Administrador',
    status: 'Ativo',
    comissoes: { vendasAVista: 2.5, vendasAPrazo: 1, vendasCartao: 0.8, servicos: 2 },
    permissaoTotal: true,
    permissoes: permissoesTotais(),
  },
  {
    id: 7003,
    codigo: '0003',
    nome: 'Maria Fernanda Alves',
    email: 'maria.alves@nexos.com.br',
    tipo: 'Usuario',
    status: 'Ativo',
    comissoes: { vendasAVista: 4, vendasAPrazo: 2, vendasCartao: 1.5, servicos: 3 },
    permissaoTotal: false,
    permissoes: permissoesOperacionais(),
  },
  {
    id: 7004,
    codigo: '0004',
    nome: 'João Pedro Martins',
    email: 'joao.martins@nexos.com.br',
    tipo: 'Usuario',
    status: 'Ativo',
    comissoes: { vendasAVista: 3.5, vendasAPrazo: 1.75, vendasCartao: 1.2, servicos: 0 },
    permissaoTotal: false,
    permissoes: permissoesOperacionais(),
  },
  {
    id: 7005,
    codigo: '0005',
    nome: 'Juliana Ribeiro Costa',
    email: 'juliana.costa@nexos.com.br',
    tipo: 'Usuario',
    status: 'Inativo',
    comissoes: { vendasAVista: 2, vendasAPrazo: 1, vendasCartao: 0.5, servicos: 1 },
    permissaoTotal: false,
    permissoes: semPermissoes(),
  },
  {
    id: 7006,
    codigo: '0006',
    nome: 'Rafael Nogueira Dias',
    email: 'rafael.dias@nexos.com.br',
    tipo: 'Usuario',
    status: 'Ativo',
    comissoes: { vendasAVista: 5, vendasAPrazo: 2.5, vendasCartao: 2, servicos: 4 },
    permissaoTotal: false,
    permissoes: permissoesOperacionais(),
  },
  {
    id: 7007,
    codigo: '0007',
    nome: 'Patrícia Gomes Ferreira',
    email: 'patricia.ferreira@nexos.com.br',
    tipo: 'Administrador',
    status: 'Ativo',
    comissoes: { vendasAVista: 1, vendasAPrazo: 0.5, vendasCartao: 0.5, servicos: 1.5 },
    permissaoTotal: true,
    permissoes: permissoesTotais(),
  },
  {
    id: 7008,
    codigo: '0008',
    nome: 'Bruno Henrique Rocha',
    email: 'bruno.rocha@nexos.com.br',
    tipo: 'Usuario',
    status: 'Inativo',
    comissoes: { vendasAVista: 2.75, vendasAPrazo: 1.25, vendasCartao: 1, servicos: 2.5 },
    permissaoTotal: false,
    permissoes: semPermissoes(),
  },
  {
    id: 7009,
    codigo: '0009',
    nome: 'Camila Santos Oliveira',
    email: 'camila.oliveira@nexos.com.br',
    tipo: 'Usuario',
    status: 'Ativo',
    comissoes: { vendasAVista: 3, vendasAPrazo: 1.5, vendasCartao: 1.5, servicos: 3.5 },
    permissaoTotal: false,
    permissoes: permissoesOperacionais(),
  },
  {
    id: 7010,
    codigo: '0010',
    nome: 'Diego Almeida Prado',
    email: 'diego.prado@nexos.com.br',
    tipo: 'Usuario',
    status: 'Ativo',
    comissoes: { vendasAVista: 4.5, vendasAPrazo: 2.25, vendasCartao: 1.75, servicos: 5 },
    permissaoTotal: false,
    permissoes: permissoesOperacionais(),
  },
  {
    id: 7011,
    codigo: '0011',
    nome: 'Larissa Mendes Barbosa',
    email: 'larissa.barbosa@nexos.com.br',
    tipo: 'Administrador',
    status: 'Inativo',
    comissoes: { vendasAVista: 2, vendasAPrazo: 1, vendasCartao: 1, servicos: 2 },
    permissaoTotal: true,
    permissoes: permissoesTotais(),
  },
  {
    id: 7012,
    codigo: '0012',
    nome: 'Thiago Carvalho Moreira',
    email: 'thiago.moreira@nexos.com.br',
    tipo: 'Usuario',
    status: 'Inativo',
    comissoes: { vendasAVista: 0, vendasAPrazo: 0, vendasCartao: 0, servicos: 0 },
    permissaoTotal: false,
    permissoes: semPermissoes(),
  },
];
