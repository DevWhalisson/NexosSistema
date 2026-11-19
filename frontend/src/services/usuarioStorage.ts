import type { ComissoesUsuario, Usuario } from '../types';
import { usuariosData } from '../data/usuarios';
import type { UsuarioNormalizado } from '../utils/usuarioForm';
import {
  normalizarEmailComparacao,
  normalizarPermissoesArmazenadas,
} from '../utils/usuarioForm';

const STORAGE_KEY = 'erp-usuarios-registros';
const BACKUP_KEY = 'erp-usuarios-registros-backup';

type OuvinteUsuarios = () => void;

const ouvintes = new Set<OuvinteUsuarios>();

/**
 * Registra um ouvinte avisado sempre que os registros de usuários mudam.
 * Usado pela Consulta de Usuários para se atualizar automaticamente.
 */
export const assinarUsuarios = (ouvinte: OuvinteUsuarios): (() => void) => {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
};

const notificarAlteracao = (): void => {
  ouvintes.forEach((ouvinte) => {
    try {
      ouvinte();
    } catch {
      return;
    }
  });
};

export interface ResultadoArmazenamento {
  success: boolean;
  error?: string;
}

export type SituacaoArmazenamento =
  | 'vazio'
  | 'ok'
  | 'inconsistente'
  | 'corrompido'
  | 'indisponivel';

export interface EstadoArmazenamento {
  situacao: SituacaoArmazenamento;
  registros: Usuario[];
  bruto: string | null;
  totalEncontrado: number;
  invalidos: number;
  motivo?: string;
}

const isComissoesUsuario = (value: unknown): value is ComissoesUsuario => {
  if (typeof value !== 'object' || value === null) return false;
  const comissoes = value as Record<string, unknown>;
  const campos: (keyof ComissoesUsuario)[] = [
    'vendasAVista',
    'vendasAPrazo',
    'vendasCartao',
    'servicos',
  ];
  return campos.every(
    (campo) => typeof comissoes[campo] === 'number' && !Number.isNaN(comissoes[campo])
  );
};

const isRegistroUsuario = (value: unknown): value is Usuario => {
  if (typeof value !== 'object' || value === null) return false;
  const registro = value as Record<string, unknown>;
  return (
    typeof registro.id === 'number' &&
    !Number.isNaN(registro.id) &&
    typeof registro.codigo === 'string' &&
    typeof registro.nome === 'string' &&
    typeof registro.email === 'string' &&
    (registro.tipo === 'Usuario' || registro.tipo === 'Administrador') &&
    (registro.status === 'Ativo' || registro.status === 'Inativo') &&
    (registro.imagem === undefined || typeof registro.imagem === 'string') &&
    isComissoesUsuario(registro.comissoes) &&
    typeof registro.permissaoTotal === 'boolean'
  );
};

/**
 * Converte um registro gravado no formato legado para o formato atual de
 * permissões (aba → módulo → ações). Registros sem formato reconhecível são
 * descartados, preservando a sinalização de armazenamento inconsistente.
 */
const normalizarRegistro = (value: unknown): Usuario | null => {
  if (!isRegistroUsuario(value)) return null;
  const permissoes = normalizarPermissoesArmazenadas(value.permissoes);
  if (!permissoes) return null;
  return { ...value, permissoes };
};

