import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Building2,
  FileText,
  Phone,
  MapPin,
  ClipboardList,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import {
  buscarFornecedorPorId,
  cadastrarFornecedor,
  atualizarFornecedor,
} from '../../../services/fornecedorStorage';
import { isFornecedorIdNovo, formatarCodigoFornecedor } from '../../../utils/fornecedorId';
import type {
  TipoFornecedor,
  StatusFornecedor,
  IndicadorIE,
  RegimeTributario,
} from '../../../types';
import {
  onlyDigits,
  prepareFornecedor,
  LIMITE_OBSERVACOES,
  type FornecedorIdentificacaoPF,
  type FornecedorIdentificacaoPJ,
  type FornecedorDadosFiscaisPJ,
  type FornecedorDadosFiscaisPF,
  type FornecedorContatos,
  type FornecedorEndereco,
  type FornecedorFormInput,
  type ValidationErrors,
} from '../../../utils/fornecedorForm';
import './FichaFornecedor.css';

interface FornecedorSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
}

type IdentificacaoPF = FornecedorIdentificacaoPF;
type IdentificacaoPJ = FornecedorIdentificacaoPJ;
type DadosFiscaisPJ = FornecedorDadosFiscaisPJ;
type DadosFiscaisPF = FornecedorDadosFiscaisPF;
type DadosContatos = FornecedorContatos;
type DadosEndereco = FornecedorEndereco;

interface DadosObservacoes {
  observacoes: string;
}

const sections: FornecedorSection[] = [
  {
    id: 'identificacao',
    title: 'Identificação do fornecedor',
    icon: <Building2 size={18} />,
    iconColor: 'blue',
  },
  {
    id: 'fiscal',
    title: 'Inscrições e dados fiscais',
    icon: <FileText size={18} />,
    iconColor: 'purple',
  },
  {
    id: 'contatos',
    title: 'Contatos',
    icon: <Phone size={18} />,
    iconColor: 'green',
  },
  {
    id: 'endereco',
    title: 'Endereço',
    icon: <MapPin size={18} />,
    iconColor: 'orange',
  },
  {
    id: 'controle',
    title: 'Observações',
    icon: <ClipboardList size={18} />,
    iconColor: 'red',
  },
];

const formatCPF = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatCNPJ = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
};

const sanitizeInscricao = (value: string): string =>
  value.replace(/[^A-Za-z0-9./-]/g, '').toUpperCase();

const formatCEP = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const formatTelefone = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 10);
  if (digits.length <= 2) return `(${digits})`;
  const ddd = digits.slice(0, 2);
  const numero = digits.slice(2);
  if (numero.length <= 4) return `(${ddd}) ${numero}`;
  return `(${ddd}) ${numero.slice(0, 4)}-${numero.slice(4)}`;
};

const formatCelular = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return `(${digits})`;
  const ddd = digits.slice(0, 2);
  const numero = digits.slice(2);
  if (numero.length <= 5) return `(${ddd}) ${numero}`;
  return `(${ddd}) ${numero.slice(0, 5)}-${numero.slice(5)}`;
};

