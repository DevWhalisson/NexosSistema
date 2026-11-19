import type { Fornecedor } from '../types';
import { fornecedoresData } from '../data/fornecedores';
import type { FornecedorNormalizado } from '../utils/fornecedorForm';

const STORAGE_KEY = 'erp-fornecedores-registros';
const BACKUP_KEY = 'erp-fornecedores-registros-backup';
const CATEGORIA_PADRAO = 'Não categorizado';

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
  registros: Fornecedor[];
  bruto: string | null;
  totalEncontrado: number;
  invalidos: number;
  motivo?: string;
}

const isRegistroFornecedor = (value: unknown): value is Fornecedor => {
  if (typeof value !== 'object' || value === null) return false;
  const registro = value as Record<string, unknown>;
  return (
    typeof registro.id === 'number' &&
    !Number.isNaN(registro.id) &&
    typeof registro.codigo === 'string' &&
    (registro.tipo === 'PF' || registro.tipo === 'PJ') &&
    typeof registro.razaoSocial === 'string' &&
    typeof registro.cpfCnpj === 'string' &&
    (registro.status === 'Ativo' ||
      registro.status === 'Inativo' ||
      registro.status === 'Bloqueado') &&
    typeof registro.categoria === 'string' &&
    typeof registro.dataCadastro === 'string'
  );
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
      motivo: 'A estrutura armazenada não é uma lista de fornecedores.',
    };
  }

  const registros = parsed.filter(isRegistroFornecedor);
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

const lerRegistros = (): Fornecedor[] => {
  const estado = lerEstado();
  return estado.situacao === 'ok' || estado.situacao === 'inconsistente'
    ? estado.registros
    : [];
};

const gravarRegistros = (registros: Fornecedor[]): ResultadoArmazenamento => {
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

const formatarDataCadastro = (): string => {
  const agora = new Date();
  const dia = String(agora.getDate()).padStart(2, '0');
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${agora.getFullYear()}`;
};

const montarRegistro = (dados: FornecedorNormalizado, existente?: Fornecedor): Fornecedor => ({
  ...(existente ?? {}),
  ...dados,
  categoria: existente?.categoria ?? CATEGORIA_PADRAO,
  dataCadastro: existente?.dataCadastro ?? formatarDataCadastro(),
});

export const verificarArmazenamentoFornecedores = (): EstadoArmazenamento => lerEstado();

export const listarFornecedores = (): Fornecedor[] => {
  const consolidados: Fornecedor[] = fornecedoresData.map((fornecedor) => ({ ...fornecedor }));
  for (const registro of lerRegistros()) {
    const indice = consolidados.findIndex((fornecedor) => fornecedor.id === registro.id);
    if (indice >= 0) consolidados[indice] = registro;
    else consolidados.push(registro);
  }
  return consolidados;
};

export const buscarFornecedorPorId = (id: number): Fornecedor | undefined =>
  listarFornecedores().find((fornecedor) => fornecedor.id === id);

export const existeFornecedorId = (id: number): boolean =>
  listarFornecedores().some((fornecedor) => fornecedor.id === id);

export const cadastrarFornecedor = (dados: FornecedorNormalizado): ResultadoArmazenamento => {
  const preparado = prepararEscrita();
  if (preparado.error) return { success: false, error: preparado.error };
  const estado = preparado.estado;

  if (existeFornecedorId(dados.id)) {
    return { success: false, error: `Já existe um fornecedor com o ID ${dados.id}.` };
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
  return { success: true };
};

export const atualizarFornecedor = (dados: FornecedorNormalizado): ResultadoArmazenamento => {
  const preparado = prepararEscrita();
  if (preparado.error) return { success: false, error: preparado.error };
  const estado = preparado.estado;

  const existente = buscarFornecedorPorId(dados.id);
  if (!existente) {
    return {
      success: false,
      error: `Fornecedor com ID ${dados.id} não encontrado. Registros inexistentes não são criados na edição.`,
    };
  }

  const atualizado = montarRegistro(dados, existente);
  const indice = estado.registros.findIndex((registro) => registro.id === dados.id);
  const novosRegistros =
    indice >= 0
      ? estado.registros.map((registro, i) => (i === indice ? atualizado : registro))
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
  return { success: true };
};
