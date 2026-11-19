/**
 * Modelo do Módulo de Produtos.
 *
 * Observações de modelagem:
 * - Campos que são seletores de catálogo (tipo de produto, origem, CFOP, CST,
 *   CSOSN, perfil de tributação, unidade de medida, grupo) guardam apenas o
 *   CÓDIGO. A descrição vive nos catálogos de `data/produtos.ts` e
 *   `data/produtosFiscal.ts`, mantendo código e descrição separados no modelo
 *   e evitando texto duplicado no armazenamento.
 * - O fornecedor preferencial é referenciado pelo ID do fornecedor (chave
 *   estrangeira lógica). O nome é apenas uma cópia de leitura para listagem.
 * - Valores monetários são números decimais (o armazenamento é JSON local,
 *   sem ponto flutuante binário em banco relacional nesta etapa). O backend
 *   relacional futuro deve usar NUMERIC/DECIMAL.
 */

/** Situação cadastral do produto (inativação preserva os demais dados). */
export type StatusProduto = 'Ativo' | 'Inativo';

/** Código padronizado da unidade de medida. */
export type CodigoUnidadeMedida =
  | 'UN'
  | 'KG'
  | 'G'
  | 'L'
  | 'ML'
  | 'M'
  | 'M2'
  | 'CX'
  | 'PCT'
  | 'PAR';

/** Opção de catálogo: código e descrição mantidos separados. */
export interface OpcaoCatalogo {
  codigo: string;
  descricao: string;
}

/** Grupo de produtos (catálogo demonstrativo, sem CRUD nesta etapa). */
export interface GrupoProduto extends OpcaoCatalogo {}

/** Dados fiscais cadastrais do produto. */
export interface DadosFiscaisProduto {
  /** Perfil de tributação do produto (catálogo demonstrativo). */
  perfilTributacao: string;
  /** Origem da mercadoria (código fiscal de origem). */
  origem: string;
  /** CST para operações com contribuinte do ICMS. */
  cstContribuinte: string;
  /** CST para operações com não contribuinte do ICMS. */
  cstNaoContribuinte: string;
  /** CSOSN para operações com contribuinte do ICMS (Simples Nacional). */
  csosnContribuinte: string;
  /** CSOSN para operações com não contribuinte do ICMS (Simples Nacional). */
  csosnNaoContribuinte: string;
  /** CFOP padrão de NF-e. */
  cfopNfe: string;
  /** CFOP padrão de NFC-e. */
  cfopNfce: string;
  /** NCM (8 dígitos). */
  ncm: string;
  /** CEST (7 dígitos), opcional. */
  cest: string;
  /** Exceção fiscal (opcional). */
  excecaoFiscal: string;
  /** Tributação (configuração cadastral) para contribuinte. */
  tributacaoContribuinte: string;
  /** Tributação (configuração cadastral) para não contribuinte. */
  tributacaoNaoContribuinte: string;
  /** Taxa FCP em percentual. */
  taxaFcp: number;
  /** Alíquota de ICMS da origem em percentual. */
  aliquotaIcmsOrigem: number;
  /** CST do IPI, quando aplicável. */
  cstIpi: string;
  /** Alíquota de IPI em percentual. */
  aliquotaIpi: number;
  /** CST do PIS. */
  cstPis: string;
  /** Alíquota de PIS em percentual. */
  aliquotaPis: number;
  /** CST da COFINS. */
  cstCofins: string;
  /** Alíquota de COFINS em percentual. */
  aliquotaCofins: number;
  /** Código de benefício fiscal (cBenef), quando exigido. */
  cBenef: string;
  /** Unidade tributável. */
  unidadeTributavel: string;
  /** Fator de conversão para a unidade tributável. */
  fatorConversaoTributavel: number;
  /** Informações adicionais fiscais. */
  informacoesAdicionais: string;
  /** CST/classificação tributária de IBS (Reforma Tributária). */
  cstIbs: string;
  /** Classificação tributária de IBS/CBS. */
  classificacaoIbsCbs: string;
  /** Alíquota de IBS em percentual. */
  aliquotaIbs: number;
  /** Alíquota de CBS em percentual. */
  aliquotaCbs: number;
}

/** Registro de compra usado no histórico de aquisições. */
export interface HistoricoCompraProduto {
  id: number;
  /** Data no formato ISO (AAAA-MM-DD). */
  data: string;
  fornecedorId?: number;
  fornecedorNome: string;
  documento: string;
  quantidade: number;
  custoUnitario: number;
}

/** Componente de um produto composto/kit. */
export interface ComponenteProduto {
  produtoId: number;
  quantidade: number;
}

