import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Building2,
  CheckCircle2,
  Ban,
  Columns3,
  Printer,
  FileText,
  FileSpreadsheet,
  X,
  CheckCheck,
  RotateCcw,
  Menu,
  Check,
  Lock,
} from 'lucide-react';
import {
  listarFornecedores,
  buscarFornecedorPorId,
} from '../../../services/fornecedorStorage';
import type { Fornecedor } from '../../../types';
import { gerarProximoFornecedorId } from '../../../utils/fornecedorId';
import './Fornecedores.css';

const ITEMS_PER_PAGE = 10;
const COLUMN_STORAGE_KEY = 'fornecedores-visible-columns';
const COLUMN_ORDER_STORAGE_KEY = 'fornecedores-column-order';

type ColumnKey =
  | 'codigo'
  | 'fornecedor'
  | 'tipo'
  | 'cpfCnpj'
  | 'nomeFantasia'
  | 'telefone'
  | 'cidade'
  | 'categoria'
  | 'status'
  | 'cadastro'
  | 'rg'
  | 'ie'
  | 'im'
  | 'dataNascimento'
  | 'dataAbertura'
  | 'naturezaJuridica'
  | 'regimeTributario'
  | 'suframa'
  | 'celular'
  | 'email'
  | 'emailFinanceiro'
  | 'site'
  | 'cep'
  | 'logradouro'
  | 'numero'
  | 'complemento'
  | 'bairro'
  | 'pais'
  | 'observacoes'
  | 'acoes';

interface Column {
  key: ColumnKey;
  label: string;
}

const columns: Column[] = [
  { key: 'codigo', label: 'Código' },
  { key: 'fornecedor', label: 'Fornecedor' },
  { key: 'nomeFantasia', label: 'Nome Fantasia' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'cpfCnpj', label: 'CPF/CNPJ' },
  { key: 'rg', label: 'RG' },
  { key: 'ie', label: 'IE' },
  { key: 'im', label: 'IM' },
  { key: 'dataNascimento', label: 'Nascimento' },
  { key: 'dataAbertura', label: 'Abertura' },
  { key: 'naturezaJuridica', label: 'Natureza Jurídica' },
  { key: 'regimeTributario', label: 'Regime Tributário' },
  { key: 'suframa', label: 'SUFRAMA' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'celular', label: 'Celular' },
  { key: 'email', label: 'E-mail' },
  { key: 'emailFinanceiro', label: 'E-mail Financeiro' },
  { key: 'site', label: 'Site' },
  { key: 'cep', label: 'CEP' },
  { key: 'logradouro', label: 'Logradouro' },
  { key: 'numero', label: 'Número' },
  { key: 'complemento', label: 'Complemento' },
  { key: 'bairro', label: 'Bairro' },
  { key: 'cidade', label: 'Cidade/UF' },
  { key: 'pais', label: 'País' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'status', label: 'Status' },
  { key: 'cadastro', label: 'Cadastro' },
  { key: 'observacoes', label: 'Observações' },
];

const MASTER_ORDER: ColumnKey[] = [...columns.map((col) => col.key), 'acoes'];

const defaultVisibleColumns: Record<ColumnKey, boolean> = {
  codigo: true,
  fornecedor: true,
  nomeFantasia: true,
  tipo: true,
  cpfCnpj: true,
  rg: false,
  ie: false,
  im: false,
  dataNascimento: false,
  dataAbertura: false,
  naturezaJuridica: false,
  regimeTributario: false,
  suframa: false,
  telefone: true,
  celular: false,
  email: false,
  emailFinanceiro: false,
  site: false,
  cep: false,
  logradouro: false,
  numero: false,
  complemento: false,
  bairro: false,
  cidade: true,
  pais: false,
  categoria: true,
  status: true,
  cadastro: false,
  observacoes: false,
  acoes: true,
};

