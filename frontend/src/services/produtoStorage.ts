import type {
  DadosFiscaisProduto,
  HistoricoCompraProduto,
  Produto,
} from '../types';
import { FISCAL_PRODUTO_PADRAO, produtosData } from '../data/produtos';
import { listarFornecedores } from './fornecedorStorage';
import type { ProdutoNormalizado } from '../utils/produtoForm';
import {
  agoraIso,
  estoqueDisponivel,
  formatarNumero,
  precoVendaEfetivo,
  promocaoVigente,
} from '../utils/produtoForm';
import { obterUsuarioAtual, podeAjustarEstoqueProduto } from '../utils/produtoPermissoes';

/**
 * Persistência provisória do Módulo de Produtos em `localStorage`.
 *
 * O padrão segue o módulo de Fornecedores e o de Usuários:
 * - chave própria (`erp-produtos-registros`) e cópia de segurança
 *   (`erp-produtos-registros-backup`);
 * - estados de armazenamento distinguíveis (vazio, ok, inconsistente,
 *   corrompido, indisponível);
 * - gravação bloqueada quando o conteúdo não pode ser interpretado, para
 *   nunca sobrescrever dados corrompidos em silêncio;
 * - confirmação da gravação após a escrita.
 */

const STORAGE_KEY = 'erp-produtos-registros';
const BACKUP_KEY = 'erp-produtos-registros-backup';

type OuvinteProdutos = () => void;

const ouvintes = new Set<OuvinteProdutos>();

/** Registra um ouvinte avisado sempre que os registros de produtos mudam. */
export const assinarProdutos = (ouvinte: OuvinteProdutos): (() => void) => {
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
  registros: Produto[];
  bruto: string | null;
  totalEncontrado: number;
  invalidos: number;
  motivo?: string;
}

const ehNumero = (valor: unknown): valor is number =>
  typeof valor === 'number' && !Number.isNaN(valor);

const ehBooleano = (valor: unknown): valor is boolean => typeof valor === 'boolean';

const ehTexto = (valor: unknown): valor is string => typeof valor === 'string';

const ehObjeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === 'object' && valor !== null;

const ehDadosFiscais = (valor: unknown): valor is DadosFiscaisProduto => {
  if (!ehObjeto(valor)) return false;
  const camposTexto: (keyof DadosFiscaisProduto)[] = [
    'perfilTributacao',
    'origem',
    'cstContribuinte',
    'cstNaoContribuinte',
    'csosnContribuinte',
    'csosnNaoContribuinte',
    'cfopNfe',
    'cfopNfce',
    'ncm',
    'cest',
    'excecaoFiscal',
    'tributacaoContribuinte',
    'tributacaoNaoContribuinte',
    'cstIpi',
    'cstPis',
    'cstCofins',
    'cBenef',
    'unidadeTributavel',
    'informacoesAdicionais',
    'cstIbs',
    'classificacaoIbsCbs',
  ];
  const camposNumero: (keyof DadosFiscaisProduto)[] = [
    'taxaFcp',
    'aliquotaIcmsOrigem',
    'aliquotaIpi',
    'aliquotaPis',
    'aliquotaCofins',
    'fatorConversaoTributavel',
    'aliquotaIbs',
    'aliquotaCbs',
  ];
  return (
    camposTexto.every((campo) => ehTexto(valor[campo])) &&
    camposNumero.every((campo) => ehNumero(valor[campo]))
  );
};

const ehRegistroProduto = (valor: unknown): valor is Produto => {
  if (!ehObjeto(valor)) return false;
  const numericos: (keyof Produto)[] = [
    'id',
    'quantidade',
    'quantidadeAtacadoMaior',
    'quantidadeReservada',
    'quantidadeMinima',
    'preco',
    'precoAtacado',
    'custo',
    'custoMedio',
    'lucroBruto',
    'pesoBruto',
    'pesoLiquido',
  ];
  const booleanos: (keyof Produto)[] = [
    'favorito',
    'ativo',
    'grade',
    'controlesEspecificos',
    'ecommerceMarketplace',
    'composicao',
  ];
  const textos: (keyof Produto)[] = [
    'codigo',
    'descricao',
    'unidadeMedida',
    'grupo',
    'tipoProduto',
    'referencia',
    'codigoBarras',
    'observacoes',
    'dataCadastro',
  ];
  return (
    numericos.every((campo) => ehNumero(valor[campo])) &&
    booleanos.every((campo) => ehBooleano(valor[campo])) &&
    textos.every((campo) => ehTexto(valor[campo])) &&
    ehDadosFiscais(valor.fiscal)
  );
};