export const FichaFornecedor: React.FC = () => {
  const { fornecedorId } = useParams<{ fornecedorId: string }>();
  const navigate = useNavigate();

  const id = Number(fornecedorId);
  const fornecedor = buscarFornecedorPorId(id);
  const isNew = !fornecedor && isFornecedorIdNovo(id);
  const notFound = Number.isNaN(id) || (!fornecedor && !isNew);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identificacao: true,
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const [tipoPessoa, setTipoPessoa] = useState<TipoFornecedor>(
    () => fornecedor?.tipo ?? 'PJ'
  );
  const [status, setStatus] = useState<StatusFornecedor>(
    () => fornecedor?.status ?? 'Ativo'
  );

  const [pf, setPf] = useState<IdentificacaoPF>(() => ({
    nomeCompleto: fornecedor?.tipo === 'PF' ? fornecedor.razaoSocial : '',
    cpf: fornecedor?.tipo === 'PF' ? fornecedor.cpfCnpj : '',
    rg: fornecedor?.rg ?? '',
    dataNascimento: fornecedor?.dataNascimento ?? '',
  }));

  const [pj, setPj] = useState<IdentificacaoPJ>(() => ({
    razaoSocial: fornecedor?.tipo === 'PJ' ? fornecedor.razaoSocial : '',
    nomeFantasia: fornecedor?.tipo === 'PJ' ? fornecedor.nomeFantasia ?? '' : '',
    cnpj: fornecedor?.tipo === 'PJ' ? fornecedor.cpfCnpj : '',
    dataAbertura: fornecedor?.dataAbertura ?? '',
    naturezaJuridica: fornecedor?.naturezaJuridica ?? '',
  }));

  const [fiscalPJ, setFiscalPJ] = useState<DadosFiscaisPJ>(() => ({
    inscricaoEstadual: fornecedor?.tipo === 'PJ' ? fornecedor.inscricaoEstadual ?? '' : '',
    indicadorIE: fornecedor?.tipo === 'PJ' ? fornecedor.indicadorIE ?? '' : '',
    inscricaoMunicipal: fornecedor?.tipo === 'PJ' ? fornecedor.inscricaoMunicipal ?? '' : '',
    regimeTributario: fornecedor?.tipo === 'PJ' ? fornecedor.regimeTributario ?? '' : '',
    suframa: fornecedor?.tipo === 'PJ' ? fornecedor.suframa ?? '' : '',
  }));

  const [fiscalPF, setFiscalPF] = useState<DadosFiscaisPF>(() => ({
    inscricaoEstadual: fornecedor?.tipo === 'PF' ? fornecedor.inscricaoEstadual ?? '' : '',
    indicadorIE: fornecedor?.tipo === 'PF' ? fornecedor.indicadorIE ?? '' : '',
    inscricaoMunicipal: fornecedor?.tipo === 'PF' ? fornecedor.inscricaoMunicipal ?? '' : '',
    suframa: fornecedor?.tipo === 'PF' ? fornecedor.suframa ?? '' : '',
  }));

  const [contatos, setContatos] = useState<DadosContatos>(() => ({
    telefone: fornecedor?.telefone ?? '',
    celular: fornecedor?.celular ?? '',
    email: fornecedor?.email ?? '',
    emailFinanceiro: fornecedor?.emailFinanceiro ?? '',
    site: fornecedor?.site ?? '',
  }));

  const [endereco, setEndereco] = useState<DadosEndereco>(() => ({
    cep: fornecedor?.cep ?? '',
    logradouro: fornecedor?.logradouro ?? '',
    numero: fornecedor?.numero ?? '',
    complemento: fornecedor?.complemento ?? '',
    bairro: fornecedor?.bairro ?? '',
    cidade: fornecedor?.cidade ?? '',
    uf: fornecedor?.uf ?? '',
    pais: fornecedor?.pais ?? 'Brasil',
  }));

  const [observacoes, setObservacoes] = useState<DadosObservacoes>(() => ({
    observacoes: fornecedor?.observacoes ?? '',
  }));

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const formInput = useMemo<FornecedorFormInput>(
    () => ({
      id: Number.isNaN(id) ? 0 : id,
      codigo: formatarCodigoFornecedor(Number.isNaN(id) ? 0 : id),
      tipo: tipoPessoa,
      status,
      pf,
      pj,
      fiscalPF,
      fiscalPJ,
      contatos,
      endereco,
      observacoes: observacoes.observacoes,
    }),
    [id, tipoPessoa, status, pf, pj, fiscalPF, fiscalPJ, contatos, endereco, observacoes]
  );

  const prepared = useMemo(() => prepareFornecedor(formInput), [formInput]);

  const errors: ValidationErrors = prepared.errors;

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleCancelar = () => {
    if (dirty && !window.confirm('Há alterações não salvas. Deseja descartá-las?')) return;
    navigate('/cadastros/fornecedores');
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const updatePF = (field: keyof IdentificacaoPF, value: string) => {
    setPf((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const updatePJ = (field: keyof IdentificacaoPJ, value: string) => {
    setPj((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const updateFiscalPJ = <K extends keyof DadosFiscaisPJ>(field: K, value: DadosFiscaisPJ[K]) => {
    setFiscalPJ((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const updateFiscalPF = <K extends keyof DadosFiscaisPF>(field: K, value: DadosFiscaisPF[K]) => {
    setFiscalPF((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const updateContatos = <K extends keyof DadosContatos>(field: K, value: DadosContatos[K]) => {
    setContatos((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const updateEndereco = <K extends keyof DadosEndereco>(field: K, value: DadosEndereco[K]) => {
    setEndereco((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const updateObservacoes = (value: string) => {
    setObservacoes({ observacoes: value.slice(0, LIMITE_OBSERVACOES) });
    setDirty(true);
  };

  const renderFieldError = (field: string) => {
    if ((!touched[field] && !submitted) || !errors[field]) return null;
    return <span className="ff-field-error">{errors[field]}</span>;
  };

  const inputClass = (field: string) =>
    `ff-input ${(touched[field] || submitted) && errors[field] ? 'has-error' : ''}`;

  const handleSalvar = () => {
    if (saving) return;

    setSubmitted(true);
    if (!prepared.valid) {
      showToast('Corrija os erros antes de salvar', 'error');
      return;
    }

    setSaving(true);
    const resultado = isNew
      ? cadastrarFornecedor(prepared.data)
      : atualizarFornecedor(prepared.data);

    if (!resultado.success) {
      setSaving(false);
      showToast(resultado.error ?? 'Não foi possível salvar o fornecedor.', 'error');
      return;
    }

    setDirty(false);
    showToast('Fornecedor salvo com sucesso!');
    setTimeout(() => {
      navigate('/cadastros/fornecedores');
    }, 1200);
  };

  const renderIdentificacao = () => (
    <>
      <div className="ff-form-row cols-3">
        <div className="ff-field">
          <label className="ff-label">Código do fornecedor</label>
          <input
            className="ff-input"
            type="text"
            value={formatarCodigoFornecedor(Number.isNaN(id) ? 0 : id)}
            readOnly
          />
        </div>
        <div className="ff-field">
          <label className="ff-label">
            Tipo de pessoa <span className="ff-required">*</span>
          </label>
          <select
            className="ff-select"
            value={tipoPessoa}
            onChange={(e) => {
              setTipoPessoa(e.target.value as TipoFornecedor);
              setDirty(true);
            }}
          >
            <option value="PJ">Pessoa Jurídica</option>
            <option value="PF">Pessoa Física</option>
          </select>
        </div>
        <div className="ff-field">
          <label className="ff-label">Status</label>
          <select
            className="ff-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFornecedor);
              setDirty(true);
            }}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Bloqueado">Bloqueado</option>
          </select>
        </div>
      </div>

      <hr className="ff-form-divider" />

      {tipoPessoa === 'PF' ? (
        <>
          <div className="ff-form-row cols-1">
            <div className="ff-field">
              <label className="ff-label">
                Nome completo <span className="ff-required">*</span>
              </label>
              <input
                className={inputClass('nomeCompleto')}
                type="text"
                placeholder="Nome completo do fornecedor"
                value={pf.nomeCompleto}
                onChange={(e) => updatePF('nomeCompleto', e.target.value)}
                onBlur={() => markTouched('nomeCompleto')}
              />
              {renderFieldError('nomeCompleto')}
            </div>
          </div>

          <div className="ff-form-row cols-3">
            <div className="ff-field">
              <label className="ff-label">
                CPF <span className="ff-required">*</span>
              </label>
              <input
                className={inputClass('cpf')}
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={pf.cpf}
                onChange={(e) => updatePF('cpf', formatCPF(e.target.value))}
                onBlur={() => markTouched('cpf')}
              />
              {renderFieldError('cpf')}
            </div>
            <div className="ff-field">
              <label className="ff-label">RG</label>
              <input
                className="ff-input"
                type="text"
                placeholder="00.000.000-0"
                value={pf.rg}
                onChange={(e) => updatePF('rg', e.target.value)}
              />
            </div>
            <div className="ff-field">
              <label className="ff-label">Data de nascimento</label>
              <input
                className="ff-input"
                type="date"
                value={pf.dataNascimento}
                onChange={(e) => updatePF('dataNascimento', e.target.value)}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="ff-form-row cols-2">
            <div className="ff-field">
              <label className="ff-label">
                Razão social <span className="ff-required">*</span>
              </label>
              <input
                className={inputClass('razaoSocial')}
                type="text"
                placeholder="Razão social da empresa"
                value={pj.razaoSocial}
                onChange={(e) => updatePJ('razaoSocial', e.target.value)}
                onBlur={() => markTouched('razaoSocial')}
              />
              {renderFieldError('razaoSocial')}
            </div>
            <div className="ff-field">
              <label className="ff-label">Nome fantasia</label>
              <input
                className="ff-input"
                type="text"
                placeholder="Nome fantasia"
                value={pj.nomeFantasia}
                onChange={(e) => updatePJ('nomeFantasia', e.target.value)}
              />
            </div>
          </div>

          <div className="ff-form-row cols-3">
            <div className="ff-field">
              <label className="ff-label">
                CNPJ <span className="ff-required">*</span>
              </label>
              <input
                className={inputClass('cnpj')}
                type="text"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                value={pj.cnpj}
                onChange={(e) => updatePJ('cnpj', formatCNPJ(e.target.value))}
                onBlur={() => markTouched('cnpj')}
              />
              {renderFieldError('cnpj')}
            </div>
            <div className="ff-field">
              <label className="ff-label">Data de abertura</label>
              <input
                className="ff-input"
                type="date"
                value={pj.dataAbertura}
                onChange={(e) => updatePJ('dataAbertura', e.target.value)}
              />
            </div>
            <div className="ff-field">
              <label className="ff-label">Natureza jurídica</label>
              <input
                className="ff-input"
                type="text"
                placeholder="Ex.: Sociedade Empresária Limitada"
                value={pj.naturezaJuridica}
                onChange={(e) => updatePJ('naturezaJuridica', e.target.value)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderFiscal = () => {
    const inscricaoEstadual = tipoPessoa === 'PF' ? fiscalPF.inscricaoEstadual : fiscalPJ.inscricaoEstadual;
    const indicadorIE = tipoPessoa === 'PF' ? fiscalPF.indicadorIE : fiscalPJ.indicadorIE;
    const inscricaoMunicipal = tipoPessoa === 'PF' ? fiscalPF.inscricaoMunicipal : fiscalPJ.inscricaoMunicipal;
    const suframa = tipoPessoa === 'PF' ? fiscalPF.suframa : fiscalPJ.suframa;

    const handleInscricaoEstadual = (value: string) => {
      const sanitized = sanitizeInscricao(value);
      if (tipoPessoa === 'PF') updateFiscalPF('inscricaoEstadual', sanitized);
      else updateFiscalPJ('inscricaoEstadual', sanitized);
    };

    const handleIndicadorIE = (value: IndicadorIE) => {
      if (tipoPessoa === 'PF') updateFiscalPF('indicadorIE', value);
      else updateFiscalPJ('indicadorIE', value);
    };

    const handleInscricaoMunicipal = (value: string) => {
      const sanitized = sanitizeInscricao(value);
      if (tipoPessoa === 'PF') updateFiscalPF('inscricaoMunicipal', sanitized);
      else updateFiscalPJ('inscricaoMunicipal', sanitized);
    };

    const handleSuframa = (value: string) => {
      const sanitized = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (tipoPessoa === 'PF') updateFiscalPF('suframa', sanitized);
      else updateFiscalPJ('suframa', sanitized);
    };

    return (
      <>
        <div className="ff-form-row cols-3">
          <div className="ff-field">
            <label className="ff-label">Indicador de Inscrição Estadual</label>
            <select
              className="ff-select"
              value={indicadorIE}
              onChange={(e) => handleIndicadorIE(e.target.value as IndicadorIE)}
            >
              <option value="">Selecione</option>
              <option value="contribuinte">Contribuinte do ICMS</option>
              <option value="isento">Contribuinte isento de IE</option>
              <option value="nao_contribuinte">Não contribuinte do ICMS</option>
            </select>
          </div>
          <div className="ff-field">
            <label className="ff-label">Inscrição Estadual</label>
            <input
              className="ff-input"
              type="text"
              placeholder="Pode conter letras/números ou ser 'ISENTO'"
              value={inscricaoEstadual}
              onChange={(e) => handleInscricaoEstadual(e.target.value)}
            />
          </div>
          <div className="ff-field">
            <label className="ff-label">Inscrição Municipal</label>
            <input
              className="ff-input"
              type="text"
              placeholder="Opcional"
              value={inscricaoMunicipal}
              onChange={(e) => handleInscricaoMunicipal(e.target.value)}
            />
          </div>
        </div>

        <div className="ff-form-row cols-2">
          {tipoPessoa === 'PJ' && (
            <div className="ff-field">
              <label className="ff-label">Regime Tributário</label>
              <select
                className="ff-select"
                value={fiscalPJ.regimeTributario}
                onChange={(e) =>
                  updateFiscalPJ('regimeTributario', e.target.value as RegimeTributario)
                }
              >
                <option value="">Não informado</option>
                <option value="simples_nacional">Simples Nacional</option>
                <option value="simples_nacional_mei">Simples Nacional — MEI</option>
                <option value="lucro_presumido">Lucro Presumido</option>
                <option value="lucro_real">Lucro Real</option>
                <option value="nao_informado">Não informado</option>
              </select>
            </div>
          )}
          <div className="ff-field">
            <label className="ff-label">SUFRAMA</label>
            <input
              className="ff-input"
              type="text"
              placeholder="Opcional (apenas para fornecedores com inscrição SUFRAMA)"
              value={suframa}
              onChange={(e) => handleSuframa(e.target.value)}
            />
          </div>
        </div>
      </>
    );
  };

  const renderContatos = () => (
    <>
      <div className="ff-form-row cols-2">
        <div className="ff-field">
          <label className="ff-label">Telefone</label>
          <input
            className={inputClass('telefone')}
            type="text"
            inputMode="numeric"
            placeholder="(00) 0000-0000"
            value={contatos.telefone}
            onChange={(e) => updateContatos('telefone', formatTelefone(e.target.value))}
            onBlur={() => markTouched('telefone')}
          />
          {renderFieldError('telefone')}
        </div>
        <div className="ff-field">
          <label className="ff-label">Celular / WhatsApp</label>
          <input
            className={inputClass('celular')}
            type="text"
            inputMode="numeric"
            placeholder="(00) 00000-0000"
            value={contatos.celular}
            onChange={(e) => updateContatos('celular', formatCelular(e.target.value))}
            onBlur={() => markTouched('celular')}
          />
          {renderFieldError('celular')}
        </div>
      </div>

      <div className="ff-form-row cols-2">
        <div className="ff-field">
          <label className="ff-label">E-mail principal</label>
          <input
            className={inputClass('email')}
            type="email"
            placeholder="comercial@fornecedor.com.br"
            value={contatos.email}
            onChange={(e) => updateContatos('email', e.target.value)}
            onBlur={() => markTouched('email')}
          />
          {renderFieldError('email')}
        </div>
        <div className="ff-field">
          <label className="ff-label">E-mail financeiro</label>
          <input
            className={inputClass('emailFinanceiro')}
            type="email"
            placeholder="financeiro@fornecedor.com.br"
            value={contatos.emailFinanceiro}
            onChange={(e) => updateContatos('emailFinanceiro', e.target.value)}
            onBlur={() => markTouched('emailFinanceiro')}
          />
          {renderFieldError('emailFinanceiro')}
        </div>
      </div>

      <div className="ff-form-row cols-1">
        <div className="ff-field">
          <label className="ff-label">Site</label>
          <input
            className={inputClass('site')}
            type="text"
            placeholder="www.fornecedor.com.br"
            value={contatos.site}
            onChange={(e) => updateContatos('site', e.target.value)}
            onBlur={() => markTouched('site')}
          />
          {renderFieldError('site')}
        </div>
      </div>
    </>
  );

  const renderEndereco = () => (
    <>
      <div className="ff-form-row cols-3">
        <div className="ff-field">
          <label className="ff-label">CEP</label>
          <input
            className={inputClass('cep')}
            type="text"
            inputMode="numeric"
            placeholder="00000-000"
            value={endereco.cep}
            onChange={(e) => updateEndereco('cep', formatCEP(e.target.value))}
            onBlur={() => markTouched('cep')}
          />
          {renderFieldError('cep')}
        </div>
        <div className="ff-field">
          <label className="ff-label">Logradouro</label>
          <input
            className="ff-input"
            type="text"
            placeholder="Rua, Avenida, Travessa..."
            value={endereco.logradouro}
            onChange={(e) => updateEndereco('logradouro', e.target.value)}
          />
        </div>
        <div className="ff-field">
          <label className="ff-label">Número</label>
          <input
            className="ff-input"
            type="text"
            placeholder="Nº ou S/N"
            value={endereco.numero}
            onChange={(e) => updateEndereco('numero', e.target.value)}
          />
        </div>
      </div>

      <div className="ff-form-row cols-2">
        <div className="ff-field">
          <label className="ff-label">Complemento</label>
          <input
            className="ff-input"
            type="text"
            placeholder="Bloco, Sala, Andar..."
            value={endereco.complemento}
            onChange={(e) => updateEndereco('complemento', e.target.value)}
          />
        </div>
        <div className="ff-field">
          <label className="ff-label">Bairro</label>
          <input
            className="ff-input"
            type="text"
            placeholder="Bairro"
            value={endereco.bairro}
            onChange={(e) => updateEndereco('bairro', e.target.value)}
          />
        </div>
      </div>

      <div className="ff-form-row cols-3">
        <div className="ff-field">
          <label className="ff-label">Cidade</label>
          <input
            className="ff-input"
            type="text"
            placeholder="Cidade"
            value={endereco.cidade}
            onChange={(e) => updateEndereco('cidade', e.target.value)}
          />
        </div>
        <div className="ff-field">
          <label className="ff-label">UF</label>
          <select
            className="ff-select"
            value={endereco.uf}
            onChange={(e) => updateEndereco('uf', e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="AC">Acre</option>
            <option value="AL">Alagoas</option>
            <option value="AP">Amapá</option>
            <option value="AM">Amazonas</option>
            <option value="BA">Bahia</option>
            <option value="CE">Ceará</option>
            <option value="DF">Distrito Federal</option>
            <option value="ES">Espírito Santo</option>
            <option value="GO">Goiás</option>
            <option value="MA">Maranhão</option>
            <option value="MT">Mato Grosso</option>
            <option value="MS">Mato Grosso do Sul</option>
            <option value="MG">Minas Gerais</option>
            <option value="PA">Pará</option>
            <option value="PB">Paraíba</option>
            <option value="PR">Paraná</option>
            <option value="PE">Pernambuco</option>
            <option value="PI">Piauí</option>
            <option value="RJ">Rio de Janeiro</option>
            <option value="RN">Rio Grande do Norte</option>
            <option value="RS">Rio Grande do Sul</option>
            <option value="RO">Rondônia</option>
            <option value="RR">Roraima</option>
            <option value="SC">Santa Catarina</option>
            <option value="SP">São Paulo</option>
            <option value="SE">Sergipe</option>
            <option value="TO">Tocantins</option>
          </select>
        </div>
        <div className="ff-field">
          <label className="ff-label">País</label>
          <input
            className="ff-input"
            type="text"
            value={endereco.pais}
            onChange={(e) => updateEndereco('pais', e.target.value)}
          />
        </div>
      </div>
    </>
  );

  const renderObservacoes = () => (
    <div className="ff-field">
      <textarea
        className="ff-input"
        rows={5}
        placeholder="Digite informações adicionais sobre o fornecedor..."
        value={observacoes.observacoes}
        onChange={(e) => updateObservacoes(e.target.value)}
        maxLength={LIMITE_OBSERVACOES}
      />
      <div className="ff-field-hint" style={{ textAlign: 'right' }}>
        {observacoes.observacoes.length} / {LIMITE_OBSERVACOES} caracteres
      </div>
    </div>
  );

  const renderSectionContent = (sectionId: string) => {
    if (sectionId === 'identificacao') {
      return renderIdentificacao();
    }
    if (sectionId === 'fiscal') {
      return renderFiscal();
    }
    if (sectionId === 'contatos') {
      return renderContatos();
    }
    if (sectionId === 'endereco') {
      return renderEndereco();
    }
    if (sectionId === 'controle') {
      return renderObservacoes();
    }
    return (
      <div className="ff-section-placeholder">
        Os campos desta seção serão implementados na próxima etapa.
      </div>
    );
  };

  if (notFound) {
    return (
      <div className="ficha-fornecedor-page">
        <nav className="ff-breadcrumb">
          <button className="ff-breadcrumb-link" onClick={() => navigate('/cadastros')}>
            Pessoas
          </button>
          <span className="ff-breadcrumb-separator">&gt;</span>
          <button className="ff-breadcrumb-link" onClick={() => navigate('/cadastros/fornecedores')}>
            Fornecedores
          </button>
          <span className="ff-breadcrumb-separator">&gt;</span>
          <span className="ff-breadcrumb-current">Cadastro</span>
        </nav>
        <div className="ff-notfound">
          <AlertCircle size={40} />
          <h2>Fornecedor não encontrado</h2>
          <p>O fornecedor solicitado não existe ou foi removido.</p>
          <button className="ff-btn-secondary" onClick={handleCancelar}>
            <ArrowLeft size={16} />
            Voltar para fornecedores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ficha-fornecedor-page">
      {toast && (
        <div className={`ff-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
          <button className="ff-toast-close" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <nav className="ff-breadcrumb">
        <button className="ff-breadcrumb-link" onClick={() => navigate('/cadastros')}>
          Pessoas
        </button>
        <span className="ff-breadcrumb-separator">&gt;</span>
        <button className="ff-breadcrumb-link" onClick={() => navigate('/cadastros/fornecedores')}>
          Fornecedores
        </button>
        <span className="ff-breadcrumb-separator">&gt;</span>
        <span className="ff-breadcrumb-current">Cadastro</span>
      </nav>

      <div className="ff-header">
        <div className="ff-header-left">
          <h1 className="ff-page-title">Cadastro de Fornecedor</h1>
          <p className="ff-page-subtitle">
            {isNew
              ? 'Preencha os dados para cadastrar um novo fornecedor.'
              : fornecedor?.razaoSocial}
          </p>
        </div>
      </div>

      {fornecedor && (
        <div className="ff-control-data">
          <span>Código: {fornecedor.codigo}</span>
          <span className="ff-control-separator">|</span>
          <span>Cadastrado em: {fornecedor.dataCadastro}</span>
          <span className="ff-control-separator">|</span>
          <span>Categoria: {fornecedor.categoria}</span>
        </div>
      )}

      <div className="ff-sections">
        {sections.map((section) => (
          <div className="ff-section" key={section.id}>
            <div className="ff-section-header" onClick={() => toggleSection(section.id)}>
              <div className="ff-section-header-left">
                <div className={`ff-section-icon ${section.iconColor}`}>{section.icon}</div>
            <div className="ff-section-titles">
              <h3 className="ff-section-title">{section.title}</h3>
            </div>
              </div>
              <ChevronDown
                size={18}
                className={`ff-section-chevron ${openSections[section.id] ? 'open' : ''}`}
              />
            </div>
            {openSections[section.id] && (
              <div className="ff-section-body">{renderSectionContent(section.id)}</div>
            )}
          </div>
        ))}
      </div>

      <div className="ff-bottom-actions">
        <button className="ff-btn-secondary" onClick={handleCancelar}>
          Cancelar
        </button>
        <button
          className="ff-btn-primary"
          onClick={handleSalvar}
          disabled={saving}
        >
          <Save size={16} />
          Salvar fornecedor
        </button>
      </div>
    </div>
  );
};