const analisarConteudo = (bruto: string | null): EstadoArmazenamento => {
  if (bruto === null || bruto === '') {
    return {
      situacao: 'vazio',
      registros: [],
      bruto: null,
      totalEncontrado: 0,
      invalidos: 0,
      motivo: 'Nenhum registro salvo anteriormente.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(bruto);
  } catch {
    return {
      situacao: 'corrompido',
      registros: [],
      bruto,
      totalEncontrado: 0,
      invalidos: 0,
      motivo: 'O conteúdo armazenado não é um JSON válido.',
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      situacao: 'corrompido',
      registros: [],
      bruto,
      totalEncontrado: 0,
      invalidos: 0,
      motivo: 'A estrutura armazenada não é uma lista de usuários.',
    };
  }

  const registros = parsed.map(normalizarRegistro).filter((r): r is Usuario => r !== null);
  const invalidos = parsed.length - registros.length;

  if (invalidos > 0) {
    return {
      situacao: 'inconsistente',
      registros,
      bruto,
      totalEncontrado: parsed.length,
      invalidos,
      motivo: `${invalidos} de ${parsed.length} registro(s) não correspondem ao formato esperado.`,
    };
  }

  return {
    situacao: 'ok',
    registros,
    bruto,
    totalEncontrado: parsed.length,
    invalidos: 0,
  };
};

const lerEstado = (): EstadoArmazenamento => {
  try {
    return analisarConteudo(localStorage.getItem(STORAGE_KEY));
  } catch {
    return {
      situacao: 'indisponivel',
      registros: [],
      bruto: null,
      totalEncontrado: 0,
      invalidos: 0,
      motivo: 'Falha de acesso ao armazenamento local.',
    };
  }
};

const mensagemParaSituacao = (estado: EstadoArmazenamento): string | undefined => {
  switch (estado.situacao) {
    case 'vazio':
    case 'ok':
      return undefined;
    case 'indisponivel':
      return 'Não foi possível acessar o armazenamento local. Nada foi gravado.';
    case 'corrompido':
      return (
        'Os dados armazenados estão corrompidos e não puderam ser interpretados. ' +
        'Para evitar perda, nada foi gravado.'
      );
    case 'inconsistente':
      return (
        `Há ${estado.invalidos} registro(s) inválidos no armazenamento local. ` +
        'Para evitar perda, nada foi gravado.'
      );
  }
};

const mensagemDeErroGravacao = (erro: unknown): string => {
  const nome = erro instanceof Error ? erro.name : '';
  if (nome === 'QuotaExceededError' || nome === 'NS_ERROR_DOM_QUOTA_REACHED') {
    return 'O espaço do armazenamento local está esgotado. Nada foi gravado.';
  }
  return 'Não foi possível gravar os dados no armazenamento local.';
};

const lerRegistros = (): Usuario[] => {
  const estado = lerEstado();
  return estado.situacao === 'ok' || estado.situacao === 'inconsistente'
    ? estado.registros
    : [];
};

const gravarRegistros = (registros: Usuario[]): ResultadoArmazenamento => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
  } catch (erro) {
    return { success: false, error: mensagemDeErroGravacao(erro) };
  }
  return { success: true };
};

const criarBackup = (estado: EstadoArmazenamento): ResultadoArmazenamento => {
  if (!estado.bruto || estado.registros.length === 0) {
    return { success: true };
  }

  try {
    localStorage.setItem(BACKUP_KEY, estado.bruto);
  } catch {
    return {
      success: false,
      error: 'Não foi possível criar a cópia de segurança dos dados atuais. A gravação foi cancelada.',
    };
  }

  try {
    const lido = localStorage.getItem(BACKUP_KEY);
    const conferencia = analisarConteudo(lido);
    if (conferencia.situacao !== 'ok' || conferencia.registros.length !== estado.registros.length) {
      return {
        success: false,
        error: 'A cópia de segurança não pôde ser confirmada. A gravação foi cancelada.',
      };
    }
  } catch {
    return {
      success: false,
      error: 'A cópia de segurança não pôde ser confirmada. A gravação foi cancelada.',
    };
  }

  return { success: true };
};

const prepararEscrita = (): { estado: EstadoArmazenamento; error?: string } => {
  const estado = lerEstado();
  return { estado, error: mensagemParaSituacao(estado) };
};

const confirmarGravacao = (id: number, tamanhoEsperado: number): boolean => {
  const estado = lerEstado();
  if (estado.situacao !== 'ok') return false;
  return (
    estado.registros.length === tamanhoEsperado &&
    estado.registros.some((registro) => registro.id === id)
  );
};

