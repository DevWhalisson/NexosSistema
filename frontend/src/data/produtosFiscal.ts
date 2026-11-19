import type { OpcaoCatalogo } from '../types';

/**
 * Catálogos fiscais do Módulo de Produtos.
 *
 * IMPORTANTE: estas listas são apenas opções cadastrais de edição. Elas não
 * implementam cálculo de tributos, não determinam a tributação real de uma
 * operação e não substituem a validação fiscal especializada do backend.
 * Nenhum valor aqui deve ser tratado como regra de conformidade fiscal.
 */

/** Perfis de tributação (demonstrativos). */
export const PERFIS_TRIBUTACAO: OpcaoCatalogo[] = [
  { codigo: 'REGIME_NORMAL', descricao: 'Regime normal (lucro presumido ou real)' },
  { codigo: 'SIMPLES_NACIONAL', descricao: 'Simples Nacional' },
  { codigo: 'SIMPLES_NACIONAL_MEI', descricao: 'Simples Nacional (MEI)' },
  { codigo: 'SIMPLES_NACIONAL_EXCESSO', descricao: 'Simples Nacional (excesso de sublimite)' },
  { codigo: 'ISENTO', descricao: 'Isento ou sem tributação' },
  { codigo: 'NAO_INFORMADO', descricao: 'Não informado' },
];

/** Códigos de origem da mercadoria (uso administrativo do ERP). */
export const ORIGENS_PRODUTO: OpcaoCatalogo[] = [
  { codigo: '0', descricao: '0 - Nacional' },
  { codigo: '1', descricao: '1 - Estrangeira (importação direta)' },
  { codigo: '2', descricao: '2 - Estrangeira (adquirida no mercado interno)' },
  { codigo: '3', descricao: '3 - Nacional, conteúdo de importação' },
  { codigo: '4', descricao: '4 - Nacional, seção 4.1 a 4.6 da NT 2020.001' },
  { codigo: '5', descricao: '5 - Nacional, mercadoria ou bem com drawback' },
  { codigo: '6', descricao: '6 - Estrangeira, importação direta, sem similar nacional' },
  { codigo: '7', descricao: '7 - Estrangeira, adquirida no mercado interno, sem similar' },
  { codigo: '8', descricao: '8 - Nacional, mercadoria ou bem com drawback' },
];

/** CST do ICMS — regime normal (operações com contribuinte). */
export const CST_CONTRIBUINTE: OpcaoCatalogo[] = [
  { codigo: '000', descricao: '000 - Tributada integralmente' },
  { codigo: '010', descricao: '010 - Tributada com cobrança do ICMS por substituição tributária' },
  { codigo: '020', descricao: '020 - Com redução de base de cálculo' },
  { codigo: '030', descricao: '030 - Isenta ou não tributada e com cobrança do ICMS por ST' },
  { codigo: '040', descricao: '040 - Isenta' },
  { codigo: '041', descricao: '041 - Não tributada' },
  { codigo: '050', descricao: '050 - Suspensa' },
  { codigo: '060', descricao: '060 - ICMS cobrado anteriormente por substituição tributária' },
  { codigo: '070', descricao: '070 - Com redução da base de cálculo e cobrança do ICMS por ST' },
  { codigo: '090', descricao: '090 - Outras' },
];

/** CST do ICMS — regime normal (operações com não contribuinte). */
export const CST_NAO_CONTRIBUINTE: OpcaoCatalogo[] = [
  { codigo: '000', descricao: '000 - Tributada integralmente' },
  { codigo: '010', descricao: '010 - Tributada com cobrança do ICMS por substituição tributária' },
  { codigo: '020', descricao: '020 - Com redução de base de cálculo' },
  { codigo: '030', descricao: '030 - Isenta ou não tributada e com cobrança do ICMS por ST' },
  { codigo: '040', descricao: '040 - Isenta' },
  { codigo: '041', descricao: '041 - Não tributada' },
  { codigo: '050', descricao: '050 - Suspensa' },
  { codigo: '060', descricao: '060 - ICMS cobrado anteriormente por substituição tributária' },
  { codigo: '070', descricao: '070 - Com redução da base de cálculo e cobrança do ICMS por ST' },
  { codigo: '090', descricao: '090 - Outras' },
];

/**
 * CSOSN — Simples Nacional. Os códigos abaixo são códigos CSOSN (não CST):
 * 101 a 103, 201 a 203, 300, 400, 500 e 900.
 */
const CSOSN_OPCOES: OpcaoCatalogo[] = [
  { codigo: '101', descricao: '101 - Tributada com permissão de crédito' },
  { codigo: '102', descricao: '102 - Tributada sem permissão de crédito' },
  { codigo: '103', descricao: '103 - Isenção do ICMS para faixa de receita bruta' },
  {
    codigo: '201',
    descricao: '201 - Tributada com permissão de crédito e com cobrança do ICMS por ST',
  },
  {
    codigo: '202',
    descricao: '202 - Tributada sem permissão de crédito e com cobrança do ICMS por ST',
  },
  {
    codigo: '203',
    descricao: '203 - Isenção do ICMS para faixa de receita bruta e com cobrança do ICMS por ST',
  },
  { codigo: '300', descricao: '300 - Imune' },
  { codigo: '400', descricao: '400 - Não tributada pelo Simples Nacional' },
  { codigo: '500', descricao: '500 - ICMS cobrado anteriormente por ST ou por antecipação' },
  { codigo: '900', descricao: '900 - Outros' },
];

/** CSOSN — Simples Nacional (operações com contribuinte). */
export const CSOSN_CONTRIBUINTE: OpcaoCatalogo[] = CSOSN_OPCOES;

