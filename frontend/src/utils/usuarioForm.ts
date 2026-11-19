import type {
  AbaPermissao,
  AcaoPermissao,
  ComissoesUsuario,
  ModuloPermissao,
  PermissaoAcoes,
  PermissoesModulo,
  StatusUsuario,
  TipoUsuario,
} from '../types';
import { ABAS_PERMISSAO, ABAS_PERMISSAO_KEYS, MODULOS_POR_ABA } from '../data/permissoes';

export const LIMITE_NOME = 120;
export const COMISSOES_CASAS_DECIMAIS = 2;

export const ACOES_PERMISSAO: AcaoPermissao[] = [
  'visualizar',
  'incluir',
  'editar',
  'excluir',
];

export const TIPOS_USUARIO: TipoUsuario[] = ['Usuario', 'Administrador'];
export const STATUS_USUARIO: StatusUsuario[] = ['Ativo', 'Inativo'];

export interface ComissoesFormulario {
  vendasAVista: string;
  vendasAPrazo: string;
  vendasCartao: string;
  servicos: string;
}

export interface UsuarioFormInput {
  id: number;
  codigo: string;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  status: StatusUsuario;
  imagem?: string;
  comissoes: ComissoesFormulario;
  permissaoTotal: boolean;
  permissoes: PermissoesModulo;
}

export interface UsuarioNormalizado {
  id: number;
  codigo: string;
  nome: string;
  email: string;
  emailComparacao: string;
  tipo: TipoUsuario;
  status: StatusUsuario;
  imagem?: string;
  comissoes: ComissoesUsuario;
  permissaoTotal: boolean;
  permissoes: PermissoesModulo;
}

export type ValidationErrors = Record<string, string>;

export interface PrepareUsuarioResult {
  valid: boolean;
  errors: ValidationErrors;
  data: UsuarioNormalizado;
}

const acoesVazias = (): PermissaoAcoes => ({
  visualizar: false,
  incluir: false,
  editar: false,
  excluir: false,
});

const acoesTotais = (): PermissaoAcoes => ({
  visualizar: true,
  incluir: true,
  editar: true,
  excluir: true,
});

export const criarPermissoesVazias = (): PermissoesModulo =>
  ABAS_PERMISSAO.reduce((acumulado, aba) => {
    acumulado[aba.key] = aba.modulos.reduce((modulos, modulo) => {
      modulos[modulo.key] = acoesVazias();
      return modulos;
    }, {} as Record<ModuloPermissao, PermissaoAcoes>);
    return acumulado;
  }, {} as PermissoesModulo);

export const criarPermissoesTotais = (): PermissoesModulo =>
  ABAS_PERMISSAO.reduce((acumulado, aba) => {
    acumulado[aba.key] = aba.modulos.reduce((modulos, modulo) => {
      modulos[modulo.key] = acoesTotais();
      return modulos;
    }, {} as Record<ModuloPermissao, PermissaoAcoes>);
    return acumulado;
  }, {} as PermissoesModulo);

/** Verifica se o módulo possui ao menos uma ação liberada. */
export const moduloConcedido = (acoes?: Partial<PermissaoAcoes>): boolean =>
  ACOES_PERMISSAO.some((acao) => Boolean(acoes?.[acao]));

/** Verifica se todos os módulos da aba estão liberados em todas as ações. */
export const abaTotalmenteLiberada = (
  permissoes: PermissoesModulo,
  aba: AbaPermissao
): boolean => {
  const modulos = MODULOS_POR_ABA[aba] ?? [];
  if (modulos.length === 0) return false;
  return modulos.every((modulo) => {
    const acoes = permissoes?.[aba]?.[modulo.key];
    return ACOES_PERMISSAO.every((acao) => Boolean(acoes?.[acao]));
  });
};

/** Conta quantos módulos da aba possuem ao menos uma ação liberada. */
export const contarModulosLiberados = (
  permissoes: PermissoesModulo,
  aba: AbaPermissao
): number => {
  const modulos = MODULOS_POR_ABA[aba] ?? [];
  return modulos.filter((modulo) =>
    moduloConcedido(permissoes?.[aba]?.[modulo.key])
  ).length;
};

/**
 * Converte a estrutura antiga (uma linha por módulo do sistema) para o
 * formato atual (aba → módulo → ações). As permissões legadas são
 * distribuídas entre os módulos correspondentes de cada aba.
 */