/**
 * Completa campos opcionais ausentes em registros gravados em versões
 * anteriores, preservando os dados existentes.
 */
const normalizarRegistro = (valor: unknown): Produto | null => {
  if (!ehRegistroProduto(valor)) return null;
  const registro = valor as Produto & {
    fornecedorPreferencialId?: unknown;
    fornecedorPreferencialNome?: unknown;
  };
  const normalizado: Produto = {
    ...registro,
    descricaoComplementar: ehTexto((registro as Produto).descricaoComplementar)
      ? (registro as Produto).descricaoComplementar
      : '',
    subcategoria: ehTexto((registro as Produto).subcategoria) ? (registro as Produto).subcategoria : '',
    marca: ehTexto((registro as Produto).marca) ? (registro as Produto).marca : '',
    modelo: ehTexto((registro as Produto).modelo) ? (registro as Produto).modelo : '',
    imagem: ehTexto((registro as Produto).imagem) ? (registro as Produto).imagem : '',
    precoPromocional: ehNumero((registro as Produto).precoPromocional)
      ? (registro as Produto).precoPromocional
      : 0,
    promocaoInicio: ehTexto((registro as Produto).promocaoInicio)
      ? (registro as Produto).promocaoInicio
      : '',
    promocaoFim: ehTexto((registro as Produto).promocaoFim)
      ? (registro as Produto).promocaoFim
      : '',
    margemDesejada: ehNumero((registro as Produto).margemDesejada)
      ? (registro as Produto).margemDesejada
      : 0,
    markup: ehNumero((registro as Produto).markup) ? (registro as Produto).markup : 0,
    precoMinimo: ehNumero((registro as Produto).precoMinimo) ? (registro as Produto).precoMinimo : 0,
    descontoMaximo: ehNumero((registro as Produto).descontoMaximo)
      ? (registro as Produto).descontoMaximo
      : 0,
    observacoesComerciais: ehTexto((registro as Produto).observacoesComerciais)
      ? (registro as Produto).observacoesComerciais
      : '',
    ultimoCustoAquisicao: ehNumero((registro as Produto).ultimoCustoAquisicao)
      ? (registro as Produto).ultimoCustoAquisicao
      : registro.custoMedio ?? registro.custo ?? 0,
    dataUltimaCompra: ehTexto((registro as Produto).dataUltimaCompra)
      ? (registro as Produto).dataUltimaCompra
      : '',
    controlarEstoque: ehBooleano((registro as Produto).controlarEstoque)
      ? (registro as Produto).controlarEstoque
      : true,
    estoqueMaximo: ehNumero((registro as Produto).estoqueMaximo)
      ? (registro as Produto).estoqueMaximo
      : 0,
    deposito: ehTexto((registro as Produto).deposito) ? (registro as Produto).deposito : '',
    corredor: ehTexto((registro as Produto).corredor) ? (registro as Produto).corredor : '',
    prateleira: ehTexto((registro as Produto).prateleira)
      ? (registro as Produto).prateleira
      : '',
    localizacao: ehTexto((registro as Produto).localizacao)
      ? (registro as Produto).localizacao
      : '',
    lote: ehTexto((registro as Produto).lote) ? (registro as Produto).lote : '',
    numeroSerie: ehTexto((registro as Produto).numeroSerie)
      ? (registro as Produto).numeroSerie
      : '',
    dataValidade: ehTexto((registro as Produto).dataValidade)
      ? (registro as Produto).dataValidade
      : '',
    comprimento: ehNumero((registro as Produto).comprimento) ? (registro as Produto).comprimento : 0,
    largura: ehNumero((registro as Produto).largura) ? (registro as Produto).largura : 0,
    altura: ehNumero((registro as Produto).altura) ? (registro as Produto).altura : 0,
    quantidadeEmbalagem: ehNumero((registro as Produto).quantidadeEmbalagem)
      ? (registro as Produto).quantidadeEmbalagem
      : 1,
    venderFracionado: ehBooleano((registro as Produto).venderFracionado)
      ? (registro as Produto).venderFracionado
      : false,
    permitirEstoqueNegativo: ehBooleano((registro as Produto).permitirEstoqueNegativo)
      ? (registro as Produto).permitirEstoqueNegativo
      : false,
    fornecedoresSecundarios: Array.isArray((registro as Produto).fornecedoresSecundarios)
      ? ((registro as Produto).fornecedoresSecundarios as unknown[]).filter(
          (v): v is number => ehNumero(v)
        )
      : [],
    codigoFornecedor: ehTexto((registro as Produto).codigoFornecedor)
      ? (registro as Produto).codigoFornecedor
      : '',
    unidadeCompra: ehTexto((registro as Produto).unidadeCompra)
      ? ((registro as Produto).unidadeCompra as Produto['unidadeCompra'])
      : registro.unidadeMedida,
    unidadeVenda: ehTexto((registro as Produto).unidadeVenda)
      ? ((registro as Produto).unidadeVenda as Produto['unidadeVenda'])
      : registro.unidadeMedida,
    fatorConversaoCompra: ehNumero((registro as Produto).fatorConversaoCompra)
      ? (registro as Produto).fatorConversaoCompra
      : 1,
    quantidadeMinimaCompra: ehNumero((registro as Produto).quantidadeMinimaCompra)
      ? (registro as Produto).quantidadeMinimaCompra
      : 0,
    prazoEntregaDias: ehNumero((registro as Produto).prazoEntregaDias)
      ? (registro as Produto).prazoEntregaDias
      : 0,
    historicoCompras: Array.isArray((registro as Produto).historicoCompras)
      ? (registro as Produto).historicoCompras
      : [],
    ultimaQuantidadeComprada: ehNumero((registro as Produto).ultimaQuantidadeComprada)
      ? (registro as Produto).ultimaQuantidadeComprada
      : 0,
    permitirVenda: ehBooleano((registro as Produto).permitirVenda)
      ? (registro as Produto).permitirVenda
      : true,
    permitirCompra: ehBooleano((registro as Produto).permitirCompra)
      ? (registro as Produto).permitirCompra
      : true,
    exibirPdv: ehBooleano((registro as Produto).exibirPdv) ? (registro as Produto).exibirPdv : true,
    permiteDesconto: ehBooleano((registro as Produto).permiteDesconto)
      ? (registro as Produto).permiteDesconto
      : true,
    exigeAutorizacaoDesconto: ehBooleano((registro as Produto).exigeAutorizacaoDesconto)
      ? (registro as Produto).exigeAutorizacaoDesconto
      : false,
    pesavel: ehBooleano((registro as Produto).pesavel) ? (registro as Produto).pesavel : false,
    comissao: ehNumero((registro as Produto).comissao) ? (registro as Produto).comissao : 0,
    ehKit: ehBooleano((registro as Produto).ehKit) ? (registro as Produto).ehKit : false,
    componentes: Array.isArray((registro as Produto).componentes)
      ? (registro as Produto).componentes
      : [],
    observacoesVendedor: ehTexto((registro as Produto).observacoesVendedor)
      ? (registro as Produto).observacoesVendedor
      : '',
    produtosSimilares: Array.isArray((registro as Produto).produtosSimilares)
      ? ((registro as Produto).produtosSimilares as unknown[]).filter(
          (v): v is number => ehNumero(v)
        )
      : [],
    criadoEm: ehTexto((registro as Produto).criadoEm) ? (registro as Produto).criadoEm : '',
    criadoPor: ehTexto((registro as Produto).criadoPor) ? (registro as Produto).criadoPor : '',
    atualizadoEm: ehTexto((registro as Produto).atualizadoEm)
      ? (registro as Produto).atualizadoEm
      : '',
    atualizadoPor: ehTexto((registro as Produto).atualizadoPor)
      ? (registro as Produto).atualizadoPor
      : '',
    motivoInativacao: ehTexto((registro as Produto).motivoInativacao)
      ? (registro as Produto).motivoInativacao
      : '',
    historicoAlteracoes: Array.isArray((registro as Produto).historicoAlteracoes)
      ? (registro as Produto).historicoAlteracoes
      : [],
    dadosVeiculo: ehObjeto((registro as Produto).dadosVeiculo)
      ? (registro as Produto).dadosVeiculo
      : undefined,
    fornecedorPreferencialNome: ehTexto(registro.fornecedorPreferencialNome)
      ? registro.fornecedorPreferencialNome
      : '',
    fiscal: { ...FISCAL_PRODUTO_PADRAO, ...(ehObjeto(registro.fiscal) ? registro.fiscal : {}) },
  };
  if (ehNumero(registro.fornecedorPreferencialId)) {
    normalizado.fornecedorPreferencialId = registro.fornecedorPreferencialId;
  }
  return normalizado;
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
      motivo: 'A estrutura armazenada não é uma lista de produtos.',
    };
  }

  const registros = parsed.map(normalizarRegistro).filter((r): r is Produto => r !== null);
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
        'Os dados de produtos armazenados estão corrompidos e não puderam ser interpretados. ' +
        'Para evitar perda, nada foi gravado.'
      );
    case 'inconsistente':
      return (
        `Há ${estado.invalidos} registro(s) inválido(s) no armazenamento local. ` +
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

const lerRegistros = (): Produto[] => {
  const estado = lerEstado();
  return estado.situacao === 'ok' || estado.situacao === 'inconsistente'
    ? estado.registros
    : [];
};

const gravarRegistros = (registros: Produto[]): ResultadoArmazenamento => {
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
      error:
        'Não foi possível criar a cópia de segurança dos dados atuais. A gravação foi cancelada.',
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

const montarRegistro = (
  dados: ProdutoNormalizado,
  nomeFornecedor?: string
): Produto => {
  const registro: Produto = {
    ...dados,
    fiscal: { ...dados.fiscal },
    fornecedoresSecundarios: [...(dados.fornecedoresSecundarios ?? [])],
    historicoCompras: [...(dados.historicoCompras ?? [])],
    componentes: [...(dados.componentes ?? [])],
    produtosSimilares: [...(dados.produtosSimilares ?? [])],
    historicoAlteracoes: [...(dados.historicoAlteracoes ?? [])],
    dadosVeiculo: dados.dadosVeiculo ? { ...dados.dadosVeiculo } : undefined,
  };
  if (nomeFornecedor) {
    registro.fornecedorPreferencialNome = nomeFornecedor;
  } else if (dados.fornecedorPreferencialId !== undefined) {
    registro.fornecedorPreferencialId = dados.fornecedorPreferencialId;
  }
  return registro;
};

/** Retorna o estado atual do armazenamento de produtos. */
export const verificarArmazenamentoProdutos = (): EstadoArmazenamento => lerEstado();

/** Lista consolidada: dados de demonstração + registros gravados no navegador. */
export const listarProdutos = (): Produto[] => {
  const consolidados: Produto[] = produtosData.map((produto) => normalizarRegistro(produto) ?? produto);
  for (const registro of lerRegistros()) {
    const normalizado = normalizarRegistro(registro);
    if (!normalizado) continue;
    const indice = consolidados.findIndex((produto) => produto.id === normalizado.id);
    if (indice >= 0) consolidados[indice] = normalizado;
    else consolidados.push(normalizado);
  }
  return consolidados;
};

export const buscarProdutoPorId = (id: number): Produto | undefined =>
  listarProdutos().find((produto) => produto.id === id);

export const existeProdutoId = (id: number): boolean =>
  listarProdutos().some((produto) => produto.id === id);

/** Nome do fornecedor preferencial a partir da lista consolidada de fornecedores. */
const nomeFornecedor = (id: number | undefined): string | undefined => {
  if (id === undefined) return undefined;
  const fornecedor = listarFornecedores().find((item) => item.id === id);
  return fornecedor?.razaoSocial;
};

/**
 * Cadastra um novo produto.
 * Antes de gravar: valida a integridade do armazenamento, confere a
 * duplicidade de ID e de fornecedor preferencial, cria a cópia de segurança,
 * grava e confirma a persistência.
 */
export const cadastrarProduto = (dados: ProdutoNormalizado): ResultadoArmazenamento => {
  const preparado = prepararEscrita();
  if (preparado.error) return { success: false, error: preparado.error };
  const estado = preparado.estado;

  if (existeProdutoId(dados.id)) {
    return { success: false, error: `Já existe um produto com o ID ${dados.id}.` };
  }

  const codigoNormalizado = dados.codigo.trim().toLowerCase();
  if (
    codigoNormalizado &&
    listarProdutos().some(
      (produto) => produto.codigo.trim().toLowerCase() === codigoNormalizado
    )
  ) {
    return { success: false, error: `Já existe um produto com o código ${dados.codigo}.` };
  }

  if (dados.fornecedorPreferencialId !== undefined) {
    const fornecedor = listarFornecedores().find(
      (item) => item.id === dados.fornecedorPreferencialId
    );
    if (!fornecedor) {
      return {
        success: false,
        error: 'O fornecedor preferencial informado não existe no cadastro de fornecedores.',
      };
    }
  }

  const novosRegistros = [...estado.registros, montarRegistro(dados, nomeFornecedor(dados.fornecedorPreferencialId))];

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

/**
 * Atualiza um produto existente preservando ID, código, data de cadastro e
 * demais campos não alterados.
 */
export const atualizarProduto = (dados: ProdutoNormalizado): ResultadoArmazenamento => {
  const preparado = prepararEscrita();
  if (preparado.error) return { success: false, error: preparado.error };
  const estado = preparado.estado;

  const existente = buscarProdutoPorId(dados.id);
  if (!existente) {
    return {
      success: false,
      error: `Produto com ID ${dados.id} não encontrado. Registros inexistentes não são criados na edição.`,
    };
  }

  if (dados.fornecedorPreferencialId !== undefined) {
    const fornecedor = listarFornecedores().find(
      (item) => item.id === dados.fornecedorPreferencialId
    );
    if (!fornecedor) {
      return {
        success: false,
        error: 'O fornecedor preferencial informado não existe no cadastro de fornecedores.',
      };
    }
  }

  const nomeVinculado =
    nomeFornecedor(dados.fornecedorPreferencialId) ??
    (dados.fornecedorPreferencialId === existente.fornecedorPreferencialId
      ? existente.fornecedorPreferencialNome
      : undefined);

  const atualizado = montarRegistro(
    {
      ...dados,
      codigo: existente.codigo,
      dataCadastro: existente.dataCadastro,
      criadoEm: existente.criadoEm || dados.criadoEm,
      criadoPor: existente.criadoPor || dados.criadoPor,
      historicoCompras: existente.historicoCompras ?? dados.historicoCompras,
      quantidade: existente.quantidade,
      quantidadeReservada: existente.quantidadeReservada,
    },
    nomeVinculado
  );

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

/**
 * Ativa ou inativa um produto alterando exclusivamente o campo `ativo`.
 * Preços, quantidades e dados fiscais são preservados integralmente.
 */
export const alterarStatusProduto = (
  id: number,
  ativo: boolean,
  motivo?: string
): ResultadoArmazenamento => {
  const preparado = prepararEscrita();
  if (preparado.error) return { success: false, error: preparado.error };
  const estado = preparado.estado;

  const existente = buscarProdutoPorId(id);
  if (!existente) {
    return { success: false, error: `Produto com ID ${id} não encontrado.` };
  }

  const usuario = obterUsuarioAtual()?.nome ?? 'Sistema';
  const agora = agoraIso();
  const historico = [...(existente.historicoAlteracoes ?? [])];
  historico.push({
    id: historico.reduce((m, h) => Math.max(m, h.id), 0) + 1,
    data: agora,
    usuario,
    campo: 'Status',
    valorAnterior: existente.ativo ? 'Ativo' : 'Inativo',
    valorNovo: ativo ? 'Ativo' : 'Inativo',
    ...(motivo ? { motivo } : {}),
  });

  const atualizado: Produto = {
    ...existente,
    ativo,
    motivoInativacao: ativo ? '' : motivo ?? existente.motivoInativacao,
    atualizadoEm: agora,
    atualizadoPor: usuario,
    historicoAlteracoes: historico,
  };

  const indiceNoEstado = estado.registros.findIndex((registro) => registro.id === id);
  const novosRegistros =
    indiceNoEstado >= 0
      ? estado.registros.map((registro, i) => (i === indiceNoEstado ? atualizado : registro))
      : [...estado.registros, atualizado];

  const backup = criarBackup(estado);
  if (!backup.success) return backup;

  const gravacao = gravarRegistros(novosRegistros);
  if (!gravacao.success) return gravacao;

  if (!confirmarGravacao(id, novosRegistros.length)) {
    return {
      success: false,
      error: 'A gravação não pôde ser confirmada no armazenamento local.',
    };
  }
  notificarAlteracao();
  return { success: true };
};

/** Duplica um produto com novo ID, preservando dados e limpando vínculos únicos. */
export const duplicarProduto = (
  origemId: number,
  novoId: number
): Produto | ResultadoArmazenamento => {
  const preparado = prepararEscrita();
  if (preparado.error) return { success: false, error: preparado.error };
  const estado = preparado.estado;

  const origem = buscarProdutoPorId(origemId);
  if (!origem) {
    return { success: false, error: `Produto com ID ${origemId} não encontrado.` };
  }
  if (existeProdutoId(novoId)) {
    return { success: false, error: `Já existe um produto com o ID ${novoId}.` };
  }

  const usuario = obterUsuarioAtual()?.nome ?? 'Sistema';
  const agora = agoraIso();
  const duplicado: Produto = {
    ...origem,
    id: novoId,
    codigo: String(novoId).padStart(4, '0'),
    descricao: `${origem.descricao} (Cópia)`,
    codigoBarras: '',
    quantidade: 0,
    quantidadeReservada: 0,
    fornecedorPreferencialId: undefined,
    fornecedorPreferencialNome: '',
    fornecedoresSecundarios: [],
    historicoCompras: [],
    componentes: origem.componentes.map((c) => ({ ...c })),
    produtosSimilares: [],
    historicoAlteracoes: [],
    criadoEm: agora,
    criadoPor: usuario,
    atualizadoEm: agora,
    atualizadoPor: usuario,
    motivoInativacao: '',
  };

  const novosRegistros = [...estado.registros, montarRegistro(duplicado, undefined)];
  const backup = criarBackup(estado);
  if (!backup.success) return backup;

  const gravacao = gravarRegistros(novosRegistros);
  if (!gravacao.success) return gravacao;

  if (!confirmarGravacao(novoId, novosRegistros.length)) {
    return {
      success: false,
      error: 'A gravação não pôde ser confirmada no armazenamento local.',
    };
  }
  notificarAlteracao();
  return duplicado;
};

export interface AjusteEstoque {
  id: number;
  quantidadeAnterior: number;
  quantidadeNova: number;
  motivo: string;
  data: string;
  usuario: string;
}

/** Ajuste de estoque por operação específica, com autorização e histórico. */
export const ajustarEstoqueProduto = (
  id: number,
  quantidadeNova: number,
  motivo: string
): ResultadoArmazenamento => {
  if (!podeAjustarEstoqueProduto()) {
    return { success: false, error: 'Sem permissão para realizar ajustes de estoque.' };
  }
  if (!(quantidadeNova >= 0)) {
    return { success: false, error: 'A quantidade não pode ser negativa.' };
  }
  if (!motivo.trim()) {
    return { success: false, error: 'Informe o motivo do ajuste.' };
  }

  const preparado = prepararEscrita();
  if (preparado.error) return { success: false, error: preparado.error };
  const estado = preparado.estado;

  const existente = buscarProdutoPorId(id);
  if (!existente) {
    return { success: false, error: `Produto com ID ${id} não encontrado.` };
  }

  const usuario = obterUsuarioAtual()?.nome ?? 'Sistema';
  const agora = agoraIso();
  const historico = [...(existente.historicoAlteracoes ?? [])];
  historico.push({
    id: historico.reduce((m, h) => Math.max(m, h.id), 0) + 1,
    data: agora,
    usuario,
    campo: 'Estoque (ajuste)',
    valorAnterior: formatarNumero(existente.quantidade, 3),
    valorNovo: formatarNumero(quantidadeNova, 3),
    motivo: motivo.trim(),
  });

  const atualizado: Produto = {
    ...existente,
    quantidade: quantidadeNova,
    atualizadoEm: agora,
    atualizadoPor: usuario,
    historicoAlteracoes: historico,
  };

  const indiceNoEstado = estado.registros.findIndex((registro) => registro.id === id);
  const novosRegistros =
    indiceNoEstado >= 0
      ? estado.registros.map((registro, i) => (i === indiceNoEstado ? atualizado : registro))
      : [...estado.registros, atualizado];

  const backup = criarBackup(estado);
  if (!backup.success) return backup;

  const gravacao = gravarRegistros(novosRegistros);
  if (!gravacao.success) return gravacao;

  if (!confirmarGravacao(id, novosRegistros.length)) {
    return {
      success: false,
      error: 'A gravação não pôde ser confirmada no armazenamento local.',
    };
  }
  notificarAlteracao();
  return { success: true };
};

/** Relatório simples para listagem/integração com PDV. */
export const obterResumoProdutoPdv = (produto: Produto) => ({
  id: produto.id,
  codigo: produto.codigo,
  descricao: produto.descricao,
  codigoBarras: produto.codigoBarras,
  preco: precoVendaEfetivo(produto),
  precoOriginal: produto.preco,
  promocaoVigente: promocaoVigente(produto),
  ativo: produto.ativo && produto.permitirVenda && !produto.ehKit,
  controlarEstoque: produto.controlarEstoque,
  quantidade: produto.quantidade,
  disponivel: estoqueDisponivel(produto),
  permitirVendaFracionada: produto.venderFracionado,
  pesavel: produto.pesavel,
  unidade: produto.unidadeMedida,
  exigeAutorizacaoDesconto: produto.exigeAutorizacaoDesconto,
  descontoMaximo: produto.descontoMaximo,
  precoMinimo: produto.precoMinimo,
});

/** Atualiza histórico de compras a partir de movimentações (uso futuro). */
export const registrarCompraProduto = (
  produtoId: number,
  compra: Omit<HistoricoCompraProduto, 'id'>
): ResultadoArmazenamento => {
  const preparado = prepararEscrita();
  if (preparado.error) return { success: false, error: preparado.error };
  const estado = preparado.estado;

  const existente = buscarProdutoPorId(produtoId);
  if (!existente) {
    return { success: false, error: `Produto com ID ${produtoId} não encontrado.` };
  }

  const historico = [...(existente.historicoCompras ?? [])];
  const novoId = historico.reduce((m, h) => Math.max(m, h.id), 0) + 1;
  historico.unshift({ ...compra, id: novoId });

  const atualizado: Produto = {
    ...existente,
    historicoCompras: historico,
    ultimoCustoAquisicao: compra.custoUnitario,
    dataUltimaCompra: compra.data,
    ultimaQuantidadeComprada: compra.quantidade,
  };

  const indiceNoEstado = estado.registros.findIndex((registro) => registro.id === produtoId);
  const novosRegistros =
    indiceNoEstado >= 0
      ? estado.registros.map((registro, i) => (i === indiceNoEstado ? atualizado : registro))
      : [...estado.registros, atualizado];

  const backup = criarBackup(estado);
  if (!backup.success) return backup;

  const gravacao = gravarRegistros(novosRegistros);
  if (!gravacao.success) return gravacao;

  if (!confirmarGravacao(produtoId, novosRegistros.length)) {
    return {
      success: false,
      error: 'A gravação não pôde ser confirmada no armazenamento local.',
    };
  }
  notificarAlteracao();
  return { success: true };
};
