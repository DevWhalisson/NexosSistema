import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  Copy,
  FileText,
  Info,
  Package,
  Pencil,
  Save,
  ShoppingBag,
  X,
} from 'lucide-react';
import type { CodigoUnidadeMedida, Fornecedor, OpcaoCatalogo } from '../../../types';
import {
  CAMBIOS_VEICULO,
  COMBUSTIVEIS_VEICULO,
  CONDICOES_VEICULO,
  GRUPOS_PRODUTO,
  MARCAS_PRODUTO,
  SITUACOES_VEICULO,
  UNIDADES_MEDIDA,
} from '../../../data/produtos';
import {
  CFOP_NFE,
  CFOP_NFCE,
  CLASSIFICACOES_IBS_CBS,
  CST_COFINS,
  CST_CONTRIBUINTE,
  CST_IPI,
  CST_NAO_CONTRIBUINTE,
  CST_PIS,
  CSOSN_CONTRIBUINTE,
  CSOSN_NAO_CONTRIBUINTE,
  ORIGENS_PRODUTO,
  PERFIS_TRIBUTACAO,
  TRIBUTACOES_ICMS,
} from '../../../data/produtosFiscal';
import { listarFornecedores } from '../../../services/fornecedorStorage';
import {
  ajustarEstoqueProduto,
  atualizarProduto,
  buscarProdutoPorId,
  cadastrarProduto,
  duplicarProduto,
  listarProdutos,
} from '../../../services/produtoStorage';
import { concluirProdutoId, gerarProximoProdutoId, isProdutoIdNovo } from '../../../utils/produtoId';
import {
  codigoProdutoJaUtilizado,
  estoqueDisponivel,
  formatarDataBr,
  formatarDataHoraBr,
  formatarMoeda,
  formatarNumero,
  LIMITE_DESCRICAO,
  LIMITE_OBSERVACOES,
  parseNumero,
  prepararFormularioVazio,
  prepareProduto,
  produtoParaFormulario,
  validarFornecedorPreferencial,
  type ProdutoFormInput,
  type ValidationErrors,
} from '../../../utils/produtoForm';
import {
  obterUsuarioAtual,
  podeAjustarEstoqueProduto,
  podeEditarFiscalProduto,
  podeEditarPrecosProduto,
} from '../../../utils/produtoPermissoes';
import './FichaProduto.css';

interface FichaSecao {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
}

type ModoFicha = 'cadastro' | 'editar' | 'visualizar';

const secoes: FichaSecao[] = [
  { id: 'gerais', title: 'Dados gerais', icon: <Package size={18} />, iconColor: 'blue' },
  { id: 'precos', title: 'Preços e informações comerciais', icon: <Banknote size={18} />, iconColor: 'green' },
  { id: 'estoque', title: 'Estoque e logística', icon: <BoxesIcon size={18} />, iconColor: 'orange' },
  { id: 'fiscal', title: 'Informações fiscais', icon: <FileText size={18} />, iconColor: 'purple' },
  { id: 'historico', title: 'Histórico', icon: <ClipboardList size={18} />, iconColor: 'gray' },
];

function BoxesIcon({ size }: { size: number }) {
  return <ShoppingBag size={size} />;
}

interface CampoProps {
  id: string;
  label: string;
  erro?: string;
  obrigatorio?: boolean;
  className?: string;
  children: React.ReactNode;
  dica?: string;
}

const Campo: React.FC<CampoProps> = ({ id, label, erro, obrigatorio, className, children, dica }) => (
  <div className={`fp-field ${className ?? ''}`}>
    <label className="fp-label" htmlFor={id}>
      {label}
      {obrigatorio && <span className="fp-required">*</span>}
    </label>
    {children}
    {erro && <span className="fp-field-error">{erro}</span>}
    {dica && !erro && <span className="fp-field-hint">{dica}</span>}
  </div>
);

