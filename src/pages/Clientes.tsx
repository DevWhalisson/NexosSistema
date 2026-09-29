import React, { useState, useMemo } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { clientesData } from '../data/clientes';
import type { Cliente } from '../data/clientes';
import { gerarProximoClienteId } from '../utils/clienteId';
import './Clientes.css';

const ITEMS_PER_PAGE = 10;

export const Clientes: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <div className="clientes-header-left">
          <button className="back-btn" onClick={() => navigate('/pessoas')} title="Voltar">
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
          navigate(`/pessoas/clientes/${novoId}`);
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
            <option value="todos">Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      <div className="clientes-table-container">
        <table className="clientes-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>CPF/CNPJ</th>
              <th>Telefone</th>
              <th>Cidade/UF</th>
              <th>Status</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClientes.map((cliente: Cliente) => (
              <tr key={cliente.id}>
                <td>
                  <div className="client-name">
                    <div className="client-avatar">
                      {getInitials(cliente.nome)}
                    </div>
                    <div className="client-info">
                      <span className="client-info-name">{cliente.nome}</span>
                      <span className="client-info-email">{cliente.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${cliente.tipo.toLowerCase()}`}>
                    {cliente.tipo}
                  </span>
                </td>
                <td>{cliente.cpfCnpj}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.cidade}/{cliente.uf}</td>
                <td>
                  <span className={`badge ${cliente.status.toLowerCase()}`}>
                    {cliente.status}
                  </span>
                </td>
                <td>{cliente.dataCadastro}</td>
                <td>
                  <div className="actions-cell">
                    <button className="action-btn" title="Visualizar" onClick={() => navigate(`/pessoas/clientes/${cliente.id}`)}>
                      <Eye size={16} />
                    </button>
                    <button className="action-btn" title="Editar" onClick={() => navigate(`/pessoas/clientes/${cliente.id}`)}>
                      <Pencil size={16} />
                    </button>
                    <button className="action-btn delete" title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
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