const montarRegistro = (dados: UsuarioNormalizado, existente?: Usuario): Usuario => {
  const registro: Usuario = {
    id: dados.id,
    codigo: dados.codigo,
    nome: dados.nome,
    email: dados.email,
    tipo: dados.tipo,
    status: dados.status,
    comissoes: dados.comissoes,
    permissaoTotal: dados.permissaoTotal,
    permissoes: dados.permissoes,
  };

  const imagem = (dados.imagem ?? existente?.imagem)?.trim();
  if (imagem) registro.imagem = imagem;

  return registro;
};

export const verificarArmazenamentoUsuarios = (): EstadoArmazenamento => lerEstado();

export const listarUsuarios = (): Usuario[] => {
  const consolidados: Usuario[] = usuariosData.map((usuario) => ({ ...usuario }));
  for (const registro of lerRegistros()) {
    const indice = consolidados.findIndex((usuario) => usuario.id === registro.id);
    if (indice >= 0) consolidados[indice] = registro;
    else consolidados.push(registro);
  }
  return consolidados;
};

export const buscarUsuarioPorId = (id: number): Usuario | undefined =>
  listarUsuarios().find((usuario) => usuario.id === id);

export const existeUsuarioId = (id: number): boolean =>
  listarUsuarios().some((usuario) => usuario.id === id);

export const existeUsuarioEmail = (email: string, ignorarId?: number): boolean => {
  const alvo = normalizarEmailComparacao(email);
  return listarUsuarios().some(
    (usuario) =>
      usuario.id !== ignorarId && normalizarEmailComparacao(usuario.email) === alvo
  );
};

export const cadastrarUsuario = (dados: UsuarioNormalizado): ResultadoArmazenamento => {
  const preparado = prepararEscrita();
  if (preparado.error) return { success: false, error: preparado.error };
  const estado = preparado.estado;

  if (existeUsuarioId(dados.id)) {
    return { success: false, error: `Já existe um usuário com o ID ${dados.id}.` };
  }

  if (existeUsuarioEmail(dados.email)) {
    return { success: false, error: 'Já existe um usuário com este e-mail.' };
  }

  const novosRegistros = [...estado.registros, montarRegistro(dados)];

  const backup = criarBackup(estado);
  if (!backup.success) return backup;

  const gravacao = gravarRegistros(novosRegistros);
  if (!gravacao.success) return gravacao;

  if (!confirmarGravacao(dados.id, novosRegistros.length)) {
    return {
      success: false,
      error: 'A gravação não pôde ser confirmada no armazenamento local.',
    };
  }
  notificarAlteracao();
  return { success: true };
};

export const atualizarUsuario = (dados: UsuarioNormalizado): ResultadoArmazenamento => {
  const preparado = prepararEscrita();
  if (preparado.error) return { success: false, error: preparado.error };
  const estado = preparado.estado;

  const existente = buscarUsuarioPorId(dados.id);
  if (!existente) {
    return {
      success: false,
      error: `Usuário com ID ${dados.id} não encontrado. Registros inexistentes não são criados na edição.`,
    };
  }

  if (existeUsuarioEmail(dados.email, dados.id)) {
    return { success: false, error: 'Já existe um usuário com este e-mail.' };
  }

  const atualizado = montarRegistro(dados, existente);
  const indiceNoEstado = estado.registros.findIndex((registro) => registro.id === dados.id);
  const novosRegistros =
    indiceNoEstado >= 0
      ? estado.registros.map((registro, i) => (i === indiceNoEstado ? atualizado : registro))
      : [...estado.registros, atualizado];

  const backup = criarBackup(estado);
  if (!backup.success) return backup;

  const gravacao = gravarRegistros(novosRegistros);
  if (!gravacao.success) return gravacao;

  if (!confirmarGravacao(dados.id, novosRegistros.length)) {
    return {
      success: false,
      error: 'A gravação não pôde ser confirmada no armazenamento local.',
    };
  }
  notificarAlteracao();
  return { success: true };
};