const MAPEAMENTO_PERMISSOES_LEGADAS: {
  modulo: string;
  aba: AbaPermissao;
  modulos: ModuloPermissao[];
}[] = [
  { modulo: 'inicio', aba: 'inicio', modulos: ['dashboard'] },
  {
    modulo: 'cadastros',
    aba: 'pessoas',
    modulos: ['pessoas', 'clientes', 'fornecedores', 'usuarios'],
  },
  {
    modulo: 'comercial',
    aba: 'fiscal',
    modulos: ['vendas', 'pdv', 'comissoes', 'orcamentos', 'pedidos'],
  },
  { modulo: 'estoque', aba: 'estoque', modulos: [] },
  { modulo: 'financeiro', aba: 'financeiro', modulos: [] },
  { modulo: 'fiscal', aba: 'fiscal', modulos: [] },
  { modulo: 'relatorios', aba: 'relatorios', modulos: [] },
];

const migrarPermissoesLegadas = (legado: Record<string, unknown>): PermissoesModulo => {
  const migradas = criarPermissoesVazias();
  MAPEAMENTO_PERMISSOES_LEGADAS.forEach(({ modulo, aba, modulos }) => {
    const conteudo = legado[modulo];
    if (typeof conteudo !== 'object' || conteudo === null) return;
    const acoes = conteudo as Record<string, unknown>;
    const marcados = ACOES_PERMISSAO.filter((acao) => acoes[acao] === true);
    if (marcados.length === 0) return;
    const destinos =
      modulos.length > 0
        ? modulos
        : (MODULOS_POR_ABA[aba] ?? []).map((item) => item.key);
    destinos.forEach((destino) => {
      ACOES_PERMISSAO.forEach((acao) => {
        if (marcados.includes(acao)) {
          migradas[aba][destino][acao] = true;
        }
      });
    });
  });
  return migradas;
};

const ehEstruturaLegada = (valor: Record<string, unknown>): boolean =>
  Object.keys(valor).some((chave) => {
    const conteudo = valor[chave];
    if (typeof conteudo !== 'object' || conteudo === null) return false;
    const acoes = conteudo as Record<string, unknown>;
    return ACOES_PERMISSAO.every((acao) => typeof acoes[acao] === 'boolean');
  });

/**
 * Normaliza as permissões gravadas no armazenamento local. Aceita o formato
 * atual e o formato legado (convertido por migração) e completa módulos ou
 * ações ausentes com `false`.
 */
export const normalizarPermissoesArmazenadas = (valor: unknown): PermissoesModulo | null => {
  if (typeof valor !== 'object' || valor === null) return null;
  const registro = valor as Record<string, unknown>;

  // O formato legado é reconhecido primeiro: os módulos antigos também usam
  // nomes de abas (inicio, estoque, financeiro...), mas os valores são ações.
  if (ehEstruturaLegada(registro)) {
    return migrarPermissoesLegadas(registro);
  }

  const possuiAbaConhecida = ABAS_PERMISSAO_KEYS.some(
    (aba) => typeof registro[aba] === 'object' && registro[aba] !== null
  );

  if (!possuiAbaConhecida) return null;

  const normalizadas = criarPermissoesVazias();
  ABAS_PERMISSAO.forEach((aba) => {
    const modulos = registro[aba.key];
    if (typeof modulos !== 'object' || modulos === null) return;
    const registros = modulos as Record<string, unknown>;
    aba.modulos.forEach((modulo) => {
      const acoes = registros[modulo.key];
      if (typeof acoes !== 'object' || acoes === null) return;
      const valores = acoes as Record<string, unknown>;
      ACOES_PERMISSAO.forEach((acao) => {
        normalizadas[aba.key][modulo.key][acao] = valores[acao] === true;
      });
    });
  });
  return normalizadas;
};


export const comissoesVazias = (): ComissoesUsuario => ({
  vendasAVista: 0,
  vendasAPrazo: 0,
  vendasCartao: 0,
  servicos: 0,
});

export const comissoesFormularioVazias = (): ComissoesFormulario => ({
  vendasAVista: '0,00',
  vendasAPrazo: '0,00',
  vendasCartao: '0,00',
  servicos: '0,00',
});

export const formatarPercentual = (valor: number): string =>
  valor.toFixed(COMISSOES_CASAS_DECIMAIS).replace('.', ',');

export const comissoesParaFormulario = (
  comissoes: ComissoesUsuario
): ComissoesFormulario => ({
  vendasAVista: formatarPercentual(comissoes.vendasAVista),
  vendasAPrazo: formatarPercentual(comissoes.vendasAPrazo),
  vendasCartao: formatarPercentual(comissoes.vendasCartao),
  servicos: formatarPercentual(comissoes.servicos),
});

export const normalizarEmailComparacao = (email: string): string =>
  email.trim().toLowerCase();

export const emailJaUtilizado = (
  email: string,
  existentes: { id: number; email: string }[],
  ignorarId?: number
): boolean => {
  const alvo = normalizarEmailComparacao(email);
  if (!alvo) return false;
  return existentes.some(
    (usuario) =>
      usuario.id !== ignorarId && normalizarEmailComparacao(usuario.email) === alvo
  );
};

export const isValidEmail = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

