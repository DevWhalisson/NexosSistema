import type {
  CodigoUnidadeMedida,
  ComponenteProduto,
  DadosFiscaisProduto,
  DadosVeiculo,
  HistoricoAlteracaoProduto,
  OpcaoCatalogo,
  Produto,
} from '../types';
import { DADOS_VEICULO_PADRAO, FISCAL_PRODUTO_PADRAO } from '../data/produtos';
import { PERFIS_SIMPLES_NACIONAL } from '../data/produtosFiscal';
import { formatarCodigoProduto } from './produtoId';
import { obterUsuarioAtual } from './produtoPermissoes';

/**
 * Regras de formulário do Módulo de Produtos.
 *
 * Este módulo concentra o modelo de entrada, a normalização, a validação, os
 * cálculos comerciais e a preparação do objeto gravado. As funções são puras
 * e tipadas: nenhuma delas acessa o armazenamento local nem depende de React.
 */

export const LIMITE_DESCRICAO = 200;
export const LIMITE_DESCRICAO_COMPLEMENTAR = 500;
export const LIMITE_OBSERVACOES = 2000;
export const LIMITE_REFERENCIA = 50;
export const LIMITE_IMAGEM = 2000000;
export const CASAS_DECIMAIS_MOEDA = 2;
export const CASAS_DECIMAIS_QUANTIDADE = 3;
export const CASAS_DECIMAIS_PERCENTUAL = 4;

/** Modelo de entrada do formulário (valores ainda em texto). */
export interface ProdutoFormInput {
  id: number;
  codigo: string;
  descricao: string;
  descricaoComplementar: string;
  favorito: boolean;
  ativo: boolean;
  grade: boolean;
  controlesEspecificos: boolean;
  ecommerceMarketplace: boolean;
  composicao: boolean;
  imagem: string;
  tipoProduto: string;
  grupo: string;
  subcategoria: string;
  marca: string;
  modelo: string;
  unidadeMedida: CodigoUnidadeMedida;
  referencia: string;
  codigoBarras: string;
  observacoes: string;

  custo: string;
  custoMedio: string;
  ultimoCustoAquisicao: string;
  dataUltimaCompra: string;
  preco: string;
  precoAtacado: string;
  precoPromocional: string;
  promocaoInicio: string;
  promocaoFim: string;
  margemDesejada: string;
  markup: string;
  precoMinimo: string;
  descontoMaximo: string;
  lucroBruto: string;
  observacoesComerciais: string;

  controlarEstoque: boolean;
  quantidade: string;
  quantidadeAtacadoMaior: string;
  quantidadeReservada: string;
  quantidadeMinima: string;
  estoqueMaximo: string;
  deposito: string;
  corredor: string;
  prateleira: string;
  localizacao: string;
  lote: string;
  numeroSerie: string;
  dataValidade: string;
  pesoBruto: string;
  pesoLiquido: string;
  comprimento: string;
  largura: string;
  altura: string;
  quantidadeEmbalagem: string;
  venderFracionado: boolean;
  permitirEstoqueNegativo: boolean;

  perfilTributacao: string;
  origem: string;
  cstContribuinte: string;
  cstNaoContribuinte: string;
  csosnContribuinte: string;
  csosnNaoContribuinte: string;
  cfopNfe: string;
  cfopNfce: string;
  ncm: string;
  cest: string;
  excecaoFiscal: string;
  tributacaoContribuinte: string;
  tributacaoNaoContribuinte: string;
  taxaFcp: string;
  aliquotaIcmsOrigem: string;
  cstIpi: string;
  aliquotaIpi: string;
  cstPis: string;
  aliquotaPis: string;
  cstCofins: string;
  aliquotaCofins: string;
  cBenef: string;
  unidadeTributavel: string;
  fatorConversaoTributavel: string;
  informacoesAdicionais: string;
  cstIbs: string;
  classificacaoIbsCbs: string;
  aliquotaIbs: string;
  aliquotaCbs: string;

  fornecedorPreferencialId: string;
  fornecedoresSecundarios: string[];
  codigoFornecedor: string;
  unidadeCompra: CodigoUnidadeMedida;
  unidadeVenda: CodigoUnidadeMedida;
  fatorConversaoCompra: string;
  quantidadeMinimaCompra: string;
  prazoEntregaDias: string;
  ultimaQuantidadeComprada: string;

  permitirVenda: boolean;
  permitirCompra: boolean;
  exibirPdv: boolean;
  permiteDesconto: boolean;
  exigeAutorizacaoDesconto: boolean;
  pesavel: boolean;
  comissao: string;
  ehKit: boolean;
  componentes: ComponenteProduto[];
  observacoesVendedor: string;
  produtosSimilares: string[];

  motivoInativacao: string;

  dadosVeiculo: {
    marca: string;
    modelo: string;
    versao: string;
    anoFabricacao: string;
    anoModelo: string;
    placa: string;
    chassi: string;
    renavam: string;
    cor: string;
    combustivel: string;
    quilometragem: string;
    numeroMotor: string;
    portas: string;
    cambio: string;
    condicao: string;
    notaFiscalAquisicao: string;
    fornecedorAnterior: string;
    custoAquisicao: string;
    despesasPreparacao: string;
    situacao: string;
    renaveEntrada: string;
    renaveSaida: string;
  };
}

/** Objeto normalizado, pronto para a camada de armazenamento. */
export type ProdutoNormalizado = Produto;

export type ValidationErrors = Record<string, string>;

export interface PrepareProdutoResult {
  valid: boolean;
  errors: ValidationErrors;
  /** Avisos informativos que não bloqueiam o salvamento. */
  avisos: string[];
  data: ProdutoNormalizado;
}

/* -------------------------------------------------------------------------- */
/* Conversão de números                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Normaliza texto numérico aceitando os formatos usuais no Brasil:
 * - `1.234,56` (ponto como milhar e vírgula como decimal);
 * - `1234,56`;
 * - `1234.56`.
 * Não remove o sinal negativo: a validação de cada campo decide se ele é aceito.
 */
const normalizarNumeroTexto = (valor: string): string => {
  const limpo = valor.trim().replace(/\s/g, '');
  if (limpo.includes(',') && limpo.includes('.')) {
    return limpo.replace(/\./g, '').replace(',', '.');
  }
  if (limpo.includes(',')) {
    return limpo.replace(',', '.');
  }
  if (!/^0/.test(limpo) && /^\d{1,3}(\.\d{3})+$/.test(limpo)) {
    return limpo.replace(/\./g, '');
  }
  return limpo;
};

/** Converte texto numérico brasileiro/internacional em número, ou `null`. */
export const parseNumero = (valor: string): number | null => {
  if (!valor.trim()) return null;
  const normalizado = normalizarNumeroTexto(valor);
  if (!/^-?\d+(\.\d+)?$/.test(normalizado)) return null;
  const numero = Number(normalizado);
  return Number.isNaN(numero) ? null : numero;
};

