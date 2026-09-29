import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  User,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  MessageSquare,
  AlertCircle,
  ArrowLeft,
  Save,
  CheckCircle,
  X
} from 'lucide-react';
import { clientesData } from '../data/clientes';
import './FichaCliente.css';

type TipoPessoa = 'PF' | 'PJ';
type StatusCliente = 'Ativo' | 'Inativo' | 'Bloqueado';
type Sexo = '' | 'M' | 'F' | 'O';
type IndicadorIE = '' | 'C' | 'CI' | 'NC';

interface IdentificacaoData {
  tipoPessoa: TipoPessoa;
  status: StatusCliente;
  nomeCompleto: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  sexo: Sexo;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  ie: string;
  im: string;
  indicadorIE: IndicadorIE;
}

interface ContatosData {
  telefone: string;
  celular: string;
  emailPrincipal: string;
  emailFinanceiro: string;
  nomeContato: string;
  cargoDepartamento: string;
}

interface EnderecoData {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  pais: string;
}

interface DadosFiscaisData {
  consumidorFinal: 'S' | 'N';
}

interface InfoComerciaisData {
  vendedorResponsavel: string;
  tabelaPreco: string;
  limiteCredito: string;
  condicaoPagamento: string;
  diaVencimento: string;
}

interface SectionConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
}

type ValidationErrors = Record<string, string>;

const sections: SectionConfig[] = [
  { id: 'identificacao', title: 'Identificacao', icon: <User size={18} />, iconColor: 'blue' },
  { id: 'contatos', title: 'Contatos', icon: <Phone size={18} />, iconColor: 'green' },
  { id: 'endereco', title: 'Endereco', icon: <MapPin size={18} />, iconColor: 'orange' },
  { id: 'dados-fiscais', title: 'Dados fiscais', icon: <FileText size={18} />, iconColor: 'purple' },
  { id: 'info-comerciais', title: 'Informacoes comerciais', icon: <Briefcase size={18} />, iconColor: 'teal' },
  { id: 'observacoes', title: 'Observacoes', icon: <MessageSquare size={18} />, iconColor: 'pink' },
];

function validateCPF(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(digits[10]);
}

function validateCNPJ(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * weights1[i];
  let rest = sum % 11;
  const d1 = rest < 2 ? 0 : 11 - rest;
  if (parseInt(digits[12]) !== d1) return false;
  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(digits[i]) * weights2[i];
  rest = sum % 11;
  const d2 = rest < 2 ? 0 : 11 - rest;
  return parseInt(digits[13]) === d2;
}

function validateEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

function validateCEP(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length === 8;
}