const REGIME_LABELS: Record<string, string> = {
  simples_nacional: 'Simples Nacional',
  simples_nacional_mei: 'Simples Nacional — MEI',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
  nao_informado: 'Não informado',
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

export const Fornecedores: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(() => {
    const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (saved) {
      try {
        return { ...defaultVisibleColumns, ...JSON.parse(saved) };
      } catch {
        return defaultVisibleColumns;
      }
    }
    return defaultVisibleColumns;
  });
  const [columnOrder, setColumnOrder] = useState<ColumnKey[]>(() => {
    const saved = localStorage.getItem(COLUMN_ORDER_STORAGE_KEY);
    let merged: ColumnKey[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          merged = parsed.filter((key: ColumnKey) => MASTER_ORDER.includes(key));
        }
      } catch {
        merged = [];
      }
    }
    MASTER_ORDER.forEach((key) => {
      if (!merged.includes(key)) merged.push(key);
    });
    const semCodigo = merged.filter((key) => key !== 'codigo');
    return ['codigo', ...semCodigo];
  });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const toolbarActionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    localStorage.setItem(COLUMN_ORDER_STORAGE_KEY, JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarActionsRef.current &&
        !toolbarActionsRef.current.contains(event.target as Node)
      ) {
        setIsColumnsOpen(false);
        setIsPrintOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fornecedores = useMemo(() => listarFornecedores(), []);

  const filteredFornecedores = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return fornecedores.filter((fornecedor) => {
      const matchesSearch =
        fornecedor.razaoSocial.toLowerCase().includes(term) ||
        (fornecedor.nomeFantasia || '').toLowerCase().includes(term) ||
        fornecedor.cpfCnpj.includes(searchTerm) ||
        fornecedor.codigo.toLowerCase().includes(term) ||
        (fornecedor.email || '').toLowerCase().includes(term) ||
        fornecedor.telefone.includes(searchTerm) ||
        fornecedor.categoria.toLowerCase().includes(term);

      const matchesTipo = filterTipo === 'todos' || fornecedor.tipo === filterTipo;
      const matchesStatus = filterStatus === 'todos' || fornecedor.status === filterStatus;

      return matchesSearch && matchesTipo && matchesStatus;
    });
  }, [searchTerm, filterTipo, filterStatus, fornecedores]);

  const visibleColumnDefs = useMemo(
    () =>
      columnOrder
        .filter((key) => visibleColumns[key])
        .map((key) => {
          const col = columns.find((c) => c.key === key);
          return col || { key, label: 'Ações' };
        }),
    [columnOrder, visibleColumns]
  );

  const totalPages = Math.ceil(filteredFornecedores.length / ITEMS_PER_PAGE);
  const paginatedFornecedores = filteredFornecedores.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalAtivos = fornecedores.filter((f) => f.status === 'Ativo').length;
  const totalInativos = fornecedores.filter((f) => f.status === 'Inativo').length;
  const totalBloqueados = fornecedores.filter((f) => f.status === 'Bloqueado').length;

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (event: React.DragEvent, overIndex: number) => {
    event.preventDefault();
    if (dragOverIndex !== overIndex) {
      setDragOverIndex(overIndex);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setColumnOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getPaginationRange = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const handleNovoFornecedor = () => {
    let novoId = gerarProximoFornecedorId();
    let tentativas = 0;
    while (buscarFornecedorPorId(novoId) !== undefined && tentativas < 100) {
      novoId = gerarProximoFornecedorId();
      tentativas += 1;
    }
    navigate(`/cadastros/fornecedores/${novoId}`);
  };

  const getExportValue = (fornecedor: Fornecedor, key: ColumnKey): string => {
    switch (key) {
      case 'fornecedor':
        return fornecedor.razaoSocial;
      case 'codigo':
        return fornecedor.codigo;
      case 'nomeFantasia':
        return fornecedor.nomeFantasia || '';
      case 'tipo':
        return fornecedor.tipo;
      case 'cpfCnpj':
        return fornecedor.cpfCnpj;
      case 'rg':
        return fornecedor.rg || '';
      case 'ie':
        return fornecedor.inscricaoEstadual || '';
      case 'im':
        return fornecedor.inscricaoMunicipal || '';
      case 'dataNascimento':
        return fornecedor.dataNascimento || '';
      case 'dataAbertura':
        return fornecedor.dataAbertura || '';
      case 'naturezaJuridica':
        return fornecedor.naturezaJuridica || '';
      case 'regimeTributario':
        return fornecedor.regimeTributario ? REGIME_LABELS[fornecedor.regimeTributario] || '' : '';
      case 'suframa':
        return fornecedor.suframa || '';
      case 'telefone':
        return fornecedor.telefone;
      case 'celular':
        return fornecedor.celular || '';
      case 'email':
        return fornecedor.email || '';
      case 'emailFinanceiro':
        return fornecedor.emailFinanceiro || '';
      case 'site':
        return fornecedor.site || '';
      case 'cep':
        return fornecedor.cep || '';
      case 'logradouro':
        return fornecedor.logradouro || '';
      case 'numero':
        return fornecedor.numero || '';
      case 'complemento':
        return fornecedor.complemento || '';
      case 'bairro':
        return fornecedor.bairro || '';
      case 'cidade':
        return `${fornecedor.cidade}/${fornecedor.uf}`;
      case 'pais':
        return fornecedor.pais || '';
      case 'categoria':
        return fornecedor.categoria;
      case 'status':
        return fornecedor.status;
      case 'cadastro':
        return fornecedor.dataCadastro;
      case 'observacoes':
        return fornecedor.observacoes || '';
      default:
        return '';
    }
  };

  const buildExportTableHtml = () => {
    const cols = visibleColumnDefs.filter((col) => col.key !== 'acoes');
    const headers = cols.map((col) => col.label);
    const rows = filteredFornecedores.map((fornecedor) =>
      cols.map((col) => getExportValue(fornecedor, col.key))
    );
    const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
    const body = rows
      .map(
        (row) => `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`
      )
      .join('');
    return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  };

  const handleExportPdf = () => {
    const table = buildExportTableHtml();
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Fornecedores</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #0F172A; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    p { margin: 0 0 16px; color: #64748B; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #E2E8F0; padding: 8px; font-size: 12px; text-align: left; }
    th { background: #F1F5F9; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>Fornecedores</h1>
  <p>Emitido em ${new Date().toLocaleString('pt-BR')} — ${filteredFornecedores.length} registro(s)</p>
  ${table}
</body>
</html>`);
    win.document.close();
    win.focus();
    win.print();
    setIsPrintOpen(false);
  };

  const handleExportExcel = () => {
    const table = buildExportTableHtml();
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="utf-8" /></head>
<body>${table}</body>
</html>`;
    const blob = new Blob(['\ufeff' + html], {
      type: 'application/vnd.ms-excel;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fornecedores-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsPrintOpen(false);
  };

  const renderCell = (fornecedor: Fornecedor, key: ColumnKey) => {
    const text = (value?: string) => <>{value || '-'}</>;
    switch (key) {
      case 'fornecedor':
        return (
          <div className="forn-name">
            <div className="forn-avatar">{getInitials(fornecedor.razaoSocial)}</div>
            <div className="forn-info">
              <span className="forn-info-name">{fornecedor.razaoSocial}</span>
              <span className="forn-info-email">{fornecedor.email || '-'}</span>
            </div>
          </div>
        );
      case 'codigo':
        return <span className="forn-codigo">{fornecedor.codigo}</span>;
      case 'nomeFantasia':
        return text(fornecedor.nomeFantasia);
      case 'tipo':
        return <span className={`forn-tipo-badge ${fornecedor.tipo.toLowerCase()}`}>{fornecedor.tipo}</span>;
      case 'cpfCnpj':
        return fornecedor.cpfCnpj;
      case 'rg':
        return text(fornecedor.rg);
      case 'ie':
        return text(fornecedor.inscricaoEstadual);
      case 'im':
        return text(fornecedor.inscricaoMunicipal);
      case 'dataNascimento':
        return text(fornecedor.dataNascimento);
      case 'dataAbertura':
        return text(fornecedor.dataAbertura);
      case 'naturezaJuridica':
        return text(fornecedor.naturezaJuridica);
      case 'regimeTributario':
        return text(fornecedor.regimeTributario ? REGIME_LABELS[fornecedor.regimeTributario] : '');
      case 'suframa':
        return text(fornecedor.suframa);
      case 'telefone':
        return fornecedor.telefone;
      case 'celular':
        return text(fornecedor.celular);
      case 'email':
        return fornecedor.email || '-';
      case 'emailFinanceiro':
        return text(fornecedor.emailFinanceiro);
      case 'site':
        return text(fornecedor.site);
      case 'cep':
        return text(fornecedor.cep);
      case 'logradouro':
        return text(fornecedor.logradouro);
      case 'numero':
        return text(fornecedor.numero);
      case 'complemento':
        return text(fornecedor.complemento);
      case 'bairro':
        return text(fornecedor.bairro);
      case 'cidade':
        return `${fornecedor.cidade}/${fornecedor.uf}`;
      case 'pais':
        return text(fornecedor.pais);
      case 'categoria':
        return fornecedor.categoria;
      case 'status':
        return (
          <span className={`forn-badge ${fornecedor.status.toLowerCase()}`}>
            {fornecedor.status}
          </span>
        );
      case 'cadastro':
        return fornecedor.dataCadastro;
      case 'observacoes':
        return text(fornecedor.observacoes);
      case 'acoes':
        return (
          <div className="forn-actions">
            <button
              className="forn-action-btn"
              title="Visualizar"
              onClick={() => navigate(`/cadastros/fornecedores/${fornecedor.id}`)}
            >
              <Eye size={16} />
            </button>
            <button
              className="forn-action-btn"
              title="Editar"
              onClick={() => navigate(`/cadastros/fornecedores/${fornecedor.id}`)}
            >
              <Pencil size={16} />
            </button>
            <button className="forn-action-btn delete" title="Excluir">
              <Trash2 size={16} />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fornecedores-page">
      <div className="fornecedores-header">
        <div className="fornecedores-header-left">
          <button
            className="forn-back-btn"
            onClick={() => navigate('/cadastros')}
            title="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="fornecedores-header-icon">
            <Truck size={24} />
          </div>
          <div className="fornecedores-header-content">
            <h1 className="fornecedores-page-title">Fornecedores</h1>
            <p className="fornecedores-page-subtitle">
              Consulte e gerencie os fornecedores da empresa.
            </p>
          </div>
        </div>
        <button className="forn-btn-novo" onClick={handleNovoFornecedor}>
          <Plus size={18} />
          Novo Fornecedor
        </button>
      </div>

      <div className="fornecedores-indicators">
        <div className="forn-indicator-box">
          <div className="forn-indicator-icon blue">
            <Building2 size={20} />
          </div>
          <div className="forn-indicator-text">
            <span className="forn-indicator-value">{fornecedores.length}</span>
            <span className="forn-indicator-label">Total de Fornecedores</span>
          </div>
        </div>
        <div className="forn-indicator-box">
          <div className="forn-indicator-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div className="forn-indicator-text">
            <span className="forn-indicator-value">{totalAtivos}</span>
            <span className="forn-indicator-label">Ativos</span>
          </div>
        </div>
        <div className="forn-indicator-box">
          <div className="forn-indicator-icon orange">
            <Ban size={20} />
          </div>
          <div className="forn-indicator-text">
            <span className="forn-indicator-value">{totalInativos}</span>
            <span className="forn-indicator-label">Inativos</span>
          </div>
        </div>
        <div className="forn-indicator-box">
          <div className="forn-indicator-icon red">
            <Ban size={20} />
          </div>
          <div className="forn-indicator-text">
            <span className="forn-indicator-value">{totalBloqueados}</span>
            <span className="forn-indicator-label">Bloqueados</span>
          </div>
        </div>
      </div>

      <div className="fornecedores-toolbar">
        <div className="forn-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por razão social, nome fantasia, CPF/CNPJ, código, categoria..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="forn-filter-group">
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="forn-filter-select"
            value={filterTipo}
            onChange={(e) => {
              setFilterTipo(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="todos">Tipo</option>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </select>
          <select
            className="forn-filter-select"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Bloqueado">Bloqueado</option>
            <option value="todos">Todos</option>
          </select>
        </div>
        <div className="forn-toolbar-actions" ref={toolbarActionsRef}>
          <div className="forn-dropdown-wrapper">
            <button
              className={`forn-toolbar-btn ${isColumnsOpen ? 'active' : ''}`}
              onClick={() => {
                setIsColumnsOpen((prev) => !prev);
                setIsPrintOpen(false);
              }}
            >
              <Columns3 size={16} />
              Colunas
            </button>
            {isColumnsOpen && (
              <div className="forn-modal-overlay" onClick={() => setIsColumnsOpen(false)}>
                <div className="forn-columns-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="forn-columns-modal-header">
                    <h3>Colunas exibidas</h3>
                    <button
                      className="forn-columns-modal-close"
                      onClick={() => setIsColumnsOpen(false)}
                      title="Fechar"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="forn-columns-modal-body">
                    {columnOrder.map((key, index) => {
                      const isAcoes = key === 'acoes';
                      const col = columns.find((c) => c.key === key);
                      const label = isAcoes ? 'Ações' : col?.label || '';
                      return (
                        <div
                          key={key}
                          className={`forn-columns-row ${dragIndex === index ? 'dragging' : ''} ${
                            dragOverIndex === index && dragIndex !== null ? 'drop-target' : ''
                          }`}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={() => handleDrop(index)}
                          onDragEnd={handleDragEnd}
                        >
                          <label className="forn-columns-check">
                            <input
                              type="checkbox"
                              checked={isAcoes || visibleColumns[key]}
                              disabled={isAcoes}
                              onChange={() => toggleColumn(key)}
                            />
                            <span
                              className={`forn-columns-check-box ${
                                isAcoes || visibleColumns[key] ? 'checked' : ''
                              }`}
                            >
                              {(isAcoes || visibleColumns[key]) && (
                                <Check size={12} strokeWidth={3} />
                              )}
                            </span>
                          </label>
                          <span className="forn-columns-row-label">
                            {label}
                            {isAcoes && <Lock size={13} className="forn-columns-row-lock" />}
                          </span>
                          <span className="forn-columns-row-bars" title="Arrastar para reordenar">
                            <Menu size={16} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="forn-columns-modal-footer">
                    <button
                      className="forn-columns-modal-btn secondary"
                      onClick={() => {
                        setVisibleColumns({ ...defaultVisibleColumns, acoes: true });
                        setColumnOrder([...MASTER_ORDER]);
                      }}
                    >
                      <RotateCcw size={16} />
                      Restaurar padrão
                    </button>
                    <button
                      className="forn-columns-modal-btn"
                      onClick={() => setIsColumnsOpen(false)}
                    >
                      <CheckCheck size={16} />
                      Concluir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="forn-dropdown-wrapper">
            <button
              className={`forn-toolbar-btn ${isPrintOpen ? 'active' : ''}`}
              onClick={() => {
                setIsPrintOpen((prev) => !prev);
                setIsColumnsOpen(false);
              }}
            >
              <Printer size={16} />
              Imprimir
            </button>
            {isPrintOpen && (
              <div className="forn-print-menu">
                <button className="forn-print-option" onClick={handleExportPdf}>
                  <FileText size={16} />
                  <div>
                    <span>PDF</span>
                    <small>Salvar ou imprimir</small>
                  </div>
                </button>
                <button className="forn-print-option" onClick={handleExportExcel}>
                  <FileSpreadsheet size={16} />
                  <div>
                    <span>Excel</span>
                    <small>Exportar .xls</small>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fornecedores-table-container">
        <table className="fornecedores-table">
          <thead>
            <tr>
              {visibleColumnDefs.map((col) => (
                <th key={col.key} className={`forn-th forn-th-${col.key}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedFornecedores.map((fornecedor) => (
              <tr key={fornecedor.id}>
                {visibleColumnDefs.map((col) => (
                  <td key={col.key} className={`forn-td forn-td-${col.key}`}>
                    {renderCell(fornecedor, col.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedFornecedores.length === 0 && (
          <div className="forn-empty">Nenhum fornecedor encontrado.</div>
        )}

        {filteredFornecedores.length > 0 && (
          <div className="fornecedores-pagination">
            <span className="forn-pagination-info">
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredFornecedores.length)} de{' '}
              {filteredFornecedores.length} fornecedores
            </span>
            <div className="forn-pagination-controls">
              <button
                className="forn-pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {getPaginationRange().map((page, index) =>
                typeof page === 'string' ? (
                  <span key={`dots-${index}`} className="forn-pagination-btn dots">
                    {page}
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`forn-pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="forn-pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