/** Número de casas decimais presentes no texto informado. */
export const contarCasasDecimais = (valor: string): number => {
  const normalizado = normalizarNumeroTexto(valor);
  if (!normalizado.includes('.')) return 0;
  return normalizado.split('.')[1]?.length ?? 0;
};

/** Formata número no padrão brasileiro, sem símbolo de moeda. */
export const formatarNumero = (valor: number, maxCasas = CASAS_DECIMAIS_QUANTIDADE): string =>
  new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxCasas,
  }).format(valor);

/** Formata valor monetário em reais. */
export const formatarMoeda = (valor: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: CASAS_DECIMAIS_MOEDA,
    maximumFractionDigits: CASAS_DECIMAIS_MOEDA,
  }).format(valor);

/** Formata percentual com o símbolo de porcentagem. */
export const formatarPercentual = (valor: number): string =>
  `${formatarNumero(valor, CASAS_DECIMAIS_PERCENTUAL)} %`;

const numeroParaCampo = (valor: number, casas: number): string => {
  if (!Number.isFinite(valor)) return '';
  const texto = valor.toFixed(casas).replace(/0+$/, '').replace(/\.$/, '');
  return texto.replace('.', ',');
};

/** Converte um número para o texto exibido em campo monetário. */
export const paraCampoMonetario = (valor: number): string =>
  valor.toFixed(CASAS_DECIMAIS_MOEDA).replace('.', ',');

/** Converte um número para o texto exibido em campo de quantidade. */
export const paraCampoQuantidade = (valor: number): string =>
  numeroParaCampo(valor, CASAS_DECIMAIS_QUANTIDADE);

/** Converte um número para o texto exibido em campo percentual. */
export const paraCampoPercentual = (valor: number): string =>
  numeroParaCampo(valor, CASAS_DECIMAIS_PERCENTUAL);

/* -------------------------------------------------------------------------- */
/* Datas                                                                      */
/* -------------------------------------------------------------------------- */

/** Data/hora ISO atual. */
export const agoraIso = (): string => new Date().toISOString();

/** Converte AAAA-MM-DD em DD/MM/AAAA. Datas já em DD/MM/AAAA são preservadas. */
export const formatarDataBr = (valor: string): string => {
  if (!valor) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(valor)) {
    const [ano, mes, dia] = valor.slice(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return valor;
};

/** Converte DD/MM/AAAA em AAAA-MM-DD. Valores já ISO são preservados. */
export const formatarDataIso = (valor: string): string => {
  if (!valor) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(valor)) return valor.slice(0, 10);
  const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return valor;
  return `${match[3]}-${match[2]}-${match[1]}`;
};

const dataIsoValida = (valor: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = new Date(`${valor}T00:00:00`);
  return !Number.isNaN(data.getTime());
};