/** Item do histórico de alterações relevantes do produto. */
export interface HistoricoAlteracaoProduto {
  id: number;
  /** Data/hora ISO. */
  data: string;
  usuario: string;
  campo: string;
  valorAnterior: string;
  valorNovo: string;
  motivo?: string;
}

/** Dados específicos de veículos. Presentes apenas quando o tipo é VEICULO. */
export interface DadosVeiculo {
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
  quilometragem: number;
  numeroMotor: string;
  portas: string;
  cambio: string;
  condicao: string;
  notaFiscalAquisicao: string;
  fornecedorAnterior: string;
  custoAquisicao: number;
  despesasPreparacao: number;
  situacao: string;
  /** Situação de entrada no RENAVE (integração futura, sem chamada real). */
  renaveEntrada: string;
  /** Situação de saída no RENAVE (integração futura, sem chamada real). */
  renaveSaida: string;
}

export interface Produto {
  id: number;
  codigo: string;
  descricao: string;
  favorito: boolean;
  ativo: boolean;
  /** Atributo cadastral: uso de grade de variações. */
  grade: boolean;
  /** Atributo cadastral: controles específicos. */
  controlesEspecificos: boolean;
  /** Atributo cadastral: e-commerce e marketplace. */
  ecommerceMarketplace: boolean;
  /** Atributo cadastral: composição (kit). */
  composicao: boolean;

  /* ----------------------------- Dados gerais ----------------------------- */
  descricaoComplementar: string;
  subcategoria: string;
  marca: string;
  modelo: string;
  imagem: string;

  /* --------------------- Preços e informações comerciais ------------------ */
  precoPromocional: number;
  /** Início da promoção no formato ISO (AAAA-MM-DD) ou vazio. */
  promocaoInicio: string;
  /** Término da promoção no formato ISO (AAAA-MM-DD) ou vazio. */
  promocaoFim: string;
  margemDesejada: number;
  markup: number;
  precoMinimo: number;
  descontoMaximo: number;
  observacoesComerciais: string;
  ultimoCustoAquisicao: number;
  /** Data da última compra no formato ISO (AAAA-MM-DD) ou vazio. */
  dataUltimaCompra: string;

  /* -------------------------- Estoque e logística ------------------------- */
  controlarEstoque: boolean;
  /** Saldo físico atual, alterado apenas por movimentações/ajustes. */
  quantidade: number;
  quantidadeAtacadoMaior: number;
  quantidadeReservada: number;
  quantidadeMinima: number;
  estoqueMaximo: number;
  deposito: string;
  corredor: string;
  prateleira: string;
  localizacao: string;
  lote: string;
  numeroSerie: string;
  /** Data de validade no formato ISO (AAAA-MM-DD) ou vazio. */
  dataValidade: string;
  comprimento: number;
  largura: number;
  altura: number;
  quantidadeEmbalagem: number;
  venderFracionado: boolean;
  permitirEstoqueNegativo: boolean;

  /* ------------------------------ Comercial ------------------------------- */
  preco: number;
  precoAtacado: number;
  custo: number;
  custoMedio: number;
  unidadeMedida: CodigoUnidadeMedida;
  grupo: string;
  fornecedorPreferencialId?: number;
  fornecedorPreferencialNome?: string;
  tipoProduto: string;
  referencia: string;
  codigoBarras: string;
  lucroBruto: number;
  pesoBruto: number;
  pesoLiquido: number;
  observacoes: string;
  fiscal: DadosFiscaisProduto;

  /* ------------------------ Compras e fornecedores ------------------------ */
  fornecedoresSecundarios: number[];
  codigoFornecedor: string;
  unidadeCompra: CodigoUnidadeMedida;
  unidadeVenda: CodigoUnidadeMedida;
  fatorConversaoCompra: number;
  quantidadeMinimaCompra: number;
  prazoEntregaDias: number;
  historicoCompras: HistoricoCompraProduto[];
  ultimaQuantidadeComprada: number;

  /* ----------------------------- Vendas e PDV ----------------------------- */
  permitirVenda: boolean;
  permitirCompra: boolean;
  exibirPdv: boolean;
  permiteDesconto: boolean;
  exigeAutorizacaoDesconto: boolean;
  pesavel: boolean;
  comissao: number;
  ehKit: boolean;
  componentes: ComponenteProduto[];
  observacoesVendedor: string;
  produtosSimilares: number[];

  /* ----------------------- Complementares e auditoria --------------------- */
  criadoEm: string;
  criadoPor: string;
  atualizadoEm: string;
  atualizadoPor: string;
  motivoInativacao: string;
  historicoAlteracoes: HistoricoAlteracaoProduto[];

  /* ------------------------------- Veículos ------------------------------- */
  dadosVeiculo?: DadosVeiculo;

  dataCadastro: string;
}