interface CampoTextoProps extends Omit<CampoProps, 'children'> {
  value: string;
  onChange: (valor: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  maxLength?: number;
  inputMode?: 'text' | 'decimal' | 'numeric';
  autoFocus?: boolean;
}

const CampoTexto: React.FC<CampoTextoProps> = ({
  id,
  label,
  erro,
  obrigatorio,
  className,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  readOnly,
  maxLength,
  inputMode,
  autoFocus,
  dica,
}) => (
  <Campo id={id} label={label} erro={erro} obrigatorio={obrigatorio} className={className} dica={dica}>
    <input
      id={id}
      className={`fp-input ${erro ? 'has-error' : ''} ${readOnly ? 'fp-readonly' : ''}`}
      type={type}
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      maxLength={maxLength}
      inputMode={inputMode}
      autoFocus={autoFocus}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
    />
  </Campo>
);

interface CampoSelecaoProps extends Omit<CampoProps, 'children'> {
  value: string;
  onChange: (valor: string) => void;
  onBlur?: () => void;
  opcoes: OpcaoCatalogo[];
  placeholder?: string;
  disabled?: boolean;
}

const CampoSelecao: React.FC<CampoSelecaoProps> = ({
  id,
  label,
  erro,
  obrigatorio,
  className,
  value,
  onChange,
  onBlur,
  opcoes,
  placeholder,
  disabled,
  dica,
}) => (
  <Campo id={id} label={label} erro={erro} obrigatorio={obrigatorio} className={className} dica={dica}>
    <select
      id={id}
      className={`fp-select ${erro ? 'has-error' : ''}`}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
    >
      <option value="">{placeholder ?? 'Selecione...'}</option>
      {opcoes.map((opcao) => (
        <option key={opcao.codigo} value={opcao.codigo}>
          {opcao.descricao}
        </option>
      ))}
    </select>
  </Campo>
);

interface CampoToggleProps {
  label: string;
  descricao?: string;
  ativo: boolean;
  desabilitado?: boolean;
  onChange: (valor: boolean) => void;
}

const CampoToggle: React.FC<CampoToggleProps> = ({ label, descricao, ativo, desabilitado, onChange }) => (
  <div className={`fp-toggle-field ${desabilitado ? 'fp-readonly' : ''}`}>
    <button
      type="button"
      role="switch"
      aria-checked={ativo}
      aria-label={label}
      className={`fp-switch ${ativo ? 'on' : ''}`}
      disabled={desabilitado}
      onClick={() => onChange(!ativo)}
    >
      <span className="fp-switch-thumb" />
    </button>
    <div className="fp-toggle-text">
      <span className="fp-toggle-label">{label}</span>
      {descricao && <span className="fp-toggle-descricao">{descricao}</span>}
    </div>
  </div>
);

export const FichaProduto: React.FC = () => {
  const { produtoId } = useParams<{ produtoId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const envioEmAndamento = useRef(false);

  const id = Number(produtoId);
  const produtoExistente = useMemo(() => (Number.isNaN(id) ? undefined : buscarProdutoPorId(id)), [id]);

  const modoSolicitado = (searchParams.get('modo') ?? '').trim().toLowerCase();
  const ehVisualizacao = modoSolicitado === 'visualizar';
  const isNovoRegistro = !produtoExistente && !Number.isNaN(id) && isProdutoIdNovo(id);
  const notFound = Number.isNaN(id) || (!produtoExistente && (!isNovoRegistro || ehVisualizacao));

  const modo: ModoFicha = !produtoExistente ? 'cadastro' : ehVisualizacao ? 'visualizar' : 'editar';
  const somenteLeitura = modo === 'visualizar';
  const isNew = modo === 'cadastro';

  const usuario = obterUsuarioAtual();
  const podePrecos = podeEditarPrecosProduto(usuario);
  const podeFiscal = podeEditarFiscalProduto(usuario);
  const podeAjuste = podeAjustarEstoqueProduto(usuario);

  const [secoesAbertas, setSecoesAbertas] = useState<Record<string, boolean>>({
    gerais: true,
    precos: true,
    estoque: true,
    fiscal: false,
    compras: false,
    vendas: false,
    complementares: false,
  });

  const [form, setForm] = useState<ProdutoFormInput>(() =>
    produtoExistente ? produtoParaFormulario(produtoExistente) : prepararFormularioVazio(Number.isNaN(id) ? 0 : id)
  );

  const [camposTocados, setCamposTocados] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAjuste, setShowAjuste] = useState(false);
  const [ajusteQtd, setAjusteQtd] = useState('');
  const [ajusteMotivo, setAjusteMotivo] = useState('');

  const idCarregado = useRef(id);

  useEffect(() => {
    if (idCarregado.current === id) return;
    idCarregado.current = id;
    setForm(produtoExistente ? produtoParaFormulario(produtoExistente) : prepararFormularioVazio(Number.isNaN(id) ? 0 : id));
    setCamposTocados({});
    setSubmitted(false);
    setDirty(false);
    setSaving(false);
    setToast(null);
    setShowAjuste(false);
  }, [id, produtoExistente]);

  useEffect(() => {
    if (!dirty || somenteLeitura) return;
    const avisarSaida = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', avisarSaida);
    return () => window.removeEventListener('beforeunload', avisarSaida);
  }, [dirty, somenteLeitura]);

  const fornecedores = useMemo<Fornecedor[]>(() => listarFornecedores(), []);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const atualizarCampo = useCallback(
    <K extends keyof ProdutoFormInput>(campo: K, valor: ProdutoFormInput[K]) => {
      if (somenteLeitura) return;
      if ((campo === 'preco' || campo === 'custo' || campo === 'precoPromocional' || campo === 'precoMinimo' || campo === 'custoMedio') && !podePrecos) return;
      if (campo.toString().includes('fiscal') || ['ncm', 'cest', 'cfopNfe', 'cfopNfce', 'cBenef', 'cstIpi', 'cstPis', 'cstCofins', 'aliquotaIpi', 'aliquotaPis', 'aliquotaCofins'].includes(campo as string)) {
        if (!podeFiscal) return;
      }
      setForm((prev) => ({ ...prev, [campo]: valor }));
      setDirty(true);
    },
    [somenteLeitura, podePrecos, podeFiscal]
  );

  const marcarTocado = (campo: string) => setCamposTocados((prev) => ({ ...prev, [campo]: true }));

  const prepared = useMemo(() => prepareProduto(form, produtoExistente), [form, produtoExistente]);

  const fornecedorVinculo = useMemo(
    () => validarFornecedorPreferencial(form.fornecedorPreferencialId, fornecedores),
    [form.fornecedorPreferencialId, fornecedores]
  );

  const erros = useMemo<ValidationErrors>(() => {
    const base = prepared.errors;
    const extras: ValidationErrors = {};
    if (form.codigo.trim() && codigoProdutoJaUtilizado(form.codigo, listarProdutos(), isNew ? undefined : id)) {
      extras.codigo = 'Já existe um produto com este código.';
    }
    if (fornecedorVinculo.erro) {
      extras.fornecedorPreferencialId = fornecedorVinculo.erro;
    }
    if (!form.ativo && !form.motivoInativacao.trim()) {
      extras.motivoInativacao = 'Informe o motivo da inativação';
    }
    return { ...base, ...extras };
  }, [prepared.errors, form.codigo, fornecedorVinculo, isNew, id, form.ativo, form.motivoInativacao]);

  const valid = Object.keys(erros).length === 0;
  const mostrarErro = (campo: string) => !somenteLeitura && Boolean((camposTocados[campo] || submitted) && erros[campo]);
  const classeErro = (campo: string) => (mostrarErro(campo) ? 'has-error' : '');

  const toggleSecao = (secaoId: string) => setSecoesAbertas((prev) => ({ ...prev, [secaoId]: !prev[secaoId] }));

  const navegarComConfirmacao = useCallback(
    (destino: string) => {
      if (dirty && !somenteLeitura && !window.confirm('Há alterações não salvas. Deseja descartá-las?')) return;
      navigate(destino);
    },
    [dirty, somenteLeitura, navigate]
  );

  const handleVoltar = () => navegarComConfirmacao('/estoque/produtos');
  const handleIrParaEdicao = () => navigate(`/estoque/produtos/${id}?modo=editar`);

  const handleSalvar = () => {
    if (somenteLeitura) return;
    if (saving || envioEmAndamento.current) return;
    setSubmitted(true);
    if (!valid) {
      showToast('Corrija os erros antes de salvar.', 'error');
      return;
    }
    if (isNew && !isProdutoIdNovo(id)) {
      showToast('Identificador inválido para cadastro. Use o botão "Novo Produto" da consulta.', 'error');
      return;
    }
    envioEmAndamento.current = true;
    setSaving(true);
    const resultado = isNew ? cadastrarProduto(prepared.data) : atualizarProduto(prepared.data);
    if (!resultado.success) {
      envioEmAndamento.current = false;
      setSaving(false);
      showToast(resultado.error ?? 'Não foi possível salvar o produto.', 'error');
      return;
    }
    setDirty(false);
    if (isNew) concluirProdutoId(id);
    showToast('Produto salvo com sucesso!', 'success');
    setTimeout(() => navigate('/estoque/produtos'), 900);
  };

  const handleDuplicar = () => {
    if (isNew) return;
    const novoId = gerarProximoProdutoId();
    const resultado = duplicarProduto(id, novoId);
    if ('success' in resultado) {
      showToast(resultado.error ?? 'Não foi possível duplicar o produto.', 'error');
      return;
    }
    showToast('Produto duplicado com sucesso!', 'success');
    navigate(`/estoque/produtos/${novoId}?modo=editar`);
  };

  const handleAjustarEstoque = () => {
    if (!podeAjuste) {
      showToast('Sem permissão para realizar ajustes de estoque.', 'error');
      return;
    }
    const qtd = parseNumero(ajusteQtd);
    if (qtd === null || qtd < 0) {
      showToast('Informe uma quantidade válida e não negativa.', 'error');
      return;
    }
    if (!ajusteMotivo.trim()) {
      showToast('Informe o motivo do ajuste.', 'error');
      return;
    }
    const resultado = ajustarEstoqueProduto(id, qtd, ajusteMotivo);
    if (!resultado.success) {
      showToast(resultado.error ?? 'Não foi possível ajustar o estoque.', 'error');
      return;
    }
    showToast('Ajuste de estoque realizado com sucesso!', 'success');
    setShowAjuste(false);
    setAjusteQtd('');
    setAjusteMotivo('');
    setDirty(false);
    window.location.reload();
  };

  if (notFound) {
    return (
      <div className="ficha-produto-page">
        <nav className="fp-breadcrumb">
          <button className="fp-breadcrumb-link" onClick={() => navigate('/estoque')}>Estoque</button>
          <span className="fp-breadcrumb-separator">&gt;</span>
          <button className="fp-breadcrumb-link" onClick={handleVoltar}>Produtos</button>
          <span className="fp-breadcrumb-separator">&gt;</span>
          <span className="fp-breadcrumb-current">{ehVisualizacao ? 'Visualização' : 'Cadastro'}</span>
        </nav>
        <div className="fp-notfound">
          <AlertCircle size={40} />
          <h2>Produto não encontrado</h2>
          <p>{ehVisualizacao && isNovoRegistro ? 'Este cadastro ainda não foi salvo, portanto não pode ser visualizado.' : 'O produto solicitado não existe ou foi removido.'}</p>
          <button className="fp-btn-secondary" onClick={handleVoltar}><ArrowLeft size={16} />Voltar para produtos</button>
        </div>
      </div>
    );
  }

  fornecedores.find((f) => f.id === Number(form.fornecedorPreferencialId));

  return (
    <div className="ficha-produto-page">
      <nav className="fp-breadcrumb">
        <button className="fp-breadcrumb-link" onClick={() => navegarComConfirmacao('/estoque')}>Estoque</button>
        <span className="fp-breadcrumb-separator">&gt;</span>
        <button className="fp-breadcrumb-link" onClick={handleVoltar}>Produtos</button>
        <span className="fp-breadcrumb-separator">&gt;</span>
        <span className="fp-breadcrumb-current">{modo === 'visualizar' ? 'Visualização' : modo === 'editar' ? 'Edição' : 'Cadastro'}</span>
      </nav>

      <div className="fp-header">
        <div className="fp-header-left">
          <h1 className="fp-page-title">{modo === 'visualizar' ? 'Visualizar Produto' : modo === 'editar' ? 'Editar Produto' : 'Cadastro de Produto'}</h1>
          <p className="fp-page-subtitle">{modo === 'visualizar' ? `Dados cadastrados de ${produtoExistente?.descricao ?? 'produto'}.` : modo === 'editar' ? `Alterando os dados de ${produtoExistente?.descricao ?? 'produto'}.` : 'Preencha os dados para cadastrar um novo produto.'}</p>
        </div>
        <div className="fp-header-actions">
          {somenteLeitura ? (
            <>
              <button className="fp-btn-secondary" onClick={handleVoltar}><ArrowLeft size={16} />Voltar</button>
              <button className="fp-btn-secondary" onClick={handleDuplicar}><Copy size={16} />Duplicar</button>
              <button className="fp-btn-primary" onClick={handleIrParaEdicao}><Pencil size={16} />Editar produto</button>
            </>
          ) : (
            <>
              {!isNew && <button className="fp-btn-secondary" onClick={handleDuplicar}><Copy size={16} />Duplicar</button>}
              <button className="fp-btn-secondary" onClick={handleVoltar}>Cancelar</button>
              <button className="fp-btn-primary" onClick={handleSalvar} disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar produto'}</button>
            </>
          )}
        </div>
      </div>

      <div className="fp-control-data">
        <span>Código: {form.codigo}</span><span className="fp-control-separator">|</span>
        <span>Status: {form.ativo ? 'Ativo' : 'Inativo'}</span><span className="fp-control-separator">|</span>
        <span>Unidade: {form.unidadeMedida}</span><span className="fp-control-separator">|</span>
        <span>Estoque disponível: {estoqueDisponivel(prepared.data)}</span>
        {somenteLeitura && <><span className="fp-control-separator">|</span><span className="fp-readonly-badge">Somente leitura</span></>}
      </div>

      <div className="fp-sections">
        {secoes.map((secao) => {
          const aberta = Boolean(secoesAbertas[secao.id]);
          return (
            <div className="fp-section" key={secao.id}>
              <div className="fp-section-header">
                <button type="button" className="fp-section-toggle" aria-expanded={aberta} onClick={() => toggleSecao(secao.id)}>
                  <div className="fp-section-header-left">
                    <div className={`fp-section-icon ${secao.iconColor}`}>{secao.icon}</div>
                    <h3 className="fp-section-title">{secao.title}</h3>
                  </div>
                </button>
                <button type="button" className="fp-section-chevron-btn" onClick={() => toggleSecao(secao.id)}>
                  <ChevronDown size={18} className={`fp-section-chevron ${aberta ? 'open' : ''}`} />
                </button>
              </div>
              {aberta && (
                <div className="fp-section-body">
                  {secao.id === 'gerais' && (
                    <div className="fp-groups">
                      <section className="fp-group">
                        <h4 className="fp-group-title">Identificação</h4>
                        <div className="fp-grid fp-grid-3">
                          <CampoTexto id="fp-codigo" label="ID / Código" value={form.codigo} readOnly onChange={() => undefined} />
                          <CampoTexto id="fp-descricao" label="Descrição do produto" value={form.descricao} obrigatorio placeholder="Descrição comercial" maxLength={LIMITE_DESCRICAO} erro={mostrarErro('descricao') ? erros.descricao : undefined} className="fp-field-descricao" readOnly={somenteLeitura} onChange={(v) => atualizarCampo('descricao', v)} onBlur={() => marcarTocado('descricao')} autoFocus={isNew} />
                          <CampoSelecao id="fp-grupo" label="Grupo" value={form.grupo} opcoes={GRUPOS_PRODUTO} disabled={somenteLeitura} onChange={(v) => { atualizarCampo('grupo', v); }} />
                        </div>
                        {!form.ativo && (
                          <div className="fp-grid fp-grid-2" style={{ marginTop: 12 }}>
                            <CampoTexto id="fp-motivo-inat" label="Motivo da inativação" value={form.motivoInativacao} obrigatorio erro={mostrarErro('motivoInativacao') ? erros.motivoInativacao : undefined} readOnly={somenteLeitura} onChange={(v) => atualizarCampo('motivoInativacao', v)} onBlur={() => marcarTocado('motivoInativacao')} />
                          </div>
                        )}
                      </section>
                      <section className="fp-group">
                        <h4 className="fp-group-title">Classificação</h4>
                        <div className="fp-grid fp-grid-3">
                          <CampoSelecao id="fp-marca" label="Marca" value={form.marca} opcoes={MARCAS_PRODUTO} disabled={somenteLeitura} onChange={(v) => atualizarCampo('marca', v)} />
                          <CampoSelecao id="fp-um" label="Unidade de medida" value={form.unidadeMedida} opcoes={UNIDADES_MEDIDA} disabled={somenteLeitura} onChange={(v) => atualizarCampo('unidadeMedida', v as CodigoUnidadeMedida)} />
                          <CampoTexto id="fp-ref" label="Referência" value={form.referencia} readOnly={somenteLeitura} erro={mostrarErro('referencia') ? erros.referencia : undefined} onChange={(v) => atualizarCampo('referencia', v)} onBlur={() => marcarTocado('referencia')} />
                        </div>
                        <div className="fp-grid fp-grid-2" style={{ marginTop: 12 }}>
                          <CampoTexto id="fp-ean" label="Código de barras EAN/GTIN" value={form.codigoBarras} inputMode="numeric" placeholder="Somente números" readOnly={somenteLeitura} erro={mostrarErro('codigoBarras') ? erros.codigoBarras : undefined} onChange={(v) => atualizarCampo('codigoBarras', v.replace(/\D/g, ''))} onBlur={() => marcarTocado('codigoBarras')} />
                        </div>
                      </section>
                      <section className="fp-group">
                        <h4 className="fp-group-title">Imagem do produto</h4>
                        <div className="fp-grid fp-grid-2">
                          <CampoTexto id="fp-imagem" label="URL da imagem" value={form.imagem} placeholder="https://..." readOnly={somenteLeitura} erro={mostrarErro('imagem') ? erros.imagem : undefined} onChange={(v) => atualizarCampo('imagem', v)} />
                        </div>
                        {form.imagem && <img src={form.imagem} alt="Produto" style={{ maxHeight: 120, marginTop: 10, borderRadius: 8, border: '1px solid var(--border-color)' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                      </section>

                      <section className="fp-group">
                        <h4 className="fp-group-title">Observações gerais</h4>
                        <div className="fp-field fp-field-full">
                          <textarea className={`fp-textarea ${classeErro('observacoes')}`} value={form.observacoes} maxLength={LIMITE_OBSERVACOES} rows={4} readOnly={somenteLeitura} onChange={(e) => atualizarCampo('observacoes', e.target.value)} onBlur={() => marcarTocado('observacoes')} />
                          <div className="fp-textarea-footer"><span className="fp-char-counter">{form.observacoes.length} / {LIMITE_OBSERVACOES}</span></div>
                        </div>
                      </section>
                      {(form.tipoProduto === 'VEICULO' || form.grupo === 'VEICULOS') && (
                        <section className="fp-group">
                          <h4 className="fp-group-title">Cadastro de veículo</h4>
                          <div className="fp-grid fp-grid-4">
                            <CampoTexto id="v-marca" label="Marca" obrigatorio value={form.dadosVeiculo.marca} readOnly={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, marca: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoTexto id="v-modelo" label="Modelo" obrigatorio value={form.dadosVeiculo.modelo} readOnly={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, modelo: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoTexto id="v-versao" label="Versão" value={form.dadosVeiculo.versao} readOnly={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, versao: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoSelecao id="v-comb" label="Combustível" value={form.dadosVeiculo.combustivel} opcoes={COMBUSTIVEIS_VEICULO} disabled={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, combustivel: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                          </div>
                          <div className="fp-grid fp-grid-4" style={{ marginTop: 12 }}>
                            <CampoTexto id="v-ano-fab" label="Ano de fabricação" value={form.dadosVeiculo.anoFabricacao} inputMode="numeric" readOnly={somenteLeitura} erro={mostrarErro('dadosVeiculo.anoFabricacao') ? erros['dadosVeiculo.anoFabricacao'] : undefined} onChange={(v) => { const d = { ...form.dadosVeiculo, anoFabricacao: v.replace(/\D/g, '') }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoTexto id="v-ano-mod" label="Ano-modelo" value={form.dadosVeiculo.anoModelo} inputMode="numeric" readOnly={somenteLeitura} erro={mostrarErro('dadosVeiculo.anoModelo') ? erros['dadosVeiculo.anoModelo'] : undefined} onChange={(v) => { const d = { ...form.dadosVeiculo, anoModelo: v.replace(/\D/g, '') }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoTexto id="v-placa" label="Placa" obrigatorio value={form.dadosVeiculo.placa} readOnly={somenteLeitura} erro={mostrarErro('dadosVeiculo.placa') ? erros['dadosVeiculo.placa'] : undefined} onChange={(v) => { const d = { ...form.dadosVeiculo, placa: v.toUpperCase() }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoTexto id="v-chassi" label="Chassi/VIN" obrigatorio value={form.dadosVeiculo.chassi} readOnly={somenteLeitura} erro={mostrarErro('dadosVeiculo.chassi') ? erros['dadosVeiculo.chassi'] : undefined} onChange={(v) => { const d = { ...form.dadosVeiculo, chassi: v.toUpperCase() }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                          </div>
                          <div className="fp-grid fp-grid-4" style={{ marginTop: 12 }}>
                            <CampoTexto id="v-renavam" label="RENAVAM" value={form.dadosVeiculo.renavam} readOnly={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, renavam: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoTexto id="v-cor" label="Cor" value={form.dadosVeiculo.cor} readOnly={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, cor: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoSelecao id="v-cambio" label="Câmbio" value={form.dadosVeiculo.cambio} opcoes={CAMBIOS_VEICULO} disabled={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, cambio: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoSelecao id="v-cond" label="Condição" obrigatorio value={form.dadosVeiculo.condicao} opcoes={CONDICOES_VEICULO} disabled={somenteLeitura} erro={mostrarErro('dadosVeiculo.condicao') ? erros['dadosVeiculo.condicao'] : undefined} onChange={(v) => { const d = { ...form.dadosVeiculo, condicao: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                          </div>
                          <div className="fp-grid fp-grid-4" style={{ marginTop: 12 }}>
                            <CampoTexto id="v-km" label="Quilometragem" inputMode="numeric" value={form.dadosVeiculo.quilometragem} readOnly={somenteLeitura} erro={mostrarErro('dadosVeiculo.quilometragem') ? erros['dadosVeiculo.quilometragem'] : undefined} onChange={(v) => { const d = { ...form.dadosVeiculo, quilometragem: v.replace(/\D/g, '') }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoTexto id="v-motor" label="Nº do motor" value={form.dadosVeiculo.numeroMotor} readOnly={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, numeroMotor: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoTexto id="v-portas" label="Portas" inputMode="numeric" value={form.dadosVeiculo.portas} readOnly={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, portas: v.replace(/\D/g, '') }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoSelecao id="v-sit" label="Situação" value={form.dadosVeiculo.situacao} opcoes={SITUACOES_VEICULO} disabled={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, situacao: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                          </div>
                          <div className="fp-grid fp-grid-4" style={{ marginTop: 12 }}>
                            <CampoTexto id="v-custo-aq" label="Custo de aquisição" value={form.dadosVeiculo.custoAquisicao} readOnly={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, custoAquisicao: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoTexto id="v-desp" label="Despesas de preparação" value={form.dadosVeiculo.despesasPreparacao} readOnly={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, despesasPreparacao: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoTexto id="v-nf-aq" label="NF de aquisição" value={form.dadosVeiculo.notaFiscalAquisicao} readOnly={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, notaFiscalAquisicao: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                            <CampoTexto id="v-forn-ant" label="Fornecedor/proprietário anterior" value={form.dadosVeiculo.fornecedorAnterior} readOnly={somenteLeitura} onChange={(v) => { const d = { ...form.dadosVeiculo, fornecedorAnterior: v }; setForm(p => ({ ...p, dadosVeiculo: d })); setDirty(true); }} />
                          </div>
                          <p className="fp-group-hint" style={{ marginTop: 8 }}>Integração RENAVE: campos preparados, sem comunicação real.</p>
                        </section>
                      )}
                    </div>
                  )}

                  {secao.id === 'precos' && (
                    <div className="fp-groups">
                      <section className="fp-group">
                        <h4 className="fp-group-title">Custos</h4>
                        <div className="fp-grid fp-grid-4">
                          <CampoTexto id="p-custo" label="Preço de custo atual" value={form.custo} readOnly={!podePrecos || somenteLeitura} erro={mostrarErro('custo') ? erros.custo : undefined} onChange={(v) => atualizarCampo('custo', v)} dica={!podePrecos ? 'Sem permissão' : undefined} />
                          <CampoTexto id="p-custo-m" label="Custo médio ponderado" value={form.custoMedio} readOnly={!podePrecos || somenteLeitura} onChange={(v) => atualizarCampo('custoMedio', v)} />
                          <CampoTexto id="p-ult-custo" label="Último custo de aquisição" value={form.ultimoCustoAquisicao} readOnly onChange={() => undefined} />
                          <CampoTexto id="p-dt-compra" label="Data da última compra" value={form.dataUltimaCompra} placeholder="DD/MM/AAAA" readOnly onChange={() => undefined} />
                        </div>
                      </section>
                      <section className="fp-group">
                        <h4 className="fp-group-title">Preço de venda</h4>
                        <div className="fp-grid fp-grid-4">
                          <CampoTexto id="p-venda" label="Preço de venda" value={form.preco} readOnly={!podePrecos || somenteLeitura} erro={mostrarErro('preco') ? erros.preco : undefined} onChange={(v) => atualizarCampo('preco', v)} />
                          <CampoTexto id="p-prom" label="Preço promocional" value={form.precoPromocional} readOnly={!podePrecos || somenteLeitura} onChange={(v) => atualizarCampo('precoPromocional', v)} />
                          <CampoTexto id="p-prom-inicio" label="Início da promoção" value={form.promocaoInicio} placeholder="DD/MM/AAAA" readOnly={!podePrecos || somenteLeitura} erro={mostrarErro('promocaoInicio') ? erros.promocaoInicio : undefined} onChange={(v) => atualizarCampo('promocaoInicio', v)} />
                          <CampoTexto id="p-prom-fim" label="Término da promoção" value={form.promocaoFim} placeholder="DD/MM/AAAA" readOnly={!podePrecos || somenteLeitura} erro={mostrarErro('promocaoFim') ? erros.promocaoFim : undefined} onChange={(v) => atualizarCampo('promocaoFim', v)} />
                        </div>
                      </section>
                    </div>
                  )}

                  {secao.id === 'estoque' && (
                    <div className="fp-groups">
                      <section className="fp-group">
                        <h4 className="fp-group-title">Controle</h4>
                        <div className="fp-grid fp-grid-4">
                          <CampoToggle label="Controlar estoque" descricao="Habilitar movimentações" ativo={form.controlarEstoque} desabilitado={somenteLeitura} onChange={(v) => atualizarCampo('controlarEstoque', v)} />
                          <CampoToggle label="Permitir venda fracionada" ativo={form.venderFracionado} desabilitado={somenteLeitura} onChange={(v) => atualizarCampo('venderFracionado', v)} />
                          <CampoToggle label="Permitir estoque negativo" descricao="Sujeito à autorização/configuração" ativo={form.permitirEstoqueNegativo} desabilitado={somenteLeitura} onChange={(v) => atualizarCampo('permitirEstoqueNegativo', v)} />
                        </div>
                      </section>
                      <section className="fp-group">
                        <h4 className="fp-group-title">Saldos</h4>
                        <div className="fp-grid fp-grid-5">
                          <CampoTexto id="e-atual" label="Estoque atual" value={form.quantidade} readOnly dica="Obtido por movimentações/ajustes" onChange={() => undefined} />
                          <CampoTexto id="e-res" label="Estoque reservado" value={form.quantidadeReservada} readOnly dica="Considera reservas válidas" onChange={() => undefined} />
                          <div className="fp-field"><label className="fp-label">Estoque disponível</label><input className="fp-input fp-readonly" value={formatarNumero(estoqueDisponivel(prepared.data))} readOnly /></div>
                          <CampoTexto id="e-min" label="Estoque mínimo" value={form.quantidadeMinima} readOnly={somenteLeitura} onChange={(v) => atualizarCampo('quantidadeMinima', v)} />
                          <CampoTexto id="e-max" label="Estoque máximo" value={form.estoqueMaximo} readOnly={somenteLeitura} onChange={(v) => atualizarCampo('estoqueMaximo', v)} />
                        </div>
                        {!isNew && !somenteLeitura && podeAjuste && (
                          <div style={{ marginTop: 10 }}>
                            <button type="button" className="fp-btn-secondary" onClick={() => setShowAjuste(!showAjuste)}>Ajuste de estoque (autorizado)</button>
                          </div>
                        )}
                        {showAjuste && (
                          <div className="fp-grid fp-grid-3" style={{ marginTop: 10 }}>
                            <CampoTexto id="aj-qtd" label="Nova quantidade" value={ajusteQtd} onChange={(v) => setAjusteQtd(v)} />
                            <CampoTexto id="aj-mot" label="Motivo do ajuste" value={ajusteMotivo} className="fp-field-descricao" onChange={(v) => setAjusteMotivo(v)} />
                            <div className="fp-field"><label className="fp-label">&nbsp;</label><button type="button" className="fp-btn-primary" onClick={handleAjustarEstoque}>Confirmar ajuste</button></div>
                          </div>
                        )}
                      </section>
                    </div>
                  )}

                  {secao.id === 'fiscal' && (
                    <div className="fp-groups">
                      <p className="fp-fiscal-aviso"><Info size={15} /><span>Campos fiscais preparatórios. Reutilize regras fiscais existentes. Não invente alíquotas padrão. Verifique NF-e/NFC-e antes de usar em emissão.</span></p>
                      {prepared.avisos.length > 0 && <div className="fp-fiscal-avisos">{prepared.avisos.map((a) => <span key={a} className="fp-fiscal-aviso-item">{a}</span>)}</div>}
                      <section className="fp-group">
                        <h4 className="fp-group-title">Tributação</h4>
                        <div className="fp-grid fp-grid-6">
                          <CampoSelecao id="f-perfil" label="Perfil de tributação" value={form.perfilTributacao} opcoes={PERFIS_TRIBUTACAO} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('perfilTributacao', v)} />
                          <CampoSelecao id="f-origem" label="Origem da mercadoria" value={form.origem} opcoes={ORIGENS_PRODUTO} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('origem', v)} />
                          <CampoSelecao id="f-cst-c" label="CST contribuinte" value={form.cstContribuinte} opcoes={CST_CONTRIBUINTE} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('cstContribuinte', v)} />
                          <CampoSelecao id="f-cst-nc" label="CST não contribuinte" value={form.cstNaoContribuinte} opcoes={CST_NAO_CONTRIBUINTE} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('cstNaoContribuinte', v)} />
                          <CampoSelecao id="f-csosn-c" label="CSOSN contribuinte" value={form.csosnContribuinte} opcoes={CSOSN_CONTRIBUINTE} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('csosnContribuinte', v)} />
                          <CampoSelecao id="f-csosn-nc" label="CSOSN não contribuinte" value={form.csosnNaoContribuinte} opcoes={CSOSN_NAO_CONTRIBUINTE} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('csosnNaoContribuinte', v)} />
                        </div>
                      </section>
                      <section className="fp-group">
                        <h4 className="fp-group-title">Classificação fiscal</h4>
                        <div className="fp-grid fp-grid-5">
                          <CampoSelecao id="f-cfop-nfe" label="CFOP padrão NF-e" value={form.cfopNfe} opcoes={CFOP_NFE} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('cfopNfe', v)} />
                          <CampoSelecao id="f-cfop-nfce" label="CFOP padrão NFC-e" value={form.cfopNfce} opcoes={CFOP_NFCE} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('cfopNfce', v)} />
                          <CampoTexto id="f-ncm" label="NCM" value={form.ncm} placeholder="00000000" readOnly={!podeFiscal || somenteLeitura} erro={mostrarErro('ncm') ? erros.ncm : undefined} onChange={(v) => atualizarCampo('ncm', v.replace(/\D/g, ''))} />
                          <CampoTexto id="f-cest" label="CEST" value={form.cest} placeholder="0000000" readOnly={!podeFiscal || somenteLeitura} erro={mostrarErro('cest') ? erros.cest : undefined} onChange={(v) => atualizarCampo('cest', v.replace(/\D/g, ''))} />
                          <CampoTexto id="f-cbenef" label="cBenef" value={form.cBenef} readOnly={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('cBenef', v)} />
                        </div>
                        <div className="fp-grid fp-grid-3" style={{ marginTop: 12 }}>
                          <CampoTexto id="f-exc" label="Exceção fiscal" value={form.excecaoFiscal} readOnly={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('excecaoFiscal', v)} />
                          <CampoTexto id="f-ut" label="Unidade tributável" value={form.unidadeTributavel} readOnly={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('unidadeTributavel', v)} />
                          <CampoTexto id="f-fc" label="Fator de conversão p/ unidade tributável" value={form.fatorConversaoTributavel} readOnly={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('fatorConversaoTributavel', v)} />
                        </div>
                      </section>
                      <section className="fp-group">
                        <h4 className="fp-group-title">IPI, PIS, COFINS</h4>
                        <div className="fp-grid fp-grid-6">
                          <CampoSelecao id="f-cst-ipi" label="CST IPI" value={form.cstIpi} opcoes={CST_IPI} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('cstIpi', v)} />
                          <CampoTexto id="f-aliq-ipi" label="Alíquota IPI (%)" value={form.aliquotaIpi} readOnly={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('aliquotaIpi', v)} />
                          <CampoSelecao id="f-cst-pis" label="CST PIS" value={form.cstPis} opcoes={CST_PIS} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('cstPis', v)} />
                          <CampoTexto id="f-aliq-pis" label="Alíquota PIS (%)" value={form.aliquotaPis} readOnly={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('aliquotaPis', v)} />
                          <CampoSelecao id="f-cst-cofins" label="CST COFINS" value={form.cstCofins} opcoes={CST_COFINS} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('cstCofins', v)} />
                          <CampoTexto id="f-aliq-cofins" label="Alíquota COFINS (%)" value={form.aliquotaCofins} readOnly={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('aliquotaCofins', v)} />
                        </div>
                      </section>
                      <section className="fp-group">
                        <h4 className="fp-group-title">ICMS e IBS/CBS (Reforma Tributária)</h4>
                        <div className="fp-grid fp-grid-6">
                          <CampoSelecao id="f-trib-c" label="Tributação contribuinte" value={form.tributacaoContribuinte} opcoes={TRIBUTACOES_ICMS} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('tributacaoContribuinte', v)} />
                          <CampoSelecao id="f-trib-nc" label="Tributação não contribuinte" value={form.tributacaoNaoContribuinte} opcoes={TRIBUTACOES_ICMS} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('tributacaoNaoContribuinte', v)} />
                          <CampoTexto id="f-fcp" label="Taxa FCP (%)" value={form.taxaFcp} readOnly={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('taxaFcp', v)} />
                          <CampoTexto id="f-aliq-icms" label="Alíquota ICMS origem (%)" value={form.aliquotaIcmsOrigem} readOnly={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('aliquotaIcmsOrigem', v)} />
                          <CampoSelecao id="f-cst-ibs" label="CST/IBS" value={form.cstIbs} opcoes={CLASSIFICACOES_IBS_CBS} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('cstIbs', v)} />
                          <CampoSelecao id="f-clas-ibs" label="Classificação IBS/CBS" value={form.classificacaoIbsCbs} opcoes={CLASSIFICACOES_IBS_CBS} disabled={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('classificacaoIbsCbs', v)} />
                        </div>
                        <div className="fp-grid fp-grid-3" style={{ marginTop: 12 }}>
                          <CampoTexto id="f-aliq-ibs" label="Alíquota IBS (%)" value={form.aliquotaIbs} readOnly={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('aliquotaIbs', v)} />
                          <CampoTexto id="f-aliq-cbs" label="Alíquota CBS (%)" value={form.aliquotaCbs} readOnly={!podeFiscal || somenteLeitura} onChange={(v) => atualizarCampo('aliquotaCbs', v)} />
                        </div>
                        <textarea className="fp-textarea" style={{ marginTop: 12 }} placeholder="Informações adicionais fiscais" value={form.informacoesAdicionais} rows={3} readOnly={!podeFiscal || somenteLeitura} onChange={(e) => atualizarCampo('informacoesAdicionais', e.target.value)} />
                        {!podeFiscal && <p className="fp-group-hint">Edição fiscal restrita por permissão.</p>}
                      </section>
                    </div>
                  )}

                  {secao.id === 'compras' && (
                    <div className="fp-groups">
                      <section className="fp-group">
                        <h4 className="fp-group-title">Fornecedor</h4>
                        <div className="fp-grid fp-grid-4">
                          <div className="fp-field">
                            <label className="fp-label">Fornecedor principal</label>
                            <select className={`fp-select ${classeErro('fornecedorPreferencialId')}`} value={form.fornecedorPreferencialId} disabled={somenteLeitura} onChange={(e) => { atualizarCampo('fornecedorPreferencialId', e.target.value); marcarTocado('fornecedorPreferencialId'); }}>
                              <option value="">Nenhum fornecedor vinculado</option>
                              {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.razaoSocial}{f.status !== 'Ativo' ? ` (${f.status})` : ''}</option>)}
                            </select>
                            {mostrarErro('fornecedorPreferencialId') && <span className="fp-field-error">{erros.fornecedorPreferencialId}</span>}
                            {fornecedorVinculo.aviso && <span className="fp-field-warning">{fornecedorVinculo.aviso}</span>}
                          </div>
                          <CampoTexto id="c-cod-forn" label="Código do produto no fornecedor" value={form.codigoFornecedor} readOnly={somenteLeitura} onChange={(v) => atualizarCampo('codigoFornecedor', v)} />
                        </div>
                      </section>
                      <section className="fp-group">
                        <h4 className="fp-group-title">Unidades e conversão</h4>
                        <div className="fp-grid fp-grid-4">
                          <CampoSelecao id="c-un-compra" label="Unidade de compra" value={form.unidadeCompra} opcoes={UNIDADES_MEDIDA} disabled={somenteLeitura} onChange={(v) => atualizarCampo('unidadeCompra', v as CodigoUnidadeMedida)} />
                          <CampoSelecao id="c-un-venda" label="Unidade de venda" value={form.unidadeVenda} opcoes={UNIDADES_MEDIDA} disabled={somenteLeitura} onChange={(v) => atualizarCampo('unidadeVenda', v as CodigoUnidadeMedida)} />
                          <CampoTexto id="c-fator" label="Fator de conversão (compra->venda)" value={form.fatorConversaoCompra} readOnly={somenteLeitura} onChange={(v) => atualizarCampo('fatorConversaoCompra', v)} />
                          <CampoTexto id="c-min-compra" label="Quantidade mínima de compra" value={form.quantidadeMinimaCompra} readOnly={somenteLeitura} onChange={(v) => atualizarCampo('quantidadeMinimaCompra', v)} />
                        </div>
                        <div className="fp-grid fp-grid-4" style={{ marginTop: 12 }}>
                          <CampoTexto id="c-prazo" label="Prazo de entrega (dias)" value={form.prazoEntregaDias} inputMode="numeric" readOnly={somenteLeitura} onChange={(v) => atualizarCampo('prazoEntregaDias', v.replace(/\D/g, ''))} />
                          <CampoTexto id="c-ult-qtd" label="Última quantidade comprada" value={form.ultimaQuantidadeComprada} readOnly onChange={() => undefined} />
                          <CampoTexto id="c-ult-custo" label="Último custo" value={form.ultimoCustoAquisicao} readOnly onChange={() => undefined} />
                          <CampoTexto id="c-ult-data" label="Data da última compra" value={form.dataUltimaCompra} readOnly onChange={() => undefined} />
                        </div>
                      </section>
                      <section className="fp-group">
                        <h4 className="fp-group-title">Histórico de compras</h4>
                        <div className="fp-table-wrap">
                          <table className="fp-mini-table">
                            <thead><tr><th>Data</th><th>Fornecedor</th><th>Documento</th><th>Qtd.</th><th>Custo unit.</th></tr></thead>
                            <tbody>
                              {(produtoExistente?.historicoCompras ?? []).length === 0 ? <tr><td colSpan={5}>Sem histórico de compras.</td></tr> : (produtoExistente?.historicoCompras ?? []).map((h) => <tr key={h.id}><td>{formatarDataBr(h.data)}</td><td>{h.fornecedorNome}</td><td>{h.documento}</td><td>{formatarNumero(h.quantidade)}</td><td>{formatarMoeda(h.custoUnitario)}</td></tr>)}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    </div>
                  )}

                  {secao.id === 'vendas' && (
                    <div className="fp-groups">
                      <section className="fp-group">
                        <h4 className="fp-group-title">Controles</h4>
                        <div className="fp-grid fp-grid-2">
                          <CampoToggle label="Controlar estoque" descricao="Movimentar saldo" ativo={form.controlarEstoque} desabilitado={somenteLeitura} onChange={(v) => atualizarCampo('controlarEstoque', v)} />
                        </div>
                      </section>
                      <section className="fp-group">
                        <h4 className="fp-group-title">Observações para o vendedor</h4>
                        <textarea className="fp-textarea" value={form.observacoesVendedor} rows={3} readOnly={somenteLeitura} onChange={(e) => atualizarCampo('observacoesVendedor', e.target.value)} />
                      </section>
                      <p className="fp-group-hint">Integração com PDV: respeita bloqueios, permissões e regras de desconto. Vendas de kits exigem controle de estoque dos componentes.</p>
                    </div>
                  )}

                  {secao.id === 'complementares' && (
                    <div className="fp-groups">
                      <section className="fp-group">
                        <h4 className="fp-group-title">Auditoria</h4>
                        <div className="fp-grid fp-grid-4">
                          <div className="fp-field"><label className="fp-label">Data de criação</label><input className="fp-input fp-readonly" value={formatarDataHoraBr(produtoExistente?.criadoEm ?? '')} readOnly /></div>
                          <div className="fp-field"><label className="fp-label">Usuário responsável pela criação</label><input className="fp-input fp-readonly" value={produtoExistente?.criadoPor ?? usuario?.nome ?? ''} readOnly /></div>
                          <div className="fp-field"><label className="fp-label">Data da última alteração</label><input className="fp-input fp-readonly" value={formatarDataHoraBr(produtoExistente?.atualizadoEm ?? '')} readOnly /></div>
                          <div className="fp-field"><label className="fp-label">Usuário responsável pela última alteração</label><input className="fp-input fp-readonly" value={produtoExistente?.atualizadoPor ?? ''} readOnly /></div>
                        </div>
                        <div className="fp-grid fp-grid-2" style={{ marginTop: 12 }}>
                          <div className="fp-field"><label className="fp-label">Status atual</label><input className="fp-input fp-readonly" value={form.ativo ? 'Ativo' : 'Inativo'} readOnly /></div>
                          <div className="fp-field"><label className="fp-label">Motivo da inativação</label><input className="fp-input fp-readonly" value={produtoExistente?.motivoInativacao ?? form.motivoInativacao} readOnly /></div>
                        </div>
                      </section>
                      <section className="fp-group">
                        <h4 className="fp-group-title">Histórico de alterações relevantes</h4>
                        <div className="fp-table-wrap">
                          <table className="fp-mini-table">
                            <thead><tr><th>Data/Hora</th><th>Usuário</th><th>Campo</th><th>Anterior</th><th>Novo</th><th>Motivo</th></tr></thead>
                            <tbody>
                              {(produtoExistente?.historicoAlteracoes ?? []).length === 0 ? <tr><td colSpan={6}>Sem alterações registradas.</td></tr> : [...(produtoExistente?.historicoAlteracoes ?? [])].reverse().map((h) => <tr key={h.id}><td>{formatarDataHoraBr(h.data)}</td><td>{h.usuario}</td><td>{h.campo}</td><td>{h.valorAnterior}</td><td>{h.valorNovo}</td><td>{h.motivo ?? ''}</td></tr>)}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toast && (
        <div className={`fp-toast fp-toast-${toast.type}`} role="status">
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button type="button" className="fp-toast-close" onClick={() => setToast(null)}><X size={16} /></button>
        </div>
      )}
    </div>
  );
};
