import type {
  TipoFornecedor,
  StatusFornecedor,
  IndicadorIE,
  RegimeTributario,
} from '../types';

export interface FornecedorIdentificacaoPF {
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
}

export interface FornecedorIdentificacaoPJ {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  dataAbertura: string;
  naturezaJuridica: string;
}

export interface FornecedorDadosFiscaisPJ {
  inscricaoEstadual: string;
  indicadorIE: IndicadorIE;
  inscricaoMunicipal: string;
  regimeTributario: RegimeTributario;
  suframa: string;
}

export interface FornecedorDadosFiscaisPF {
  inscricaoEstadual: string;
  indicadorIE: IndicadorIE;
  inscricaoMunicipal: string;
  suframa: string;
}

export interface FornecedorContatos {
  telefone: string;
  celular: string;
  email: string;
  emailFinanceiro: string;
  site: string;
}

export interface FornecedorEndereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  pais: string;
}

export interface FornecedorFormInput {
  id: number;
  codigo: string;
  tipo: TipoFornecedor;
  status: StatusFornecedor;
  pf: FornecedorIdentificacaoPF;
  pj: FornecedorIdentificacaoPJ;
  fiscalPF: FornecedorDadosFiscaisPF;
  fiscalPJ: FornecedorDadosFiscaisPJ;
  contatos: FornecedorContatos;
  endereco: FornecedorEndereco;
  observacoes: string;
}

export interface FornecedorNormalizado {
  id: number;
  codigo: string;
  tipo: TipoFornecedor;
  status: StatusFornecedor;
  razaoSocial: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  rg?: string;
  dataNascimento?: string;
  dataAbertura?: string;
  naturezaJuridica?: string;
  inscricaoEstadual: string;
  indicadorIE: IndicadorIE;
  inscricaoMunicipal: string;
  regimeTributario?: RegimeTributario;
  suframa: string;
  telefone: string;
  celular: string;
  email: string;
  emailFinanceiro: string;
  site: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  pais: string;
  observacoes: string;
}

export type ValidationErrors = Record<string, string>;

export interface PrepareFornecedorResult {
  valid: boolean;
  errors: ValidationErrors;
  data: FornecedorNormalizado;
}

export const LIMITE_OBSERVACOES = 2000;

export const UFS_VALIDAS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

export const isValidCPF = (value: string): boolean => {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i], 10) * (10 - i);
  let first = (sum * 10) % 11;
  if (first === 10) first = 0;
  if (first !== parseInt(digits[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i], 10) * (11 - i);
  let second = (sum * 10) % 11;
  if (second === 10) second = 0;
  return second === parseInt(digits[10], 10);
};

export const isValidCNPJ = (value: string): boolean => {
  const digits = onlyDigits(value);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigit = (base: string): number => {
    let factor = base.length - 7;
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i], 10) * factor;
      factor -= 1;
      if (factor < 2) factor = 9;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const first = calcDigit(digits.slice(0, 12));
  if (first !== parseInt(digits[12], 10)) return false;
  const second = calcDigit(digits.slice(0, 13));
  return second === parseInt(digits[13], 10);
};

export const isValidEmail = (value: string): boolean => {
  if (!value.trim()) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
};

export const isValidSite = (value: string): boolean => {
  if (!value.trim()) return true;
  const siteRegex = /^(?:(?:https?:\/\/)?(?:www\.)?)?[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+(?:\/.*)?$/;
  return siteRegex.test(value.trim());
};

export const isValidCEP = (value: string): boolean => {
  if (!value.trim()) return true;
  return onlyDigits(value).length === 8;
};

export const isValidTelefone = (value: string): boolean => {
  if (!value.trim()) return true;
  return onlyDigits(value).length === 10;
};

export const isValidCelular = (value: string): boolean => {
  if (!value.trim()) return true;
  return onlyDigits(value).length === 11;
};

export const validateFornecedor = (input: FornecedorFormInput): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (input.tipo === 'PF') {
    if (!input.pf.nomeCompleto.trim()) errors.nomeCompleto = 'Nome completo é obrigatório';
    if (!input.pf.cpf.trim()) {
      errors.cpf = 'CPF é obrigatório';
    } else if (!isValidCPF(input.pf.cpf)) {
      errors.cpf = 'CPF inválido';
    }
  } else {
    if (!input.pj.razaoSocial.trim()) errors.razaoSocial = 'Razão social é obrigatória';
    if (!input.pj.cnpj.trim()) {
      errors.cnpj = 'CNPJ é obrigatório';
    } else if (!isValidCNPJ(input.pj.cnpj)) {
      errors.cnpj = 'CNPJ inválido';
    }
  }

  if (!isValidTelefone(input.contatos.telefone)) errors.telefone = 'Telefone inválido';
  if (!isValidCelular(input.contatos.celular)) errors.celular = 'Celular inválido';
  if (!isValidEmail(input.contatos.email)) errors.email = 'E-mail inválido';
  if (!isValidEmail(input.contatos.emailFinanceiro)) errors.emailFinanceiro = 'E-mail inválido';
  if (!isValidSite(input.contatos.site)) errors.site = 'Site inválido';
  if (!isValidCEP(input.endereco.cep)) errors.cep = 'CEP inválido';
  if (input.endereco.uf && !UFS_VALIDAS.includes(input.endereco.uf)) errors.uf = 'UF inválida';
  if (input.observacoes.length > LIMITE_OBSERVACOES) {
    errors.observacoes = `Observações excedem ${LIMITE_OBSERVACOES} caracteres`;
  }

  return errors;
};

export const buildFornecedorData = (input: FornecedorFormInput): FornecedorNormalizado => {
  const isPF = input.tipo === 'PF';
  const fiscal = isPF ? input.fiscalPF : input.fiscalPJ;

  return {
    id: input.id,
    codigo: input.codigo,
    tipo: input.tipo,
    status: input.status,
    razaoSocial: isPF ? input.pf.nomeCompleto : input.pj.razaoSocial,
    nomeFantasia: isPF ? undefined : input.pj.nomeFantasia || undefined,
    cpfCnpj: isPF ? input.pf.cpf : input.pj.cnpj,
    rg: isPF ? input.pf.rg || undefined : undefined,
    dataNascimento: isPF ? input.pf.dataNascimento || undefined : undefined,
    dataAbertura: isPF ? undefined : input.pj.dataAbertura || undefined,
    naturezaJuridica: isPF ? undefined : input.pj.naturezaJuridica || undefined,
    inscricaoEstadual: fiscal.inscricaoEstadual,
    indicadorIE: fiscal.indicadorIE,
    inscricaoMunicipal: fiscal.inscricaoMunicipal,
    regimeTributario: isPF ? undefined : input.fiscalPJ.regimeTributario || undefined,
    suframa: fiscal.suframa,
    telefone: input.contatos.telefone,
    celular: input.contatos.celular,
    email: input.contatos.email,
    emailFinanceiro: input.contatos.emailFinanceiro,
    site: input.contatos.site,
    cep: input.endereco.cep,
    logradouro: input.endereco.logradouro,
    numero: input.endereco.numero,
    complemento: input.endereco.complemento,
    bairro: input.endereco.bairro,
    cidade: input.endereco.cidade,
    uf: input.endereco.uf,
    pais: input.endereco.pais,
    observacoes: input.observacoes,
  };
};

export const prepareFornecedor = (input: FornecedorFormInput): PrepareFornecedorResult => {
  const errors = validateFornecedor(input);
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: buildFornecedorData(input),
  };
};