/** CSOSN — Simples Nacional (operações com não contribuinte). */
export const CSOSN_NAO_CONTRIBUINTE: OpcaoCatalogo[] = CSOSN_OPCOES;

/** CFOP de NF-e (operações de saída). */
export const CFOP_NFE: OpcaoCatalogo[] = [
  { codigo: '5101', descricao: '5101 - Venda de produção do estabelecimento' },
  { codigo: '5102', descricao: '5102 - Venda de mercadoria adquirida ou recebida de terceiros' },
  {
    codigo: '5104',
    descricao: '5104 - Venda de produção do estabelecimento efetuada fora do estabelecimento',
  },
  { codigo: '5405', descricao: '5405 - Venda de mercadoria em operação de consignação' },
  { codigo: '5901', descricao: '5901 - Prestação de serviço tributado pelo ISSQN' },
  { codigo: '6101', descricao: '6101 - Venda de produção do estabelecimento' },
  { codigo: '6102', descricao: '6102 - Venda de mercadoria adquirida ou recebida de terceiros' },
  {
    codigo: '6110',
    descricao: '6110 - Venda de mercadoria adquirida ou recebida de terceiros, destinada a não contribuinte',
  },
];

/** CFOP de NFC-e (operações de saída). */
export const CFOP_NFCE: OpcaoCatalogo[] = [
  { codigo: '5101', descricao: '5101 - Venda de produção do estabelecimento' },
  { codigo: '5102', descricao: '5102 - Venda de mercadoria adquirida ou recebida de terceiros' },
  {
    codigo: '5104',
    descricao: '5104 - Venda de produção do estabelecimento efetuada fora do estabelecimento',
  },
  { codigo: '5405', descricao: '5405 - Venda de mercadoria em operação de consignação' },
  { codigo: '5901', descricao: '5901 - Prestação de serviços' },
];

/**
 * Tributações (configurações cadastrais do ICMS). São seletores de menus de
 * tributação do ERP: não executam cálculo de imposto.
 */
export const TRIBUTACOES_ICMS: OpcaoCatalogo[] = [
  { codigo: '000', descricao: '000 - Tributada integralmente' },
  { codigo: '010', descricao: '010 - Tributada com substituição tributária' },
  { codigo: '020', descricao: '020 - Redução de base de cálculo' },
  { codigo: '030', descricao: '030 - Isenta ou não tributada com ST' },
  { codigo: '040', descricao: '040 - Isenta' },
  { codigo: '041', descricao: '041 - Não tributada' },
  { codigo: '050', descricao: '050 - Suspensa' },
  { codigo: '060', descricao: '060 - ICMS cobrado anteriormente por ST' },
  { codigo: '090', descricao: '090 - Outras' },
];

/** Perfis que exigem CSOSN em vez de CST. */
export const PERFIS_SIMPLES_NACIONAL = [
  'SIMPLES_NACIONAL',
  'SIMPLES_NACIONAL_MEI',
  'SIMPLES_NACIONAL_EXCESSO',
];

/** CST do IPI (operações de saída). Catálogo demonstrativo. */
export const CST_IPI: OpcaoCatalogo[] = [
  { codigo: '00', descricao: '00 - Entrada com recuperação de crédito' },
  { codigo: '50', descricao: '50 - Saída tributada' },
  { codigo: '51', descricao: '51 - Saída tributada com alíquota zero' },
  { codigo: '52', descricao: '52 - Saída isenta' },
  { codigo: '53', descricao: '53 - Saída não tributada' },
  { codigo: '99', descricao: '99 - Outras saídas' },
];

/** CST do PIS. Catálogo demonstrativo. */
export const CST_PIS: OpcaoCatalogo[] = [
  { codigo: '01', descricao: '01 - Operação tributável (alíquota básica)' },
  { codigo: '04', descricao: '04 - Operação tributável (monofásica)' },
  { codigo: '06', descricao: '06 - Operação tributável (alíquota zero)' },
  { codigo: '07', descricao: '07 - Operação isenta' },
  { codigo: '08', descricao: '08 - Operação sem incidência' },
  { codigo: '09', descricao: '09 - Operação com suspensão' },
  { codigo: '99', descricao: '99 - Outras operações' },
];

/** CST da COFINS. Catálogo demonstrativo. */
export const CST_COFINS: OpcaoCatalogo[] = [
  { codigo: '01', descricao: '01 - Operação tributável (alíquota básica)' },
  { codigo: '04', descricao: '04 - Operação tributável (monofásica)' },
  { codigo: '06', descricao: '06 - Operação tributável (alíquota zero)' },
  { codigo: '07', descricao: '07 - Operação isenta' },
  { codigo: '08', descricao: '08 - Operação sem incidência' },
  { codigo: '09', descricao: '09 - Operação com suspensão' },
  { codigo: '99', descricao: '99 - Outras operações' },
];

/**
 * Classificação tributária de IBS/CBS (Reforma Tributária).
 * Estrutura cadastral preparatória; não há cálculo fiscal implementado.
 */
export const CLASSIFICACOES_IBS_CBS: OpcaoCatalogo[] = [
  { codigo: '000', descricao: '000 - Tributação integral' },
  { codigo: '010', descricao: '010 - Tributação com alíquota reduzida' },
  { codigo: '020', descricao: '020 - Tributação com alíquota zero' },
  { codigo: '030', descricao: '030 - Isenção' },
  { codigo: '040', descricao: '040 - Não incidência' },
  { codigo: '900', descricao: '900 - Outros' },
];
