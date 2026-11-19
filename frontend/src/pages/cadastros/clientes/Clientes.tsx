import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  UserCheck,
  Search,
  Filter,
  UserPlus,
  Users,
  UserX,
  User,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Printer,
  FileText,
  FileSpreadsheet,
  X,
  CheckCheck,
  RotateCcw,
  Menu,
  Check,
  Lock
} from 'lucide-react';
import { clientesData } from '../../../data/clientes';
import type { Cliente } from '../../../types';
import { gerarProximoClienteId } from '../../../utils/clienteId';
import './Clientes.css';

const ITEMS_PER_PAGE = 10;
const COLUMN_STORAGE_KEY = 'clientes-visible-columns';
const COLUMN_ORDER_STORAGE_KEY = 'clientes-column-order';

type ColumnKey =
  | 'cliente'
  | 'tipo'
  | 'cpfCnpj'
  | 'telefone'
  | 'cidade'
  | 'status'
  | 'cadastro'
  | 'razaoSocial'
  | 'nomeFantasia'
  | 'rg'
  | 'ie'
  | 'im'
  | 'dataNascimento'
  | 'sexo'
  | 'celular'
  | 'email'
  | 'emailFinanceiro'
  | 'cep'
  | 'logradouro'
  | 'numero'
  | 'complemento'
  | 'bairro'
  | 'pais'
  | 'vendedor'
  | 'limiteCredito'
  | 'condicaoPagamento'
  | 'observacoes'
  | 'acoes';

interface Column {
  key: ColumnKey;
  label: string;
}

const columns: Column[] = [
  { key: 'cliente', label: 'Cliente' },
  { key: 'razaoSocial', label: 'Razão Social' },
  { key: 'nomeFantasia', label: 'Nome Fantasia' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'cpfCnpj', label: 'CPF/CNPJ' },
  { key: 'rg', label: 'RG' },
  { key: 'ie', label: 'IE' },
  { key: 'im', label: 'IM' },
  { key: 'dataNascimento', label: 'Nascimento' },
  { key: 'sexo', label: 'Sexo' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'celular', label: 'Celular' },
  { key: 'email', label: 'E-mail' },
  { key: 'emailFinanceiro', label: 'E-mail Financeiro' },
  { key: 'cep', label: 'CEP' },
  { key: 'logradouro', label: 'Logradouro' },
  { key: 'numero', label: 'Número' },
  { key: 'complemento', label: 'Complemento' },
  { key: 'bairro', label: 'Bairro' },
  { key: 'cidade', label: 'Cidade/UF' },
  { key: 'pais', label: 'País' },
  { key: 'status', label: 'Status' },
  { key: 'cadastro', label: 'Cadastro' },
  { key: 'vendedor', label: 'Vendedor' },
  { key: 'limiteCredito', label: 'Limite de Crédito' },
  { key: 'condicaoPagamento', label: 'Cond. Pagamento' },
  { key: 'observacoes', label: 'Observações' },
];

const MASTER_ORDER: ColumnKey[] = [...columns.map((col) => col.key), 'acoes'];

