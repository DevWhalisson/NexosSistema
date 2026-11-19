export type TipoFornecedor = 'PF' | 'PJ';

export type StatusFornecedor = 'Ativo' | 'Inativo' | 'Bloqueado';

export type IndicadorIE = '' | 'contribuinte' | 'isento' | 'nao_contribuinte';

export type RegimeTributario =
  | ''
  | 'simples_nacional'
  | 'simples_nacional_mei'
  | 'lucro_presumido'
  | 'lucro_real'
  | 'nao_informado';

export interface Fornecedor {
  id: number;
  codigo: string;
  tipo: TipoFornecedor;
  razaoSocial: string;
  nomeFantasia?: string;
  cpfCnpj: string;
  categoria: string;
  telefone: string;
  email?: string;
  cidade: string;
  uf: string;
  status: StatusFornecedor;
  dataCadastro: string;
  // Identificação (Pessoa Jurídica)
  dataAbertura?: string;
  naturezaJuridica?: string;
  // Identificação (Pessoa Física)
  rg?: string;
  dataNascimento?: string;
  // Inscrições e dados fiscais
  inscricaoEstadual?: string;
  indicadorIE?: IndicadorIE;
  inscricaoMunicipal?: string;
  regimeTributario?: RegimeTributario;
  suframa?: string;
  // Contatos
  celular?: string;
  emailFinanceiro?: string;
  site?: string;
  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  pais?: string;
  // Observações
  observacoes?: string;
}