export const parseComissao = (valor: string): number | null => {
  const trimmed = valor.trim();
  if (!trimmed) return null;
  const normalizado = trimmed.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(normalizado)) return null;
  const numero = parseFloat(normalizado);
  if (Number.isNaN(numero)) return null;
  return numero;
};

const validarComissao = (valor: string): string | undefined => {
  const trimmed = valor.trim();
  if (!trimmed) return 'Informe um valor';
  const normalizado = trimmed.replace(/\s/g, '').replace(',', '.');
  if (!/^\d+(\.\d*)?$/.test(normalizado)) return 'Valor inválido';
  const numero = parseFloat(normalizado);
  if (Number.isNaN(numero)) return 'Valor inválido';
  if (numero < 0) return 'Não pode ser negativo';
  if (numero > 100) return 'Não pode ser superior a 100';
  const decimais = normalizado.includes('.') ? normalizado.split('.')[1].length : 0;
  if (decimais > COMISSOES_CASAS_DECIMAIS) return `Máximo de ${COMISSOES_CASAS_DECIMAIS} casas decimais`;
  return undefined;
};

export const validarDadosGerais = (input: UsuarioFormInput): ValidationErrors => {
  const errors: ValidationErrors = {};

  const nome = input.nome.trim();
  if (!nome) {
    errors.nome = 'Nome é obrigatório';
  } else if (nome.length > LIMITE_NOME) {
    errors.nome = `Nome deve ter no máximo ${LIMITE_NOME} caracteres`;
  }

  if (!input.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!isValidEmail(input.email)) {
    errors.email = 'E-mail inválido';
  }

  if (!TIPOS_USUARIO.includes(input.tipo)) {
    errors.tipo = 'Tipo de usuário inválido';
  }

  if (!STATUS_USUARIO.includes(input.status)) {
    errors.status = 'Status inválido';
  }

  return errors;
};

export const validarComissoes = (input: UsuarioFormInput): ValidationErrors => {
  const errors: ValidationErrors = {};
  const campos: { chave: keyof ComissoesFormulario; campo: string }[] = [
    { chave: 'vendasAVista', campo: 'comissaoVendasAVista' },
    { chave: 'vendasAPrazo', campo: 'comissaoVendasAPrazo' },
    { chave: 'vendasCartao', campo: 'comissaoVendasCartao' },
    { chave: 'servicos', campo: 'comissaoServicos' },
  ];

  campos.forEach(({ chave, campo }) => {
    const erro = validarComissao(input.comissoes[chave]);
    if (erro) errors[campo] = erro;
  });

  return errors;
};

export const validarPermissoes = (_input: UsuarioFormInput): ValidationErrors => {
  return {};
};

export const validarUsuario = (input: UsuarioFormInput): ValidationErrors => ({
  ...validarDadosGerais(input),
  ...validarComissoes(input),
  ...validarPermissoes(input),
});

const normalizarPermissoes = (input: UsuarioFormInput): PermissoesModulo => {
  if (input.permissaoTotal) {
    return criarPermissoesTotais();
  }
  const base = criarPermissoesVazias();
  ABAS_PERMISSAO.forEach((aba) => {
    aba.modulos.forEach((modulo) => {
      const acoes = input.permissoes?.[aba.key]?.[modulo.key];
      if (!acoes) return;
      ACOES_PERMISSAO.forEach((acao) => {
        base[aba.key][modulo.key][acao] = Boolean(acoes[acao]);
      });
    });
  });
  return base;
};

const normalizarComissoes = (input: UsuarioFormInput): ComissoesUsuario => {
  const ler = (chave: keyof ComissoesFormulario): number => {
    const valor = parseComissao(input.comissoes[chave]);
    return valor === null ? 0 : valor;
  };
  return {
    vendasAVista: ler('vendasAVista'),
    vendasAPrazo: ler('vendasAPrazo'),
    vendasCartao: ler('vendasCartao'),
    servicos: ler('servicos'),
  };
};

export const buildUsuarioData = (input: UsuarioFormInput): UsuarioNormalizado => {
  const nome = input.nome.trim();
  const email = input.email.trim();

  const normalizado: UsuarioNormalizado = {
    id: input.id,
    codigo: input.codigo,
    nome,
    email,
    emailComparacao: normalizarEmailComparacao(email),
    tipo: input.tipo,
    status: input.status,
    comissoes: normalizarComissoes(input),
    permissaoTotal: input.permissaoTotal,
    permissoes: normalizarPermissoes(input),
  };

  const imagem = input.imagem?.trim();
  if (imagem && !imagem.startsWith('data:') && !imagem.startsWith('blob:')) {
    normalizado.imagem = imagem;
  }

  return normalizado;
};

export const prepareUsuario = (input: UsuarioFormInput): PrepareUsuarioResult => {
  const errors = validarUsuario(input);
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: buildUsuarioData(input),
  };
};