export const FichaCliente: React.FC = () => {
  const { clienteId } = useParams<{ clienteId: string }>();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identificacao: true,
    contatos: false,
    endereco: false,
    'dados-fiscais': false,
    'info-comerciais': false,
    observacoes: false,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const [identificacao, setIdentificacao] = useState<IdentificacaoData>(() => {
    const id = Number(clienteId);
    const cliente = clientesData.find((c) => c.id === id);
    if (cliente) {
      return {
        tipoPessoa: cliente.tipo,
        status: cliente.status,
        nomeCompleto: cliente.nome,
        cpf: cliente.tipo === 'PF' ? cliente.cpfCnpj : '',
        rg: '',
        dataNascimento: '',
        sexo: '' as Sexo,
        razaoSocial: cliente.tipo === 'PJ' ? cliente.nome : '',
        nomeFantasia: '',
        cnpj: cliente.tipo === 'PJ' ? cliente.cpfCnpj : '',
        ie: '',
        im: '',
        indicadorIE: '' as IndicadorIE,
      };
    }
    return {
      tipoPessoa: 'PF',
      status: 'Ativo',
      nomeCompleto: '',
      cpf: '',
      rg: '',
      dataNascimento: '',
      sexo: '' as Sexo,
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      ie: '',
      im: '',
      indicadorIE: '' as IndicadorIE,
    };
  });

  const [contatos, setContatos] = useState<ContatosData>(() => {
    const id = Number(clienteId);
    const cliente = clientesData.find((c) => c.id === id);
    if (cliente) {
      return {
        telefone: cliente.telefone,
        celular: '',
        emailPrincipal: cliente.email,
        emailFinanceiro: '',
        nomeContato: '',
        cargoDepartamento: '',
      };
    }
    return {
      telefone: '',
      celular: '',
      emailPrincipal: '',
      emailFinanceiro: '',
      nomeContato: '',
      cargoDepartamento: '',
    };
  });

  const [endereco, setEndereco] = useState<EnderecoData>({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    pais: 'Brasil',
  });

  const [dadosFiscais, setDadosFiscais] = useState<DadosFiscaisData>({
    consumidorFinal: 'N',
  });

  const [infoComerciais, setInfoComerciais] = useState<InfoComerciaisData>({
    vendedorResponsavel: '',
    tabelaPreco: 'Tabela padrao',
    limiteCredito: 'R$ 0,00',
    condicaoPagamento: '',
    diaVencimento: '',
  });

  const [observacoes, setObservacoes] = useState('');

  const id = Number(clienteId);
  const cliente = clientesData.find((c) => c.id === id);
  const isNew = !cliente;

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleCancelar = () => {
    navigate('/pessoas/clientes');
  };

  const updateIdentificacao = (field: keyof IdentificacaoData, value: string) => {
    setIdentificacao((prev) => ({ ...prev, [field]: value }));
    if (submitted) validateForm();
  };

  const updateContatos = (field: keyof ContatosData, value: string) => {
    setContatos((prev) => ({ ...prev, [field]: value }));
    if (submitted) validateForm();
  };

  const updateEndereco = (field: keyof EnderecoData, value: string) => {
    setEndereco((prev) => ({ ...prev, [field]: value }));
    if (submitted) validateForm();
  };

  const updateDadosFiscais = (field: keyof DadosFiscaisData, value: DadosFiscaisData[keyof DadosFiscaisData]) => {
    setDadosFiscais((prev) => ({ ...prev, [field]: value }));
  };

  const updateInfoComerciais = (field: keyof InfoComerciaisData, value: string) => {
    setInfoComerciais((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (identificacao.tipoPessoa === 'PF') {
      if (!identificacao.nomeCompleto.trim()) {
        newErrors['nomeCompleto'] = 'Nome completo e obrigatorio';
      }
      if (!identificacao.cpf.trim()) {
        newErrors['cpf'] = 'CPF e obrigatorio';
      } else if (!validateCPF(identificacao.cpf)) {
        newErrors['cpf'] = 'CPF invalido';
      }
    } else {
      if (!identificacao.razaoSocial.trim()) {
        newErrors['razaoSocial'] = 'Razao social e obrigatoria';
      }
      if (!identificacao.cnpj.trim()) {
        newErrors['cnpj'] = 'CNPJ e obrigatorio';
      } else if (!validateCNPJ(identificacao.cnpj)) {
        newErrors['cnpj'] = 'CNPJ invalido';
      }
    }

    if (contatos.emailPrincipal && !validateEmail(contatos.emailPrincipal)) {
      newErrors['emailPrincipal'] = 'E-mail invalido';
    }
    if (contatos.emailFinanceiro && !validateEmail(contatos.emailFinanceiro)) {
      newErrors['emailFinanceiro'] = 'E-mail invalido';
    }
    if (contatos.telefone && !validatePhone(contatos.telefone)) {
      newErrors['telefone'] = 'Telefone invalido';
    }
    if (contatos.celular && !validatePhone(contatos.celular)) {
      newErrors['celular'] = 'Celular invalido';
    }
    if (endereco.cep && !validateCEP(endereco.cep)) {
      newErrors['cep'] = 'CEP invalido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [identificacao, contatos, endereco]);

  const handleSalvar = () => {
    setSubmitted(true);
    const isValid = validateForm();
    if (!isValid) {
      showToast('Corrija os erros antes de salvar', 'error');
      return;
    }
    showToast('Cliente salvo com sucesso!');
    setTimeout(() => {
      navigate('/pessoas/clientes');
    }, 1500);
  };

  const renderFieldError = (field: string) => {
    if (!errors[field]) return null;
    return <span className="ficha-field-error">{errors[field]}</span>;
  };

  const renderInputClass = (field: string) => {
    return `ficha-input ${errors[field] ? 'has-error' : ''}`;
  };

  if (isNaN(id) || (!isNew && !cliente)) {
    return (
      <div className="ficha-cliente-page">
        <div className="ficha-not-found">
          <div className="ficha-not-found-content">
            <div className="ficha-not-found-icon">
              <AlertCircle size={40} />
            </div>
            <h2 className="ficha-not-found-title">Cliente nao encontrado</h2>
            <p className="ficha-not-found-desc">
              O cliente com ID {clienteId} nao foi encontrado no sistema.
            </p>
            <button
              className="ficha-not-found-btn"
              onClick={() => navigate('/pessoas/clientes')}
            >
              <ArrowLeft size={16} />
              Voltar para clientes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pageTitle = isNew ? 'Cadastrar cliente' : cliente!.nome;
  const pageSubtitle = isNew
    ? 'Preencha os dados para cadastrar um novo cliente'
    : `Cliente #${cliente!.id}`;

  const renderIdentificacao = () => (
    <>
      <div className="ficha-field" style={{ maxWidth: 200 }}>
        <label className="ficha-label">Tipo de pessoa</label>
        <select
          className="ficha-select"
          value={identificacao.tipoPessoa}
          onChange={(e) => updateIdentificacao('tipoPessoa', e.target.value as TipoPessoa)}
        >
          <option value="PF">Pessoa Fisica</option>
          <option value="PJ">Pessoa Juridica</option>
        </select>
      </div>

      <div className="ficha-form-row cols-2">
        <div className="ficha-field">
          <label className="ficha-label">Codigo</label>
          <input
            className="ficha-input"
            type="text"
            value={String(id).padStart(4, '0')}
            readOnly
          />
        </div>
        <div className="ficha-field">
          <label className="ficha-label">Status</label>
          <select
            className="ficha-select"
            value={identificacao.status}
            onChange={(e) => updateIdentificacao('status', e.target.value)}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Bloqueado">Bloqueado</option>
          </select>
        </div>
      </div>

      <hr className="ficha-form-divider" />

      {identificacao.tipoPessoa === 'PF' ? (
        <>
          <div className="ficha-form-row cols-1">
            <div className="ficha-field">
              <label className="ficha-label">
                Nome completo <span className="required">*</span>
              </label>
              <input
                className={renderInputClass('nomeCompleto')}
                type="text"
                placeholder="Nome completo do cliente"
                value={identificacao.nomeCompleto}
                onChange={(e) => updateIdentificacao('nomeCompleto', e.target.value)}
              />
              {renderFieldError('nomeCompleto')}
            </div>
          </div>

          <div className="ficha-form-row cols-3">
            <div className="ficha-field">
              <label className="ficha-label">
                CPF <span className="required">*</span>
              </label>
              <input
                className={renderInputClass('cpf')}
                type="text"
                placeholder="000.000.000-00"
                value={identificacao.cpf}
                onChange={(e) => updateIdentificacao('cpf', e.target.value)}
              />
              {renderFieldError('cpf')}
            </div>
            <div className="ficha-field">
              <label className="ficha-label">RG</label>
              <input
                className="ficha-input"
                type="text"
                placeholder="00.000.000-0"
                value={identificacao.rg}
                onChange={(e) => updateIdentificacao('rg', e.target.value)}
              />
            </div>
            <div className="ficha-field">
              <label className="ficha-label">Data de nascimento</label>
              <input
                className="ficha-input"
                type="date"
                value={identificacao.dataNascimento}
                onChange={(e) => updateIdentificacao('dataNascimento', e.target.value)}
              />
            </div>
          </div>

          <div className="ficha-form-row cols-1">
            <div className="ficha-field">
              <label className="ficha-label">Sexo</label>
              <select
                className="ficha-select"
                value={identificacao.sexo}
                onChange={(e) => updateIdentificacao('sexo', e.target.value)}
              >
                <option value="">Nao informado</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
                <option value="O">Outro</option>
              </select>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="ficha-form-row cols-2">
            <div className="ficha-field">
              <label className="ficha-label">
                Razao social <span className="required">*</span>
              </label>
              <input
                className={renderInputClass('razaoSocial')}
                type="text"
                placeholder="Razao social da empresa"
                value={identificacao.razaoSocial}
                onChange={(e) => updateIdentificacao('razaoSocial', e.target.value)}
              />
              {renderFieldError('razaoSocial')}
            </div>
            <div className="ficha-field">
              <label className="ficha-label">Nome fantasia</label>
              <input
                className="ficha-input"
                type="text"
                placeholder="Nome fantasia"
                value={identificacao.nomeFantasia}
                onChange={(e) => updateIdentificacao('nomeFantasia', e.target.value)}
              />
            </div>
          </div>

          <div className="ficha-form-row cols-3">
            <div className="ficha-field">
              <label className="ficha-label">
                CNPJ <span className="required">*</span>
              </label>
              <input
                className={renderInputClass('cnpj')}
                type="text"
                placeholder="00.000.000/0000-00"
                value={identificacao.cnpj}
                onChange={(e) => updateIdentificacao('cnpj', e.target.value)}
              />
              {renderFieldError('cnpj')}
            </div>
            <div className="ficha-field">
              <label className="ficha-label">Inscricao Estadual</label>
              <input
                className="ficha-input"
                type="text"
                placeholder="IE"
                value={identificacao.ie}
                onChange={(e) => updateIdentificacao('ie', e.target.value)}
              />
            </div>
            <div className="ficha-field">
              <label className="ficha-label">Indicador IE</label>
              <select
                className="ficha-select"
                value={identificacao.indicadorIE}
                onChange={(e) => updateIdentificacao('indicadorIE', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="C">Contribuinte</option>
                <option value="CI">Contribuinte isento</option>
                <option value="NC">Nao contribuinte</option>
              </select>
            </div>
          </div>

          <div className="ficha-form-row cols-1">
            <div className="ficha-field">
              <label className="ficha-label">Inscricao Municipal</label>
              <input
                className="ficha-input"
                type="text"
                placeholder="IM"
                value={identificacao.im}
                onChange={(e) => updateIdentificacao('im', e.target.value)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderContatos = () => (
    <>
      <div className="ficha-form-row cols-2">
        <div className="ficha-field">
          <label className="ficha-label">Telefone</label>
          <input
            className={renderInputClass('telefone')}
            type="text"
            placeholder="(00) 0000-0000"
            value={contatos.telefone}
            onChange={(e) => updateContatos('telefone', e.target.value)}
          />
          {renderFieldError('telefone')}
        </div>
        <div className="ficha-field">
          <label className="ficha-label">Celular</label>
          <input
            className={renderInputClass('celular')}
            type="text"
            placeholder="(00) 00000-0000"
            value={contatos.celular}
            onChange={(e) => updateContatos('celular', e.target.value)}
          />
          {renderFieldError('celular')}
        </div>
      </div>

      <div className="ficha-form-row cols-2">
        <div className="ficha-field">
          <label className="ficha-label">E-mail principal</label>
          <input
            className={renderInputClass('emailPrincipal')}
            type="email"
            placeholder="email@exemplo.com.br"
            value={contatos.emailPrincipal}
            onChange={(e) => updateContatos('emailPrincipal', e.target.value)}
          />
          {renderFieldError('emailPrincipal')}
        </div>
        <div className="ficha-field">
          <label className="ficha-label">E-mail financeiro</label>
          <input
            className={renderInputClass('emailFinanceiro')}
            type="email"
            placeholder="financeiro@exemplo.com.br"
            value={contatos.emailFinanceiro}
            onChange={(e) => updateContatos('emailFinanceiro', e.target.value)}
          />
          {renderFieldError('emailFinanceiro')}
        </div>
      </div>

      <hr className="ficha-form-divider" />

      <div className="ficha-form-row cols-2">
        <div className="ficha-field">
          <label className="ficha-label">Nome do contato</label>
          <input
            className="ficha-input"
            type="text"
            placeholder="Nome do responsavel"
            value={contatos.nomeContato}
            onChange={(e) => updateContatos('nomeContato', e.target.value)}
          />
        </div>
        <div className="ficha-field">
          <label className="ficha-label">Cargo / Departamento</label>
          <input
            className="ficha-input"
            type="text"
            placeholder="Ex: Gerente Comercial"
            value={contatos.cargoDepartamento}
            onChange={(e) => updateContatos('cargoDepartamento', e.target.value)}
          />
        </div>
      </div>
    </>
  );

  const renderEndereco = () => (
    <>
      <div className="ficha-form-row">
        <div className="ficha-field">
          <label className="ficha-label">CEP</label>
          <input
            className={renderInputClass('cep')}
            type="text"
            placeholder="00000-000"
            value={endereco.cep}
            onChange={(e) => updateEndereco('cep', e.target.value)}
          />
          {renderFieldError('cep')}
        </div>
        <div className="ficha-field span-2">
          <label className="ficha-label">Logradouro</label>
          <input
            className="ficha-input"
            type="text"
            placeholder="Rua, Avenida, Travessa..."
            value={endereco.logradouro}
            onChange={(e) => updateEndereco('logradouro', e.target.value)}
          />
        </div>
      </div>

      <div className="ficha-form-row cols-3">
        <div className="ficha-field">
          <label className="ficha-label">Numero</label>
          <input
            className="ficha-input"
            type="text"
            placeholder="Numero"
            value={endereco.numero}
            onChange={(e) => updateEndereco('numero', e.target.value)}
          />
        </div>
        <div className="ficha-field">
          <label className="ficha-label">Complemento</label>
          <input
            className="ficha-input"
            type="text"
            placeholder="Bloco, Sala, Andar..."
            value={endereco.complemento}
            onChange={(e) => updateEndereco('complemento', e.target.value)}
          />
        </div>
        <div className="ficha-field">
          <label className="ficha-label">Bairro</label>
          <input
            className="ficha-input"
            type="text"
            placeholder="Bairro"
            value={endereco.bairro}
            onChange={(e) => updateEndereco('bairro', e.target.value)}
          />
        </div>
      </div>

      <div className="ficha-form-row">
        <div className="ficha-field span-2">
          <label className="ficha-label">Cidade</label>
          <input
            className="ficha-input"
            type="text"
            placeholder="Cidade"
            value={endereco.cidade}
            onChange={(e) => updateEndereco('cidade', e.target.value)}
          />
        </div>
        <div className="ficha-field">
          <label className="ficha-label">UF</label>
          <select
            className="ficha-select"
            value={endereco.uf}
            onChange={(e) => updateEndereco('uf', e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapa</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceara</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espirito Santo</option>
            <option value="GO">Goias</option>
            <option value="MA">Maranhao</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Para</option>
            <option value="PB">Paraiba</option>
            <option value="PR">Parana</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piaui</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondonia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">Sao Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
      </div>

      <div className="ficha-form-row cols-1">
        <div className="ficha-field">
          <label className="ficha-label">Pais</label>
          <input
            className="ficha-input"
            type="text"
            value={endereco.pais}
            onChange={(e) => updateEndereco('pais', e.target.value)}
          />
        </div>
      </div>
    </>
  );

  const renderDadosFiscais = () => (
    <>
      {identificacao.tipoPessoa === 'PJ' && (
        <>
          <div className="ficha-form-row cols-3">
            <div className="ficha-field">
              <label className="ficha-label">Inscricao Estadual</label>
              <input
                className="ficha-input"
                type="text"
                placeholder="IE"
                value={identificacao.ie}
                readOnly
              />
            </div>
            <div className="ficha-field">
              <label className="ficha-label">Inscricao Municipal</label>
              <input
                className="ficha-input"
                type="text"
                placeholder="IM"
                value={identificacao.im}
                readOnly
              />
            </div>
            <div className="ficha-field">
              <label className="ficha-label">Indicador de IE</label>
              <select
                className="ficha-select"
                value={identificacao.indicadorIE}
                disabled
              >
                <option value="">Selecione na Identificacao</option>
                <option value="C">Contribuinte</option>
                <option value="CI">Contribuinte isento</option>
                <option value="NC">Nao contribuinte</option>
              </select>
            </div>
          </div>

          <hr className="ficha-form-divider" />
        </>
      )}

      <div className="ficha-form-row cols-2">
        <div className="ficha-field">
          <label className="ficha-label">Consumidor final</label>
          <select
            className="ficha-select"
            value={dadosFiscais.consumidorFinal}
            onChange={(e) => updateDadosFiscais('consumidorFinal', e.target.value as 'S' | 'N')}
          >
            <option value="N">Nao</option>
            <option value="S">Sim</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderInfoComerciais = () => (
    <>
      <div className="ficha-form-row cols-2">
        <div className="ficha-field">
          <label className="ficha-label">Vendedor responsavel</label>
          <select
            className="ficha-select"
            value={infoComerciais.vendedorResponsavel}
            onChange={(e) => updateInfoComerciais('vendedorResponsavel', e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="Administrador">Administrador</option>
            <option value="Cecilia Torres">Cecilia Torres</option>
            <option value="Gabriel Souza">Gabriel Souza</option>
            <option value="Juliane Alves">Juliane Alves</option>
            <option value="Rafael Lima">Rafael Lima</option>
          </select>
        </div>
        <div className="ficha-field">
          <label className="ficha-label">Tabela de preco</label>
          <select
            className="ficha-select"
            value={infoComerciais.tabelaPreco}
            onChange={(e) => updateInfoComerciais('tabelaPreco', e.target.value)}
          >
            <option value="Tabela padrao">Tabela padrao</option>
            <option value="Atacado">Atacado</option>
            <option value="Varejo">Varejo</option>
          </select>
        </div>
      </div>

      <div className="ficha-form-row cols-2">
        <div className="ficha-field">
          <label className="ficha-label">Limite de credito</label>
          <input
            className="ficha-input"
            type="text"
            placeholder="R$ 0,00"
            value={infoComerciais.limiteCredito}
            onChange={(e) => updateInfoComerciais('limiteCredito', e.target.value)}
          />
        </div>
        <div className="ficha-field">
          <label className="ficha-label">Condicao de pagamento padrao</label>
          <select
            className="ficha-select"
            value={infoComerciais.condicaoPagamento}
            onChange={(e) => updateInfoComerciais('condicaoPagamento', e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="A vista">A vista</option>
            <option value="7 dias">7 dias</option>
            <option value="14 dias">14 dias</option>
            <option value="28 dias">28 dias</option>
            <option value="30 dias">30 dias</option>
            <option value="30/60 dias">30/60 dias</option>
          </select>
        </div>
      </div>

      <div className="ficha-form-row cols-1">
        <div className="ficha-field">
          <label className="ficha-label">Dia preferencial de vencimento</label>
          <input
            className="ficha-input"
            type="number"
            min="1"
            max="31"
            placeholder="Dia do mes (opcional)"
            value={infoComerciais.diaVencimento}
            onChange={(e) => updateInfoComerciais('diaVencimento', e.target.value)}
          />
        </div>
      </div>
    </>
  );

  const renderObservacoes = () => (
    <div className="ficha-form-row cols-1">
      <div className="ficha-field">
        <label className="ficha-label">Observacoes internas</label>
        <textarea
          className="ficha-textarea"
          placeholder="Adicione informacoes importantes sobre este cliente..."
          rows={5}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>
    </div>
  );

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'identificacao': return renderIdentificacao();
      case 'contatos': return renderContatos();
      case 'endereco': return renderEndereco();
      case 'dados-fiscais': return renderDadosFiscais();
      case 'info-comerciais': return renderInfoComerciais();
      case 'observacoes': return renderObservacoes();
      default: return null;
    }
  };

  return (
    <div className="ficha-cliente-page">
      {toast && (
        <div className={`ficha-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
          <button className="ficha-toast-close" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <nav className="ficha-breadcrumb">
        <button className="ficha-breadcrumb-link" onClick={() => navigate('/pessoas')}>
          Cadastros
        </button>
        <span className="ficha-breadcrumb-separator">/</span>
        <button className="ficha-breadcrumb-link" onClick={() => navigate('/pessoas/clientes')}>
          Clientes
        </button>
        <span className="ficha-breadcrumb-separator">/</span>
        <span className="ficha-breadcrumb-current">Cadastro</span>
      </nav>

      <div className="ficha-header">
        <div className="ficha-header-left">
          <h1 className="ficha-page-title">{pageTitle}</h1>
          <p className="ficha-page-subtitle">{pageSubtitle}</p>
        </div>
      </div>

      {!isNew && (
        <div className="ficha-control-data">
          <span>Cadastrado em: 15/08/2026 as 14:32</span>
          <span className="ficha-control-separator">|</span>
          <span>Ultima alteracao: 18/08/2026 as 10:15</span>
          <span className="ficha-control-separator">|</span>
          <span>Criado por: Administrador</span>
        </div>
      )}

      <div className="ficha-sections">
        {sections.map((section) => (
          <div className="ficha-section" key={section.id}>
            <div className="ficha-section-header" onClick={() => toggleSection(section.id)}>
              <div className="ficha-section-header-left">
                <div className={`ficha-section-icon ${section.iconColor}`}>
                  {section.icon}
                </div>
                <h3 className="ficha-section-title">{section.title}</h3>
              </div>
              <ChevronDown
                size={18}
                className={`ficha-section-chevron ${openSections[section.id] ? 'open' : ''}`}
              />
            </div>
            {openSections[section.id] && (
              <div className="ficha-section-body">
                {renderSectionContent(section.id)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="ficha-bottom-actions">
        <button className="btn-cancelar" onClick={handleCancelar}>
          Cancelar
        </button>
        <button className="btn-salvar" onClick={handleSalvar}>
          <Save size={16} />
          Salvar cliente
        </button>
      </div>
    </div>
  );
};