/** Data/hora ISO em formato brasileiro (DD/MM/AAAA HH:mm). */
export const formatarDataHoraBr = (valor: string): string => {
  if (!valor) return '';
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* -------------------------------------------------------------------------- */
/* Cálculos comerciais                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Margem de lucro bruta sobre o preço de venda (%).
 * Margem não é markup: margem = (preço - custo) / preço.
 */
export const calcularMargem = (preco: number, custo: number): number => {
  if (!Number.isFinite(preco) || preco <= 0) return 0;
  return ((preco - custo) / preco) * 100;
};

/**
 * Markup sobre o custo (%).
 * Markup não é margem: markup = (preço - custo) / custo.
 */
export const calcularMarkup = (preco: number, custo: number): number => {
  if (!Number.isFinite(custo) || custo <= 0) return 0;
  return ((preco - custo) / custo) * 100;
};

/** Preço sugerido a partir do custo e da margem desejada (%). */
export const calcularPrecoPorMargem = (custo: number, margemPercentual: number): number => {
  if (!Number.isFinite(custo) || custo < 0) return 0;
  if (margemPercentual >= 100) return 0;
  return custo / (1 - margemPercentual / 100);
};

/** Preço sugerido a partir do custo e do markup desejado (%). */
export const calcularPrecoPorMarkup = (custo: number, markupPercentual: number): number =>
  custo * (1 + markupPercentual / 100);

/** Indica se o preço promocional está vigente na data informada. */
export const promocaoVigente = (
  produto: Pick<Produto, 'precoPromocional' | 'promocaoInicio' | 'promocaoFim'>,
  agora: Date = new Date()
): boolean => {
  if (!(produto.precoPromocional > 0)) return false;
  if (!produto.promocaoInicio || !produto.promocaoFim) return false;
  const inicio = new Date(`${formatarDataIso(produto.promocaoInicio)}T00:00:00`);
  const fim = new Date(`${formatarDataIso(produto.promocaoFim)}T23:59:59`);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return false;
  return agora >= inicio && agora <= fim;
};

/** Preço efetivamente praticado, considerando a promoção vigente. */
export const precoVendaEfetivo = (produto: Produto, agora: Date = new Date()): number =>
  promocaoVigente(produto, agora) ? produto.precoPromocional : produto.preco;

/* -------------------------------------------------------------------------- */
/* Validação de campos numéricos                                               */
/* -------------------------------------------------------------------------- */

interface OpcoesNumero {
  maxCasas: number;
  obrigatorio?: boolean;
  naoNegativo?: boolean;
  maximo?: number;
}

const validarNumero = (valor: string, opcoes: OpcoesNumero): string | undefined => {
  const trimmed = valor.trim();
  if (!trimmed) {
    return opcoes.obrigatorio ? 'Informe um valor' : undefined;
  }
  const normalizado = normalizarNumeroTexto(trimmed);
  if (!/^-?\d+(\.\d+)?$/.test(normalizado)) return 'Valor inválido';
  const numero = Number(normalizado);
  if (Number.isNaN(numero)) return 'Valor inválido';
  if (opcoes.naoNegativo && numero < 0) return 'Não pode ser negativo';
  if (opcoes.maximo !== undefined && numero > opcoes.maximo) {
    return `Não pode ser superior a ${formatarNumero(opcoes.maximo, opcoes.maxCasas)}`;
  }
  if (contarCasasDecimais(trimmed) > opcoes.maxCasas) {
    return `Máximo de ${opcoes.maxCasas} casas decimais`;
  }
  return undefined;
};

/* -------------------------------------------------------------------------- */
/* Utilidades de catálogo                                                       */
/* -------------------------------------------------------------------------- */

export const descricaoOpcao = (
  catalogo: OpcaoCatalogo[],
  codigo: string | undefined
): string => {
  if (!codigo) return '';
  return catalogo.find((opcao) => opcao.codigo === codigo)?.descricao ?? codigo;
};

export const codigoExisteNoCatalogo = (
  catalogo: OpcaoCatalogo[],
  codigo: string | undefined
): boolean => Boolean(codigo) && catalogo.some((opcao) => opcao.codigo === codigo);

/* -------------------------------------------------------------------------- */
/* Regras de negócio                                                           */
/* -------------------------------------------------------------------------- */

export interface FornecedorVinculavel {
  id: number;
  status: string;
}

/**
 * Indica se o produto está com saldo cadastral abaixo do mínimo.
 * Apenas produtos ativos e com controle de estoque entram na contagem.
 */
export const produtoComEstoqueCritico = (produto: Produto): boolean =>
  produto.ativo &&
  produto.controlarEstoque &&
  produto.quantidadeMinima > 0 &&
  produto.quantidade < produto.quantidadeMinima;

/** Estoque disponível: saldo físico menos reservas válidas. */
export const estoqueDisponivel = (produto: Produto): number =>
  Math.max(0, produto.quantidade - produto.quantidadeReservada);

/** Indica estoque acima do máximo configurado. */
export const produtoComEstoqueExcedente = (produto: Produto): boolean =>
  produto.controlarEstoque &&
  produto.estoqueMaximo > 0 &&
  produto.quantidade > produto.estoqueMaximo;

/** Verifica se o código do produto já está em uso por outro registro. */
export const codigoProdutoJaUtilizado = (
  codigo: string,
  existentes: { id: number; codigo: string }[],
  ignorarId?: number
): boolean => {
  const alvo = codigo.trim().toLowerCase();
  if (!alvo) return false;
  return existentes.some(
    (produto) => produto.id !== ignorarId && produto.codigo.trim().toLowerCase() === alvo
  );
};

/**
 * Valida o vínculo com o fornecedor preferencial.
 * - Fornecedor inexistente: erro (não é permitido vincular em novos cadastros).
 * - Fornecedor inativo ou bloqueado: aviso, o vínculo é preservado.
 */
export const validarFornecedorPreferencial = (
  id: string,
  existentes: FornecedorVinculavel[]
): { erro?: string; aviso?: string } => {
  if (!id.trim()) return {};
  const fornecedor = existentes.find((item) => item.id === Number(id));
  if (!fornecedor) {
    return { erro: 'O fornecedor selecionado não existe no cadastro de fornecedores.' };
  }
  if (fornecedor.status !== 'Ativo') {
    return {
      aviso: `O fornecedor preferencial está ${fornecedor.status.toLowerCase()}. O vínculo foi mantido para preservar o histórico do cadastro.`,
    };
  }
  return {};
};

/* -------------------------------------------------------------------------- */
/* Validação do formulário                                                      */
/* -------------------------------------------------------------------------- */

const ehVeiculo = (input: ProdutoFormInput): boolean =>
  input.tipoProduto === 'VEICULO' || input.grupo === 'VEICULOS';

export const validarDadosGerais = (input: ProdutoFormInput): ValidationErrors => {
  const errors: ValidationErrors = {};

  const descricao = input.descricao.trim();
  if (!descricao) {
    errors.descricao = 'Descrição é obrigatória';
  } else if (descricao.length > LIMITE_DESCRICAO) {
    errors.descricao = `Descrição deve ter no máximo ${LIMITE_DESCRICAO} caracteres`;
  }

  if (!input.tipoProduto.trim()) {
    errors.tipoProduto = 'Tipo do produto é obrigatório';
  }

  if (input.descricaoComplementar.length > LIMITE_DESCRICAO_COMPLEMENTAR) {
    errors.descricaoComplementar = `Descrição complementar deve ter no máximo ${LIMITE_DESCRICAO_COMPLEMENTAR} caracteres`;
  }

  const referencia = input.referencia.trim();
  if (referencia) {
    if (referencia.length > LIMITE_REFERENCIA) {
      errors.referencia = `Referência deve ter no máximo ${LIMITE_REFERENCIA} caracteres`;
    } else if (!/^[A-Za-z0-9._/-]+$/.test(referencia)) {
      errors.referencia =
        'Referência deve conter apenas letras, números, ponto, hífen, barra ou sublinhado';
    }
  }

  const codigoBarras = input.codigoBarras.trim();
  if (codigoBarras && !/^\d{8,14}$/.test(codigoBarras)) {
    errors.codigoBarras = 'Código de barras deve ter de 8 a 14 dígitos numéricos';
  }

  if (input.observacoes.length > LIMITE_OBSERVACOES) {
    errors.observacoes = `Observações devem ter no máximo ${LIMITE_OBSERVACOES} caracteres`;
  }

  if (input.imagem && input.imagem.length > LIMITE_IMAGEM) {
    errors.imagem = 'Imagem muito grande. Utilize um arquivo de até 2 MB.';
  }

  return errors;
};

export const validarPrecos = (input: ProdutoFormInput): ValidationErrors => {
  const errors: ValidationErrors = {};

  const campos: { chave: keyof ProdutoFormInput; maxCasas: number }[] = [
    { chave: 'preco', maxCasas: CASAS_DECIMAIS_MOEDA },
    { chave: 'precoAtacado', maxCasas: CASAS_DECIMAIS_MOEDA },
    { chave: 'precoPromocional', maxCasas: CASAS_DECIMAIS_MOEDA },
    { chave: 'custo', maxCasas: CASAS_DECIMAIS_MOEDA },
    { chave: 'custoMedio', maxCasas: CASAS_DECIMAIS_MOEDA },
    { chave: 'ultimoCustoAquisicao', maxCasas: CASAS_DECIMAIS_MOEDA },
    { chave: 'precoMinimo', maxCasas: CASAS_DECIMAIS_MOEDA },
    { chave: 'lucroBruto', maxCasas: CASAS_DECIMAIS_MOEDA },
    { chave: 'margemDesejada', maxCasas: CASAS_DECIMAIS_PERCENTUAL },
    { chave: 'markup', maxCasas: CASAS_DECIMAIS_PERCENTUAL },
    { chave: 'descontoMaximo', maxCasas: CASAS_DECIMAIS_PERCENTUAL },
    { chave: 'comissao', maxCasas: CASAS_DECIMAIS_PERCENTUAL },
  ];

  for (const { chave, maxCasas } of campos) {
    const valor = input[chave] as string;
    const erro = validarNumero(valor, {
      maxCasas,
      naoNegativo: true,
      ...(chave === 'descontoMaximo' || chave === 'comissao' || chave === 'margemDesejada'
        ? { maximo: chave === 'margemDesejada' ? 99.99 : 100 }
        : {}),
    });
    if (erro) errors[chave] = erro;
  }

  const precoPromocional = parseNumero(input.precoPromocional) ?? 0;
  const preco = parseNumero(input.preco) ?? 0;
  const inicio = formatarDataIso(input.promocaoInicio);
  const fim = formatarDataIso(input.promocaoFim);

  if (precoPromocional > 0) {
    if (!inicio || !fim) {
      errors.promocaoInicio = 'Informe o início e o término da promoção';
    } else if (!dataIsoValida(inicio)) {
      errors.promocaoInicio = 'Data de início inválida';
    } else if (!dataIsoValida(fim)) {
      errors.promocaoFim = 'Data de término inválida';
    } else if (fim < inicio) {
      errors.promocaoFim = 'O término deve ser igual ou posterior ao início';
    }
  } else if (input.promocaoInicio.trim() || input.promocaoFim.trim()) {
    if (!inicio || !fim) {
      errors.promocaoInicio = 'Informe o preço promocional e o período completo';
    } else if (fim < inicio) {
      errors.promocaoFim = 'O término deve ser igual ou posterior ao início';
    }
  }

  const precoMinimo = parseNumero(input.precoMinimo) ?? 0;
  if (precoMinimo > 0 && preco > 0 && precoMinimo > preco) {
    errors.precoMinimo = 'O preço mínimo não pode ser maior que o preço de venda';
  }

  return errors;
};

export const validarEstoque = (input: ProdutoFormInput): ValidationErrors => {
  const errors: ValidationErrors = {};

  const numeros: { chave: keyof ProdutoFormInput; maxCasas: number }[] = [
    { chave: 'quantidade', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
    { chave: 'quantidadeAtacadoMaior', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
    { chave: 'quantidadeReservada', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
    { chave: 'quantidadeMinima', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
    { chave: 'estoqueMaximo', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
    { chave: 'pesoBruto', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
    { chave: 'pesoLiquido', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
    { chave: 'comprimento', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
    { chave: 'largura', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
    { chave: 'altura', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
    { chave: 'quantidadeEmbalagem', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
  ];

  for (const { chave, maxCasas } of numeros) {
    const erro = validarNumero(input[chave] as string, { maxCasas, naoNegativo: true });
    if (erro) errors[chave] = erro;
  }

  if (input.dataValidade.trim() && !dataIsoValida(formatarDataIso(input.dataValidade))) {
    errors.dataValidade = 'Data de validade inválida';
  }

  const bruto = parseNumero(input.pesoBruto);
  const liquido = parseNumero(input.pesoLiquido);
  if (bruto !== null && liquido !== null && liquido > bruto && bruto > 0) {
    errors.pesoLiquido = 'Peso líquido não pode ser maior que o peso bruto';
  }

  const minimo = parseNumero(input.quantidadeMinima);
  const maximo = parseNumero(input.estoqueMaximo);
  if (minimo !== null && maximo !== null && maximo > 0 && minimo > maximo) {
    errors.quantidadeMinima = 'O estoque mínimo não pode ser maior que o máximo';
  }

  const quantidade = parseNumero(input.quantidade);
  const reservada = parseNumero(input.quantidadeReservada);
  if (quantidade !== null && reservada !== null && reservada > quantidade) {
    errors.quantidadeReservada = 'A quantidade reservada não pode exceder o saldo atual';
  }

  return errors;
};

export const validarDadosFiscais = (input: ProdutoFormInput): ValidationErrors => {
  const errors: ValidationErrors = {};

  const ncm = input.ncm.replace(/[.\-\s]/g, '');
  if (input.ncm.trim() && !/^\d{8}$/.test(ncm)) {
    errors.ncm = 'NCM deve ter 8 dígitos (formato 0000.00.00)';
  }

  const cest = input.cest.replace(/[.\-\s]/g, '');
  if (input.cest.trim() && !/^\d{7}$/.test(cest)) {
    errors.cest = 'CEST deve ter 7 dígitos';
  }

  const percentuais: { chave: keyof ProdutoFormInput }[] = [
    { chave: 'taxaFcp' },
    { chave: 'aliquotaIcmsOrigem' },
    { chave: 'aliquotaIpi' },
    { chave: 'aliquotaPis' },
    { chave: 'aliquotaCofins' },
    { chave: 'aliquotaIbs' },
    { chave: 'aliquotaCbs' },
  ];
  for (const { chave } of percentuais) {
    const erro = validarNumero(input[chave] as string, {
      maxCasas: CASAS_DECIMAIS_PERCENTUAL,
      naoNegativo: true,
      maximo: 100,
    });
    if (erro) errors[chave] = erro;
  }

  const fator = validarNumero(input.fatorConversaoTributavel, {
    maxCasas: 6,
    naoNegativo: true,
  });
  if (fator) errors.fatorConversaoTributavel = fator;

  const perfilSimples = PERFIS_SIMPLES_NACIONAL.includes(input.perfilTributacao);
  const cstInformado = Boolean(input.cstContribuinte.trim() || input.cstNaoContribuinte.trim());
  const csosnInformado = Boolean(
    input.csosnContribuinte.trim() || input.csosnNaoContribuinte.trim()
  );

  if (perfilSimples && cstInformado) {
    errors.cstContribuinte =
      'Perfil de Simples Nacional: use CSOSN. O CST se aplica ao regime normal.';
  }

  if (!perfilSimples && csosnInformado) {
    errors.csosnContribuinte =
      'CSOSN se aplica ao Simples Nacional. Selecione o perfil de tributação correspondente ou informe CST.';
  }

  return errors;
};

export const validarCompras = (input: ProdutoFormInput): ValidationErrors => {
  const errors: ValidationErrors = {};

  const numeros: { chave: keyof ProdutoFormInput; maxCasas: number }[] = [
    { chave: 'fatorConversaoCompra', maxCasas: 6 },
    { chave: 'quantidadeMinimaCompra', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
    { chave: 'prazoEntregaDias', maxCasas: 0 },
    { chave: 'ultimaQuantidadeComprada', maxCasas: CASAS_DECIMAIS_QUANTIDADE },
  ];
  for (const { chave, maxCasas } of numeros) {
    const erro = validarNumero(input[chave] as string, { maxCasas, naoNegativo: true });
    if (erro) errors[chave] = erro;
  }

  const fator = parseNumero(input.fatorConversaoCompra);
  if (fator !== null && fator <= 0) {
    errors.fatorConversaoCompra = 'O fator de conversão deve ser maior que zero';
  }

  if (input.dataUltimaCompra.trim() && !dataIsoValida(formatarDataIso(input.dataUltimaCompra))) {
    errors.dataUltimaCompra = 'Data da última compra inválida';
  }

  if (input.codigoFornecedor.length > 60) {
    errors.codigoFornecedor = 'Código do fornecedor deve ter no máximo 60 caracteres';
  }

  return errors;
};

export const validarVeiculo = (input: ProdutoFormInput): ValidationErrors => {
  const errors: ValidationErrors = {};
  if (!ehVeiculo(input)) return errors;

  const veiculo = input.dadosVeiculo;
  if (!veiculo.chassi.trim()) {
    errors['dadosVeiculo.chassi'] = 'Chassi/VIN é obrigatório para veículos';
  } else if (
    !/^[A-HJ-NPR-Z0-9]{11,17}$/i.test(veiculo.chassi.replace(/\s/g, ''))
  ) {
    errors['dadosVeiculo.chassi'] = 'Chassi deve ter de 11 a 17 caracteres alfanuméricos';
  }

  if (!veiculo.placa.trim()) {
    errors['dadosVeiculo.placa'] = 'Placa é obrigatória para veículos';
  } else if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i.test(veiculo.placa.replace(/[-\s]/g, ''))) {
    errors['dadosVeiculo.placa'] = 'Placa inválida (use AAA0000 ou AAA0A00)';
  }

  if (!veiculo.condicao.trim()) {
    errors['dadosVeiculo.condicao'] = 'Informe se o veículo é novo ou usado';
  }

  const ano = veiculo.anoFabricacao.trim();
  if (ano && !/^\d{4}$/.test(ano)) {
    errors['dadosVeiculo.anoFabricacao'] = 'Ano de fabricação inválido';
  }
  const anoModelo = veiculo.anoModelo.trim();
  if (anoModelo && !/^\d{4}$/.test(anoModelo)) {
    errors['dadosVeiculo.anoModelo'] = 'Ano-modelo inválido';
  }

  const km = validarNumero(veiculo.quilometragem, {
    maxCasas: 0,
    naoNegativo: true,
  });
  if (km) errors['dadosVeiculo.quilometragem'] = km;

  const custo = validarNumero(veiculo.custoAquisicao, {
    maxCasas: CASAS_DECIMAIS_MOEDA,
    naoNegativo: true,
  });
  if (custo) errors['dadosVeiculo.custoAquisicao'] = custo;

  const despesas = validarNumero(veiculo.despesasPreparacao, {
    maxCasas: CASAS_DECIMAIS_MOEDA,
    naoNegativo: true,
  });
  if (despesas) errors['dadosVeiculo.despesasPreparacao'] = despesas;

  return errors;
};

/** Validação completa do formulário de produto. */
export const validarProduto = (input: ProdutoFormInput): ValidationErrors => ({
  ...validarDadosGerais(input),
  ...validarPrecos(input),
  ...validarEstoque(input),
  ...validarDadosFiscais(input),
  ...validarCompras(input),
  ...validarVeiculo(input),
});

/** Avisos informativos que não bloqueiam o salvamento. */
export const gerarAvisosProduto = (input: ProdutoFormInput): string[] => {
  const avisos: string[] = [];

  if (!input.ncm.trim() && input.tipoProduto !== 'SERVICOS') {
    avisos.push('NCM não informado: confirme a classificação fiscal antes de emitir documentos.');
  }

  if (
    PERFIS_SIMPLES_NACIONAL.includes(input.perfilTributacao) &&
    !input.csosnContribuinte.trim() &&
    !input.csosnNaoContribuinte.trim()
  ) {
    avisos.push('Perfil de Simples Nacional sem CSOSN definido.');
  }

  if (input.tipoProduto === 'SERVICOS' && input.quantidadeMinima.trim()) {
    avisos.push('Serviços não exigem quantidade mínima de estoque.');
  }

  const preco = parseNumero(input.preco) ?? 0;
  const custo = parseNumero(input.custo) ?? 0;
  if (preco > 0 && custo > preco) {
    avisos.push('O preço de venda é menor que o custo: a margem será negativa.');
  }

  const inicio = formatarDataIso(input.promocaoInicio);
  const fim = formatarDataIso(input.promocaoFim);
  if (input.precoPromocional.trim() && inicio && fim) {
    const hoje = new Date().toISOString().slice(0, 10);
    if (fim < hoje) {
      avisos.push('O período promocional informado já está encerrado.');
    } else if (inicio > hoje) {
      avisos.push('O período promocional ainda não começou.');
    }
  }

  if (input.ehKit && input.componentes.length === 0) {
    avisos.push('Produto marcado como kit/composição sem componentes informados.');
  }

  return avisos;
};

/* -------------------------------------------------------------------------- */
/* Histórico de alterações                                                     */
/* -------------------------------------------------------------------------- */

interface ComparacaoAuditoria {
  campo: string;
  rotulo: string;
  anterior: unknown;
  novo: unknown;
}

const camposAuditados: { chave: keyof Produto; rotulo: string }[] = [
  { chave: 'preco', rotulo: 'Preço de venda' },
  { chave: 'precoPromocional', rotulo: 'Preço promocional' },
  { chave: 'custo', rotulo: 'Custo' },
  { chave: 'custoMedio', rotulo: 'Custo médio' },
  { chave: 'ativo', rotulo: 'Status' },
  { chave: 'precoMinimo', rotulo: 'Preço mínimo' },
  { chave: 'descontoMaximo', rotulo: 'Desconto máximo' },
  { chave: 'quantidadeMinima', rotulo: 'Estoque mínimo' },
  { chave: 'estoqueMaximo', rotulo: 'Estoque máximo' },
];

const camposAuditadosFiscal: { chave: keyof DadosFiscaisProduto; rotulo: string }[] = [
  { chave: 'ncm', rotulo: 'NCM' },
  { chave: 'cest', rotulo: 'CEST' },
  { chave: 'cfopNfe', rotulo: 'CFOP NF-e' },
  { chave: 'cfopNfce', rotulo: 'CFOP NFC-e' },
];

const valorComparavel = (valor: unknown): string => {
  if (typeof valor === 'boolean') return valor ? 'Ativo' : 'Inativo';
  if (typeof valor === 'number') return formatarNumero(valor, 4);
  if (valor === undefined || valor === null) return '';
  return String(valor);
};

const compararComExistente = (novo: Produto, existente: Produto): ComparacaoAuditoria[] => {
  const comparacoes: ComparacaoAuditoria[] = [];
  for (const { chave, rotulo } of camposAuditados) {
    const anterior = existente[chave];
    const atual = novo[chave];
    if (anterior !== atual) {
      comparacoes.push({ campo: rotulo, rotulo, anterior, novo: atual });
    }
  }
  for (const { chave, rotulo } of camposAuditadosFiscal) {
    const anterior = existente.fiscal[chave];
    const atual = novo.fiscal[chave];
    if (anterior !== atual) {
      comparacoes.push({ campo: rotulo, rotulo, anterior, novo: atual });
    }
  }
  return comparacoes;
};

/* -------------------------------------------------------------------------- */
/* Normalização e preparação                                                    */
/* -------------------------------------------------------------------------- */

const numeroOuZero = (valor: string): number => parseNumero(valor) ?? 0;

const dataDeCadastro = (): string => {
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${hoje.getFullYear()}`;
};

const normalizarFiscal = (input: ProdutoFormInput): DadosFiscaisProduto => ({
  ...FISCAL_PRODUTO_PADRAO,
  perfilTributacao: input.perfilTributacao.trim(),
  origem: input.origem.trim(),
  cstContribuinte: input.cstContribuinte.trim(),
  cstNaoContribuinte: input.cstNaoContribuinte.trim(),
  csosnContribuinte: input.csosnContribuinte.trim(),
  csosnNaoContribuinte: input.csosnNaoContribuinte.trim(),
  cfopNfe: input.cfopNfe.trim(),
  cfopNfce: input.cfopNfce.trim(),
  ncm: input.ncm.replace(/[.\-\s]/g, ''),
  cest: input.cest.replace(/[.\-\s]/g, ''),
  excecaoFiscal: input.excecaoFiscal.trim(),
  tributacaoContribuinte: input.tributacaoContribuinte.trim(),
  tributacaoNaoContribuinte: input.tributacaoNaoContribuinte.trim(),
  taxaFcp: numeroOuZero(input.taxaFcp),
  aliquotaIcmsOrigem: numeroOuZero(input.aliquotaIcmsOrigem),
  cstIpi: input.cstIpi.trim(),
  aliquotaIpi: numeroOuZero(input.aliquotaIpi),
  cstPis: input.cstPis.trim(),
  aliquotaPis: numeroOuZero(input.aliquotaPis),
  cstCofins: input.cstCofins.trim(),
  aliquotaCofins: numeroOuZero(input.aliquotaCofins),
  cBenef: input.cBenef.trim(),
  unidadeTributavel: input.unidadeTributavel.trim(),
  fatorConversaoTributavel: numeroOuZero(input.fatorConversaoTributavel) || 1,
  informacoesAdicionais: input.informacoesAdicionais.trim(),
  cstIbs: input.cstIbs.trim(),
  classificacaoIbsCbs: input.classificacaoIbsCbs.trim(),
  aliquotaIbs: numeroOuZero(input.aliquotaIbs),
  aliquotaCbs: numeroOuZero(input.aliquotaCbs),
});

const normalizarVeiculo = (input: ProdutoFormInput): DadosVeiculo | undefined => {
  if (!ehVeiculo(input)) return undefined;
  const v = input.dadosVeiculo;
  return {
    ...DADOS_VEICULO_PADRAO,
    marca: v.marca.trim(),
    modelo: v.modelo.trim(),
    versao: v.versao.trim(),
    anoFabricacao: v.anoFabricacao.trim(),
    anoModelo: v.anoModelo.trim(),
    placa: v.placa.replace(/[-\s]/g, '').toUpperCase(),
    chassi: v.chassi.replace(/\s/g, '').toUpperCase(),
    renavam: v.renavam.trim(),
    cor: v.cor.trim(),
    combustivel: v.combustivel.trim(),
    quilometragem: numeroOuZero(v.quilometragem),
    numeroMotor: v.numeroMotor.trim(),
    portas: v.portas.trim(),
    cambio: v.cambio.trim(),
    condicao: v.condicao.trim(),
    notaFiscalAquisicao: v.notaFiscalAquisicao.trim(),
    fornecedorAnterior: v.fornecedorAnterior.trim(),
    custoAquisicao: numeroOuZero(v.custoAquisicao),
    despesasPreparacao: numeroOuZero(v.despesasPreparacao),
    situacao: v.situacao.trim(),
    renaveEntrada: v.renaveEntrada.trim(),
    renaveSaida: v.renaveSaida.trim(),
  };
};

/**
 * Normaliza o formulário e monta o objeto do produto.
 * Campos não alterados são preservados a partir do registro existente.
 * Datas e usuários de auditoria são preenchidos automaticamente.
 */
export const buildProdutoData = (
  input: ProdutoFormInput,
  existente?: Produto
): ProdutoNormalizado => {
  const usuario = obterUsuarioAtual()?.nome ?? 'Sistema';
  const agora = agoraIso();

  const preco = numeroOuZero(input.preco);
  const custo = numeroOuZero(input.custo);
  const componentes = input.componentes
    .filter((c) => c.produtoId > 0 && c.quantidade > 0)
    .map((c) => ({ produtoId: c.produtoId, quantidade: c.quantidade }));

  const normalizado: ProdutoNormalizado = {
    id: input.id,
    codigo: input.codigo.trim(),
    descricao: input.descricao.trim(),
    descricaoComplementar: input.descricaoComplementar.trim(),
    favorito: input.favorito,
    ativo: input.ativo,
    grade: input.grade,
    controlesEspecificos: input.controlesEspecificos,
    ecommerceMarketplace: input.ecommerceMarketplace,
    composicao: input.composicao,
    imagem: input.imagem,
    tipoProduto: input.tipoProduto.trim(),
    grupo: input.grupo.trim(),
    subcategoria: input.subcategoria.trim(),
    marca: input.marca.trim(),
    modelo: input.modelo.trim(),
    unidadeMedida: input.unidadeMedida,
    referencia: input.referencia.trim(),
    codigoBarras: input.codigoBarras.replace(/\D/g, ''),
    observacoes: input.observacoes,

    custo,
    custoMedio: numeroOuZero(input.custoMedio),
    ultimoCustoAquisicao: numeroOuZero(input.ultimoCustoAquisicao),
    dataUltimaCompra: formatarDataIso(input.dataUltimaCompra),
    preco,
    precoAtacado: numeroOuZero(input.precoAtacado),
    precoPromocional: numeroOuZero(input.precoPromocional),
    promocaoInicio: formatarDataIso(input.promocaoInicio),
    promocaoFim: formatarDataIso(input.promocaoFim),
    margemDesejada: numeroOuZero(input.margemDesejada),
    markup: numeroOuZero(input.markup),
    precoMinimo: numeroOuZero(input.precoMinimo),
    descontoMaximo: numeroOuZero(input.descontoMaximo),
    lucroBruto: numeroOuZero(input.lucroBruto),
    observacoesComerciais: input.observacoesComerciais,

    controlarEstoque: input.controlarEstoque,
    quantidade: numeroOuZero(input.quantidade),
    quantidadeAtacadoMaior: numeroOuZero(input.quantidadeAtacadoMaior),
    quantidadeReservada: numeroOuZero(input.quantidadeReservada),
    quantidadeMinima: numeroOuZero(input.quantidadeMinima),
    estoqueMaximo: numeroOuZero(input.estoqueMaximo),
    deposito: input.deposito.trim(),
    corredor: input.corredor.trim(),
    prateleira: input.prateleira.trim(),
    localizacao: input.localizacao.trim(),
    lote: input.lote.trim(),
    numeroSerie: input.numeroSerie.trim(),
    dataValidade: formatarDataIso(input.dataValidade),
    comprimento: numeroOuZero(input.comprimento),
    largura: numeroOuZero(input.largura),
    altura: numeroOuZero(input.altura),
    quantidadeEmbalagem: numeroOuZero(input.quantidadeEmbalagem),
    venderFracionado: input.venderFracionado,
    permitirEstoqueNegativo: input.permitirEstoqueNegativo,
    pesoBruto: numeroOuZero(input.pesoBruto),
    pesoLiquido: numeroOuZero(input.pesoLiquido),

    fiscal: normalizarFiscal(input),

    fornecedoresSecundarios: input.fornecedoresSecundarios
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0),
    codigoFornecedor: input.codigoFornecedor.trim(),
    unidadeCompra: input.unidadeCompra,
    unidadeVenda: input.unidadeVenda,
    fatorConversaoCompra: numeroOuZero(input.fatorConversaoCompra) || 1,
    quantidadeMinimaCompra: numeroOuZero(input.quantidadeMinimaCompra),
    prazoEntregaDias: numeroOuZero(input.prazoEntregaDias),
    historicoCompras: existente?.historicoCompras ?? [],
    ultimaQuantidadeComprada: numeroOuZero(input.ultimaQuantidadeComprada),

    permitirVenda: input.permitirVenda,
    permitirCompra: input.permitirCompra,
    exibirPdv: input.exibirPdv,
    permiteDesconto: input.permiteDesconto,
    exigeAutorizacaoDesconto: input.exigeAutorizacaoDesconto,
    pesavel: input.pesavel,
    comissao: numeroOuZero(input.comissao),
    ehKit: input.ehKit,
    componentes,
    observacoesVendedor: input.observacoesVendedor,
    produtosSimilares: input.produtosSimilares
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0),

    criadoEm: existente?.criadoEm || agora,
    criadoPor: existente?.criadoPor || usuario,
    atualizadoEm: agora,
    atualizadoPor: usuario,
    motivoInativacao: input.motivoInativacao.trim(),
    historicoAlteracoes: existente?.historicoAlteracoes ?? [],

    dadosVeiculo: normalizarVeiculo(input),

    dataCadastro: existente?.dataCadastro ?? dataDeCadastro(),
  };

  const fornecedorId = Number(input.fornecedorPreferencialId);
  if (input.fornecedorPreferencialId.trim() && !Number.isNaN(fornecedorId)) {
    normalizado.fornecedorPreferencialId = fornecedorId;
    const nome = existente?.fornecedorPreferencialNome?.trim();
    if (nome) normalizado.fornecedorPreferencialNome = nome;
  }

  if (existente) {
    const comparacoes = compararComExistente(normalizado, existente);
    if (comparacoes.length > 0) {
      const proximoId =
        existente.historicoAlteracoes.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;
      const novas: HistoricoAlteracaoProduto[] = comparacoes.map((comparacao, indice) => ({
        id: proximoId + indice,
        data: agora,
        usuario,
        campo: comparacao.campo,
        valorAnterior: valorComparavel(comparacao.anterior),
        valorNovo: valorComparavel(comparacao.novo),
        ...(comparacao.campo === 'Status' && !input.ativo && input.motivoInativacao.trim()
          ? { motivo: input.motivoInativacao.trim() }
          : {}),
      }));
      normalizado.historicoAlteracoes = [...existente.historicoAlteracoes, ...novas];
    }
  }

  return normalizado;
};

/** Prepara o objeto gravado a partir do formulário, com erros e avisos. */
export const prepareProduto = (
  input: ProdutoFormInput,
  existente?: Produto
): PrepareProdutoResult => {
  const errors = validarProduto(input);
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    avisos: gerarAvisosProduto(input),
    data: buildProdutoData(input, existente),
  };
};

const veiculoParaFormulario = (veiculo: DadosVeiculo | undefined) => {
  const v = veiculo ?? DADOS_VEICULO_PADRAO;
  return {
    marca: v.marca,
    modelo: v.modelo,
    versao: v.versao,
    anoFabricacao: v.anoFabricacao,
    anoModelo: v.anoModelo,
    placa: v.placa,
    chassi: v.chassi,
    renavam: v.renavam,
    cor: v.cor,
    combustivel: v.combustivel,
    quilometragem: paraCampoQuantidade(v.quilometragem),
    numeroMotor: v.numeroMotor,
    portas: v.portas,
    cambio: v.cambio,
    condicao: v.condicao,
    notaFiscalAquisicao: v.notaFiscalAquisicao,
    fornecedorAnterior: v.fornecedorAnterior,
    custoAquisicao: paraCampoMonetario(v.custoAquisicao),
    despesasPreparacao: paraCampoMonetario(v.despesasPreparacao),
    situacao: v.situacao,
    renaveEntrada: v.renaveEntrada,
    renaveSaida: v.renaveSaida,
  };
};

/** Monta o modelo de entrada a partir de um produto já salvo. */
export const produtoParaFormulario = (produto: Produto): ProdutoFormInput => ({
  id: produto.id,
  codigo: produto.codigo,
  descricao: produto.descricao,
  descricaoComplementar: produto.descricaoComplementar,
  favorito: produto.favorito,
  ativo: produto.ativo,
  grade: produto.grade,
  controlesEspecificos: produto.controlesEspecificos,
  ecommerceMarketplace: produto.ecommerceMarketplace,
  composicao: produto.composicao,
  imagem: produto.imagem,
  tipoProduto: produto.tipoProduto,
  grupo: produto.grupo,
  subcategoria: produto.subcategoria,
  marca: produto.marca,
  modelo: produto.modelo,
  unidadeMedida: produto.unidadeMedida,
  referencia: produto.referencia,
  codigoBarras: produto.codigoBarras,
  observacoes: produto.observacoes,

  custo: paraCampoMonetario(produto.custo),
  custoMedio: paraCampoMonetario(produto.custoMedio),
  ultimoCustoAquisicao: paraCampoMonetario(produto.ultimoCustoAquisicao),
  dataUltimaCompra: formatarDataBr(produto.dataUltimaCompra),
  preco: paraCampoMonetario(produto.preco),
  precoAtacado: paraCampoMonetario(produto.precoAtacado),
  precoPromocional: paraCampoMonetario(produto.precoPromocional),
  promocaoInicio: formatarDataBr(produto.promocaoInicio),
  promocaoFim: formatarDataBr(produto.promocaoFim),
  margemDesejada: paraCampoPercentual(produto.margemDesejada),
  markup: paraCampoPercentual(produto.markup),
  precoMinimo: paraCampoMonetario(produto.precoMinimo),
  descontoMaximo: paraCampoPercentual(produto.descontoMaximo),
  lucroBruto: paraCampoMonetario(produto.lucroBruto),
  observacoesComerciais: produto.observacoesComerciais,

  controlarEstoque: produto.controlarEstoque,
  quantidade: paraCampoQuantidade(produto.quantidade),
  quantidadeAtacadoMaior: paraCampoQuantidade(produto.quantidadeAtacadoMaior),
  quantidadeReservada: paraCampoQuantidade(produto.quantidadeReservada),
  quantidadeMinima: paraCampoQuantidade(produto.quantidadeMinima),
  estoqueMaximo: paraCampoQuantidade(produto.estoqueMaximo),
  deposito: produto.deposito,
  corredor: produto.corredor,
  prateleira: produto.prateleira,
  localizacao: produto.localizacao,
  lote: produto.lote,
  numeroSerie: produto.numeroSerie,
  dataValidade: formatarDataBr(produto.dataValidade),
  pesoBruto: paraCampoQuantidade(produto.pesoBruto),
  pesoLiquido: paraCampoQuantidade(produto.pesoLiquido),
  comprimento: paraCampoQuantidade(produto.comprimento),
  largura: paraCampoQuantidade(produto.largura),
  altura: paraCampoQuantidade(produto.altura),
  quantidadeEmbalagem: paraCampoQuantidade(produto.quantidadeEmbalagem),
  venderFracionado: produto.venderFracionado,
  permitirEstoqueNegativo: produto.permitirEstoqueNegativo,

  perfilTributacao: produto.fiscal.perfilTributacao,
  origem: produto.fiscal.origem,
  cstContribuinte: produto.fiscal.cstContribuinte,
  cstNaoContribuinte: produto.fiscal.cstNaoContribuinte,
  csosnContribuinte: produto.fiscal.csosnContribuinte,
  csosnNaoContribuinte: produto.fiscal.csosnNaoContribuinte,
  cfopNfe: produto.fiscal.cfopNfe,
  cfopNfce: produto.fiscal.cfopNfce,
  ncm: produto.fiscal.ncm,
  cest: produto.fiscal.cest,
  excecaoFiscal: produto.fiscal.excecaoFiscal,
  tributacaoContribuinte: produto.fiscal.tributacaoContribuinte,
  tributacaoNaoContribuinte: produto.fiscal.tributacaoNaoContribuinte,
  taxaFcp: paraCampoPercentual(produto.fiscal.taxaFcp),
  aliquotaIcmsOrigem: paraCampoPercentual(produto.fiscal.aliquotaIcmsOrigem),
  cstIpi: produto.fiscal.cstIpi,
  aliquotaIpi: paraCampoPercentual(produto.fiscal.aliquotaIpi),
  cstPis: produto.fiscal.cstPis,
  aliquotaPis: paraCampoPercentual(produto.fiscal.aliquotaPis),
  cstCofins: produto.fiscal.cstCofins,
  aliquotaCofins: paraCampoPercentual(produto.fiscal.aliquotaCofins),
  cBenef: produto.fiscal.cBenef,
  unidadeTributavel: produto.fiscal.unidadeTributavel,
  fatorConversaoTributavel: paraCampoQuantidade(produto.fiscal.fatorConversaoTributavel),
  informacoesAdicionais: produto.fiscal.informacoesAdicionais,
  cstIbs: produto.fiscal.cstIbs,
  classificacaoIbsCbs: produto.fiscal.classificacaoIbsCbs,
  aliquotaIbs: paraCampoPercentual(produto.fiscal.aliquotaIbs),
  aliquotaCbs: paraCampoPercentual(produto.fiscal.aliquotaCbs),

  fornecedorPreferencialId: produto.fornecedorPreferencialId
    ? String(produto.fornecedorPreferencialId)
    : '',
  fornecedoresSecundarios: produto.fornecedoresSecundarios.map(String),
  codigoFornecedor: produto.codigoFornecedor,
  unidadeCompra: produto.unidadeCompra,
  unidadeVenda: produto.unidadeVenda,
  fatorConversaoCompra: paraCampoQuantidade(produto.fatorConversaoCompra),
  quantidadeMinimaCompra: paraCampoQuantidade(produto.quantidadeMinimaCompra),
  prazoEntregaDias: String(produto.prazoEntregaDias),
  ultimaQuantidadeComprada: paraCampoQuantidade(produto.ultimaQuantidadeComprada),

  permitirVenda: produto.permitirVenda,
  permitirCompra: produto.permitirCompra,
  exibirPdv: produto.exibirPdv,
  permiteDesconto: produto.permiteDesconto,
  exigeAutorizacaoDesconto: produto.exigeAutorizacaoDesconto,
  pesavel: produto.pesavel,
  comissao: paraCampoPercentual(produto.comissao),
  ehKit: produto.ehKit,
  componentes: produto.componentes.map((c) => ({ ...c })),
  observacoesVendedor: produto.observacoesVendedor,
  produtosSimilares: produto.produtosSimilares.map(String),

  motivoInativacao: produto.motivoInativacao,

  dadosVeiculo: veiculoParaFormulario(produto.dadosVeiculo),
});

/** Monta o modelo de entrada de um novo cadastro. */
export const prepararFormularioVazio = (id: number): ProdutoFormInput => ({
  id,
  codigo: id > 0 ? formatarCodigoProduto(id) : '',
  descricao: '',
  descricaoComplementar: '',
  favorito: false,
  ativo: true,
  grade: false,
  controlesEspecificos: false,
  ecommerceMarketplace: false,
  composicao: false,
  imagem: '',
  tipoProduto: '',
  grupo: '',
  subcategoria: '',
  marca: '',
  modelo: '',
  unidadeMedida: 'UN',
  referencia: '',
  codigoBarras: '',
  observacoes: '',

  custo: '0,00',
  custoMedio: '0,00',
  ultimoCustoAquisicao: '0,00',
  dataUltimaCompra: '',
  preco: '0,00',
  precoAtacado: '0,00',
  precoPromocional: '0,00',
  promocaoInicio: '',
  promocaoFim: '',
  margemDesejada: '0',
  markup: '0',
  precoMinimo: '0,00',
  descontoMaximo: '0',
  lucroBruto: '0,00',
  observacoesComerciais: '',

  controlarEstoque: true,
  quantidade: '0',
  quantidadeAtacadoMaior: '0',
  quantidadeReservada: '0',
  quantidadeMinima: '0',
  estoqueMaximo: '0',
  deposito: '',
  corredor: '',
  prateleira: '',
  localizacao: '',
  lote: '',
  numeroSerie: '',
  dataValidade: '',
  pesoBruto: '0',
  pesoLiquido: '0',
  comprimento: '0',
  largura: '0',
  altura: '0',
  quantidadeEmbalagem: '1',
  venderFracionado: false,
  permitirEstoqueNegativo: false,

  perfilTributacao: '',
  origem: '',
  cstContribuinte: '',
  cstNaoContribuinte: '',
  csosnContribuinte: '',
  csosnNaoContribuinte: '',
  cfopNfe: '',
  cfopNfce: '',
  ncm: '',
  cest: '',
  excecaoFiscal: '',
  tributacaoContribuinte: '',
  tributacaoNaoContribuinte: '',
  taxaFcp: '0',
  aliquotaIcmsOrigem: '0',
  cstIpi: '',
  aliquotaIpi: '0',
  cstPis: '',
  aliquotaPis: '0',
  cstCofins: '',
  aliquotaCofins: '0',
  cBenef: '',
  unidadeTributavel: '',
  fatorConversaoTributavel: '1',
  informacoesAdicionais: '',
  cstIbs: '',
  classificacaoIbsCbs: '',
  aliquotaIbs: '0',
  aliquotaCbs: '0',

  fornecedorPreferencialId: '',
  fornecedoresSecundarios: [],
  codigoFornecedor: '',
  unidadeCompra: 'UN',
  unidadeVenda: 'UN',
  fatorConversaoCompra: '1',
  quantidadeMinimaCompra: '0',
  prazoEntregaDias: '0',
  ultimaQuantidadeComprada: '0',

  permitirVenda: true,
  permitirCompra: true,
  exibirPdv: true,
  permiteDesconto: true,
  exigeAutorizacaoDesconto: false,
  pesavel: false,
  comissao: '0',
  ehKit: false,
  componentes: [],
  observacoesVendedor: '',
  produtosSimilares: [],

  motivoInativacao: '',

  dadosVeiculo: veiculoParaFormulario(undefined),
});