const defaultVisibleColumns: Record<ColumnKey, boolean> = {
  cliente: true,
  razaoSocial: false,
  nomeFantasia: false,
  tipo: true,
  cpfCnpj: true,
  rg: false,
  ie: false,
  im: false,
  dataNascimento: false,
  sexo: false,
  telefone: true,
  celular: false,
  email: false,
  emailFinanceiro: false,
  cep: false,
  logradouro: false,
  numero: false,
  complemento: false,
  bairro: false,
  cidade: true,
  pais: false,
  status: true,
  cadastro: true,
  vendedor: false,
  limiteCredito: false,
  condicaoPagamento: false,
  observacoes: false,
  acoes: true,
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const Clientes: React.FC = () => {
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
    return merged;
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

  const filteredClientes = useMemo(() => {
    return clientesData.filter((cliente) => {
      const matchesSearch =
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cpfCnpj.includes(searchTerm) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefone.includes(searchTerm);

      const matchesTipo = filterTipo === 'todos' || cliente.tipo === filterTipo;
      const matchesStatus = filterStatus === 'todos' || cliente.status === filterStatus;

      return matchesSearch && matchesTipo && matchesStatus;
    });
  }, [searchTerm, filterTipo, filterStatus]);

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

  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);
  const paginatedClientes = filteredClientes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalAtivos = clientesData.filter((c) => c.status === 'Ativo').length;
  const totalInativos = clientesData.filter((c) => c.status === 'Inativo').length;
  const totalPJ = clientesData.filter((c) => c.tipo === 'PJ').length;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getExportValue = (cliente: Cliente, key: ColumnKey): string => {
    switch (key) {
      case 'cliente':
        return cliente.nome;
      case 'razaoSocial':
        return cliente.razaoSocial || '';
      case 'nomeFantasia':
        return cliente.nomeFantasia || '';
      case 'tipo':
        return cliente.tipo;
      case 'cpfCnpj':
        return cliente.cpfCnpj;
      case 'rg':
        return cliente.rg || '';
      case 'ie':
        return cliente.ie || '';
      case 'im':
        return cliente.im || '';
      case 'dataNascimento':
        return cliente.dataNascimento || '';
      case 'sexo':
        return cliente.sexo || '';
      case 'telefone':
        return cliente.telefone;
      case 'celular':
        return cliente.celular || '';
      case 'email':
        return cliente.email;
      case 'emailFinanceiro':
        return cliente.emailFinanceiro || '';
      case 'cep':
        return cliente.cep || '';
      case 'logradouro':
        return cliente.logradouro || '';
      case 'numero':
        return cliente.numero || '';
      case 'complemento':
        return cliente.complemento || '';
      case 'bairro':
        return cliente.bairro || '';
      case 'cidade':
        return `${cliente.cidade}/${cliente.uf}`;
      case 'pais':
        return cliente.pais || '';
      case 'status':
        return cliente.status;
      case 'cadastro':
        return cliente.dataCadastro;
      case 'vendedor':
        return cliente.vendedor || '';
      case 'limiteCredito':
        return cliente.limiteCredito || '';
      case 'condicaoPagamento':
        return cliente.condicaoPagamento || '';
      case 'observacoes':
        return cliente.observacoes || '';
      default:
        return '';
    }
  };

  const buildExportData = () => {
    const cols = visibleColumnDefs.filter((col) => col.key !== 'acoes');
    const headers = cols.map((col) => col.label);
    const rows = filteredClientes.map((cliente) =>
      cols.map((col) => getExportValue(cliente, col.key))
    );
    return { headers, rows };
  };

  const buildExportTableHtml = () => {
    const { headers, rows } = buildExportData();
    const head = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
    const body = rows
      .map(
        (row) =>
          `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join('')}</tr>`
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
  <title>Clientes</title>
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
  <h1>Clientes</h1>
  <p>Emitido em ${new Date().toLocaleString('pt-BR')} — ${filteredClientes.length} registro(s)</p>
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
    link.download = `clientes-${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsPrintOpen(false);
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

  const renderCell = (cliente: Cliente, key: ColumnKey) => {
    const text = (value?: string) => <>{value || '-'}</>;
    switch (key) {
      case 'cliente':
        return (
          <div className="client-name">
            <div className="client-avatar">{getInitials(cliente.nome)}</div>
            <div className="client-info">
              <span className="client-info-name">{cliente.nome}</span>
              <span className="client-info-email">{cliente.email}</span>
            </div>
          </div>
        );
      case 'razaoSocial':
        return text(cliente.razaoSocial);
      case 'nomeFantasia':
        return text(cliente.nomeFantasia);
      case 'tipo':
        return <span className={`badge ${cliente.tipo.toLowerCase()}`}>{cliente.tipo}</span>;
      case 'cpfCnpj':
        return cliente.cpfCnpj;
      case 'rg':
        return text(cliente.rg);
      case 'ie':
        return text(cliente.ie);
      case 'im':
        return text(cliente.im);
      case 'dataNascimento':
        return text(cliente.dataNascimento);
      case 'sexo':
        return text(cliente.sexo);
      case 'telefone':
        return cliente.telefone;
      case 'celular':
        return text(cliente.celular);
      case 'email':
        return cliente.email;
      case 'emailFinanceiro':
        return text(cliente.emailFinanceiro);
      case 'cep':
        return text(cliente.cep);
      case 'logradouro':
        return text(cliente.logradouro);
      case 'numero':
        return text(cliente.numero);
      case 'complemento':
        return text(cliente.complemento);
      case 'bairro':
        return text(cliente.bairro);
      case 'cidade':
        return `${cliente.cidade}/${cliente.uf}`;
      case 'pais':
        return text(cliente.pais);
      case 'status':
        return (
          <span className={`badge ${cliente.status.toLowerCase()}`}>{cliente.status}</span>
        );
      case 'cadastro':
        return cliente.dataCadastro;
      case 'vendedor':
        return text(cliente.vendedor);
      case 'limiteCredito':
        return text(cliente.limiteCredito);
      case 'condicaoPagamento':
        return text(cliente.condicaoPagamento);
      case 'observacoes':
        return text(cliente.observacoes);
      case 'acoes':
        return (
          <div className="actions-cell">
            <button
              className="action-btn"
              title="Visualizar"
              onClick={() => navigate(`/cadastros/clientes/${cliente.id}`)}
            >
              <Eye size={16} />
            </button>
            <button
              className="action-btn"
              title="Editar"
              onClick={() => navigate(`/cadastros/clientes/${cliente.id}`)}
            >
              <Pencil size={16} />
            </button>
            <button className="action-btn delete" title="Excluir">
              <Trash2 size={16} />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <div className="clientes-header-left">
          <button className="back-btn" onClick={() => navigate('/cadastros')} title="Voltar">
            <ArrowLeft size={18} />
          </button>
          <div className="clientes-header-icon">
            <UserCheck size={24} />
          </div>
          <div className="clientes-header-content">
            <h1 className="clientes-page-title">Clientes</h1>
            <p className="clientes-page-subtitle">Gerencie seus clientes</p>
          </div>
        </div>
        <button className="btn-novo" onClick={() => {
          const novoId = gerarProximoClienteId();
          navigate(`/cadastros/clientes/${novoId}`);
        }}>
          <UserPlus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className="clientes-indicators">
        <div className="indicator-box">
          <div className="indicator-box-icon blue">
            <Users size={20} />
          </div>
          <div className="indicator-box-text">
            <span className="indicator-box-value">{clientesData.length}</span>
            <span className="indicator-box-label">Total de Clientes</span>
          </div>
        </div>
        <div className="indicator-box">
          <div className="indicator-box-icon green">
            <User size={20} />
          </div>
          <div className="indicator-box-text">
            <span className="indicator-box-value">{totalAtivos}</span>
            <span className="indicator-box-label">Ativos</span>
          </div>
        </div>
        <div className="indicator-box">
          <div className="indicator-box-icon orange">
            <UserX size={20} />
          </div>
          <div className="indicator-box-text">
            <span className="indicator-box-value">{totalInativos}</span>
            <span className="indicator-box-label">Inativos</span>
          </div>
        </div>
        <div className="indicator-box">
          <div className="indicator-box-icon purple">
            <Users size={20} />
          </div>
          <div className="indicator-box-text">
            <span className="indicator-box-value">{totalPJ}</span>
            <span className="indicator-box-label">Pessoa Jurídica</span>
          </div>
        </div>
      </div>

      <div className="clientes-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ, email ou telefone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="filter-group">
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="filter-select"
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
            className="filter-select"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="todos">Todos</option>
          </select>
        </div>
        <div className="toolbar-actions" ref={toolbarActionsRef}>
          <div className="dropdown-wrapper">
            <button
              className={`toolbar-btn ${isColumnsOpen ? 'active' : ''}`}
              onClick={() => {
                setIsColumnsOpen((prev) => !prev);
                setIsPrintOpen(false);
              }}
            >
              <Columns3 size={16} />
              Colunas
            </button>
            {isColumnsOpen && (
              <div className="modal-overlay" onClick={() => setIsColumnsOpen(false)}>
                <div className="columns-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="columns-modal-header">
                    <h3>Colunas exibidas</h3>
                    <button
                      className="columns-modal-close"
                      onClick={() => setIsColumnsOpen(false)}
                      title="Fechar"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="columns-modal-body">
                    {columnOrder.map((key, index) => {
                      const isAcoes = key === 'acoes';
                      const col = columns.find((c) => c.key === key);
                      const label = isAcoes ? 'Ações' : col?.label || '';
                      return (
                        <div
                          key={key}
                          className={`columns-row ${dragIndex === index ? 'dragging' : ''} ${
                            dragOverIndex === index && dragIndex !== null ? 'drop-target' : ''
                          }`}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={() => handleDrop(index)}
                          onDragEnd={handleDragEnd}
                        >
                          <label className="columns-check">
                            <input
                              type="checkbox"
                              checked={isAcoes || visibleColumns[key]}
                              disabled={isAcoes}
                              onChange={() => toggleColumn(key)}
                            />
                            <span
                              className={`columns-check-box ${isAcoes || visibleColumns[key] ? 'checked' : ''}`}
                            >
                              {(isAcoes || visibleColumns[key]) && (
                                <Check size={12} strokeWidth={3} />
                              )}
                            </span>
                          </label>
                          <span className="columns-row-label">
                            {label}
                            {isAcoes && (
                              <Lock size={13} className="columns-row-lock" />
                            )}
                          </span>
                          <span className="columns-row-bars" title="Arrastar para reordenar">
                            <Menu size={16} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="columns-modal-footer">
                    <button
                      className="columns-modal-btn secondary"
                      onClick={() => {
                        setVisibleColumns({
                          ...defaultVisibleColumns,
                          acoes: true,
                        });
                        setColumnOrder([...MASTER_ORDER]);
                      }}
                    >
                      <RotateCcw size={16} />
                      Restaurar padrão
                    </button>
                    <button
                      className="columns-modal-btn"
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
          <div className="dropdown-wrapper">
            <button
              className={`toolbar-btn ${isPrintOpen ? 'active' : ''}`}
              onClick={() => {
                setIsPrintOpen((prev) => !prev);
                setIsColumnsOpen(false);
              }}
            >
              <Printer size={16} />
              Imprimir
            </button>
            {isPrintOpen && (
              <div className="print-menu">
                <button className="print-option" onClick={handleExportPdf}>
                  <FileText size={16} />
                  <div>
                    <span>PDF</span>
                    <small>Salvar ou imprimir</small>
                  </div>
                </button>
                <button className="print-option" onClick={handleExportExcel}>
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

      <div className="clientes-table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              {visibleColumnDefs.map((col) => (
                <th key={col.key} className={col.key === 'acoes' ? 'acoes-header' : undefined}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedClientes.map((cliente: Cliente) => (
              <tr key={cliente.id}>
                {visibleColumnDefs.map((col) => (
                  <td key={col.key}>{renderCell(cliente, col.key)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedClientes.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum cliente encontrado.
          </div>
        )}

        {filteredClientes.length > 0 && (
          <div className="clientes-pagination">
            <span className="pagination-info">
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredClientes.length)} de{' '}
              {filteredClientes.length} clientes
            </span>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {getPaginationRange().map((page, index) =>
                typeof page === 'string' ? (
                  <span key={`dots-${index}`} className="pagination-btn" style={{ cursor: 'default' }}>
                    {page}
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
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
