import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Ban,
  ShieldCheck,
  UserCog,
  AlertCircle,
  UserX,
  UserCheck,
  X,
  FilterX,
} from 'lucide-react';
import type { Usuario } from '../../../types';
import { gerarProximoUsuarioId } from '../../../utils/usuarioId';
import {
  assinarUsuarios,
  atualizarUsuario,
  listarUsuarios,
  verificarArmazenamentoUsuarios,
} from '../../../services/usuarioStorage';
import './Usuarios.css';

const ITEMS_PER_PAGE = 10;

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

export const Usuarios: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [currentPage, setCurrentPage] = useState(1);

  const [usuarios, setUsuarios] = useState<Usuario[]>(() => listarUsuarios());
  const [estadoArmazenamento, setEstadoArmazenamento] = useState(() =>
    verificarArmazenamentoUsuarios()
  );
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const atualizar = () => {
      setUsuarios(listarUsuarios());
      setEstadoArmazenamento(verificarArmazenamentoUsuarios());
    };
    atualizar();
    return assinarUsuarios(atualizar);
  }, []);

  const avisoArmazenamento = useMemo(() => {
    if (estadoArmazenamento.situacao === 'corrompido') {
      return 'Os registros de usuários salvos neste navegador estão corrompidos e não serão substituídos. Restaure a cópia de segurança ou limpe o armazenamento local do navegador.';
    }
    if (estadoArmazenamento.situacao === 'inconsistente') {
      return `Há ${estadoArmazenamento.invalidos} registro(s) inválidos no armazenamento local. Por segurança, as gravações ficam bloqueadas até que o problema seja resolvido.`;
    }
    if (estadoArmazenamento.situacao === 'indisponivel') {
      return 'Não foi possível acessar o armazenamento local do navegador. As alterações feitas nesta tela não serão salvas.';
    }
    return null;
  }, [estadoArmazenamento]);

  const filteredUsuarios = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return usuarios.filter((usuario) => {
      const matchesSearch =
        usuario.nome.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term) ||
        usuario.codigo.toLowerCase().includes(term) ||
        usuario.tipo.toLowerCase().includes(term);

      const matchesTipo = filterTipo === 'todos' || usuario.tipo === filterTipo;
      const matchesStatus = filterStatus === 'todos' || usuario.status === filterStatus;

      return matchesSearch && matchesTipo && matchesStatus;
    });
  }, [searchTerm, filterTipo, filterStatus, usuarios]);

  const totalPages = Math.ceil(filteredUsuarios.length / ITEMS_PER_PAGE);
  const paginatedUsuarios = filteredUsuarios.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Ajusta a página atual quando a filtragem reduz o total de páginas.
  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) setCurrentPage(1);
      return;
    }
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const totalAtivos = usuarios.filter((u) => u.status === 'Ativo').length;
  const totalInativos = usuarios.filter((u) => u.status === 'Inativo').length;
  const totalAdministradores = usuarios.filter((u) => u.tipo === 'Administrador').length;

  const temFiltroAplicado =
    searchTerm.trim() !== '' || filterTipo !== 'todos' || filterStatus !== 'todos';

  const handleLimparFiltros = () => {
    setSearchTerm('');
    setFilterTipo('todos');
    setFilterStatus('todos');
    setCurrentPage(1);
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

  const renderCell = (usuario: Usuario, key: 'codigo' | 'usuario' | 'email' | 'tipo' | 'status' | 'acoes') => {
    switch (key) {
      case 'codigo':
        return <span className="usr-codigo">{usuario.codigo}</span>;
      case 'usuario':
        return (
          <div className="usr-name">
            <div className="usr-avatar">
              {usuario.imagem ? (
                <img src={usuario.imagem} alt={usuario.nome} />
              ) : (
                getInitials(usuario.nome)
              )}
            </div>
            <span className="usr-info-name">{usuario.nome}</span>
          </div>
        );
      case 'email':
        return usuario.email;
      case 'tipo':
        return (
          <span className={`usr-tipo-badge ${usuario.tipo.toLowerCase()}`}>{usuario.tipo}</span>
        );
      case 'status':
        return (
          <span className={`usr-badge ${usuario.status.toLowerCase()}`}>{usuario.status}</span>
        );
      case 'acoes':
        return (
          <div className="usr-actions">
            <button
              className="usr-action-btn"
              title="Visualizar"
              aria-label={`Visualizar ${usuario.nome}`}
              onClick={() => navigate(`/cadastros/usuarios/${usuario.id}?modo=visualizar`)}
            >
              <Eye size={16} />
            </button>
            <button
              className="usr-action-btn"
              title="Editar"
              aria-label={`Editar ${usuario.nome}`}
              onClick={() => navigate(`/cadastros/usuarios/${usuario.id}?modo=editar`)}
            >
              <Pencil size={16} />
            </button>
            <button
              className={`usr-action-btn ${usuario.status === 'Ativo' ? 'desativar' : 'ativar'}`}
              title={usuario.status === 'Ativo' ? 'Inativar' : 'Reativar'}
              aria-label={
                usuario.status === 'Ativo'
                  ? `Inativar ${usuario.nome}`
                  : `Reativar ${usuario.nome}`
              }
              disabled={processandoId === usuario.id}
              onClick={() => handleAlternarStatus(usuario)}
            >
              {usuario.status === 'Ativo' ? (
                <UserX size={16} />
              ) : (
                <UserCheck size={16} />
              )}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  /**
   * Inativa ou reativa um usuário preservando integralmente os demais dados
   * (id, código, nome, e-mail, tipo, comissões, permissões e imagem).
   */
  const handleAlternarStatus = (usuario: Usuario) => {
    if (processandoId !== null) return;
    const novoStatus = usuario.status === 'Ativo' ? 'Inativo' : 'Ativo';
    const acao = novoStatus === 'Inativo' ? 'inativar' : 'reativar';

    const confirmacao = window.confirm(
      `Deseja ${acao} o usuário "${usuario.nome}"?\n\n` +
        `Código: ${usuario.codigo}\n` +
        `Status atual: ${usuario.status}\n\n` +
        (novoStatus === 'Inativo'
          ? 'O usuário passará a constar como inativo na consulta.'
          : 'O usuário voltará a constar como ativo na consulta.')
    );
    if (!confirmacao) return;

    setProcessandoId(usuario.id);
    const resultado = atualizarUsuario({
      id: usuario.id,
      codigo: usuario.codigo,
      nome: usuario.nome,
      email: usuario.email,
      emailComparacao: usuario.email.trim().toLowerCase(),
      tipo: usuario.tipo,
      status: novoStatus,
      ...(usuario.imagem ? { imagem: usuario.imagem } : {}),
      comissoes: usuario.comissoes,
      permissaoTotal: usuario.permissaoTotal,
      permissoes: usuario.permissoes,
    });
    setProcessandoId(null);

    if (!resultado.success) {
      showToast(resultado.error ?? 'Não foi possível alterar o status do usuário.', 'error');
      return;
    }
    showToast(
      `Usuário ${novoStatus === 'Ativo' ? 'reativado' : 'inativado'} com sucesso!`,
      'success'
    );
  };

  const handleNovoUsuario = () => {
    let novoId = gerarProximoUsuarioId();
    let tentativas = 0;
    while (usuarios.some((u) => u.id === novoId) && tentativas < 100) {
      novoId = gerarProximoUsuarioId();
      tentativas += 1;
    }
    navigate(`/cadastros/usuarios/${novoId}`);
  };

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <div className="usuarios-header-left">
          <button className="usr-back-btn" onClick={() => navigate('/cadastros')} title="Voltar">
            <ArrowLeft size={18} />
          </button>
          <div className="usuarios-header-icon">
            <Users size={24} />
          </div>
          <div className="usuarios-header-content">
            <h1 className="usuarios-page-title">Usuários</h1>
            <p className="usuarios-page-subtitle">
              Gerencie os usuários e seus acessos ao sistema.
            </p>
          </div>
        </div>
        <button className="usr-btn-novo" onClick={handleNovoUsuario}>
          <Plus size={18} />
          Novo Usuário
        </button>
      </div>

      <div className="usuarios-indicators">
        <div className="usr-indicator-box">
          <div className="usr-indicator-icon blue">
            <Users size={20} />
          </div>
          <div className="usr-indicator-text">
            <span className="usr-indicator-value">{usuarios.length}</span>
            <span className="usr-indicator-label">Total de Usuários</span>
          </div>
        </div>
        <div className="usr-indicator-box">
          <div className="usr-indicator-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div className="usr-indicator-text">
            <span className="usr-indicator-value">{totalAtivos}</span>
            <span className="usr-indicator-label">Ativos</span>
          </div>
        </div>
        <div className="usr-indicator-box">
          <div className="usr-indicator-icon orange">
            <Ban size={20} />
          </div>
          <div className="usr-indicator-text">
            <span className="usr-indicator-value">{totalInativos}</span>
            <span className="usr-indicator-label">Inativos</span>
          </div>
        </div>
        <div className="usr-indicator-box">
          <div className="usr-indicator-icon purple">
            <ShieldCheck size={20} />
          </div>
          <div className="usr-indicator-text">
            <span className="usr-indicator-value">{totalAdministradores}</span>
            <span className="usr-indicator-label">Administradores</span>
          </div>
        </div>
      </div>

      {avisoArmazenamento && (
        <div className="usr-storage-warning" role="status">
          <AlertCircle size={16} />
          <span>{avisoArmazenamento}</span>
        </div>
      )}

      <div className="usuarios-toolbar">
        <div className="usr-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por código, nome, e-mail ou tipo de usuário..."
            value={searchTerm}
            aria-label="Buscar usuários"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm !== '' && (
            <button
              type="button"
              className="usr-search-clear"
              title="Limpar busca"
              aria-label="Limpar busca"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="usr-filter-group">
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="usr-filter-select"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="todos">Todos</option>
            <option value="Ativo">Ativos</option>
            <option value="Inativo">Inativos</option>
          </select>
          <select
            className="usr-filter-select"
            value={filterTipo}
            onChange={(e) => {
              setFilterTipo(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="todos">Todos</option>
            <option value="Administrador">Administrador</option>
            <option value="Usuario">Usuário</option>
          </select>
        </div>
      </div>

      <div className="usuarios-table-container">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th className="usr-th usr-th-codigo">Código</th>
              <th className="usr-th usr-th-usuario">Usuário</th>
              <th className="usr-th usr-th-email">E-mail</th>
              <th className="usr-th usr-th-tipo">Tipo</th>
              <th className="usr-th usr-th-status">Status</th>
              <th className="usr-th usr-th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="usr-td usr-td-codigo">{renderCell(usuario, 'codigo')}</td>
                <td className="usr-td usr-td-usuario">{renderCell(usuario, 'usuario')}</td>
                <td className="usr-td usr-td-email">{renderCell(usuario, 'email')}</td>
                <td className="usr-td usr-td-tipo">{renderCell(usuario, 'tipo')}</td>
                <td className="usr-td usr-td-status">{renderCell(usuario, 'status')}</td>
                <td className="usr-td usr-td-acoes">{renderCell(usuario, 'acoes')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedUsuarios.length === 0 && (
          <div className="usr-empty">
            <FilterX size={30} />
            <p className="usr-empty-title">
              {usuarios.length === 0 ? 'Nenhum usuário cadastrado' : 'Nenhum usuário encontrado'}
            </p>
            <p className="usr-empty-hint">
              {usuarios.length === 0
                ? 'Cadastre o primeiro usuário para começar.'
                : 'Nenhum registro corresponde aos filtros aplicados.'}
            </p>
            {temFiltroAplicado && (
              <button type="button" className="usr-empty-action" onClick={handleLimparFiltros}>
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {filteredUsuarios.length > 0 && (
          <div className="usuarios-pagination">
            <span className="usr-pagination-info">
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsuarios.length)} de{' '}
              {filteredUsuarios.length} usuários
            </span>
            <div className="usr-pagination-controls">
              <button
                className="usr-pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {getPaginationRange().map((page, index) =>
                typeof page === 'string' ? (
                  <span key={`dots-${index}`} className="usr-pagination-btn dots">
                    {page}
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`usr-pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="usr-pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="usr-hint">
        <UserCog size={15} />
        <span>
          Consulta de demonstração com dados fictícios. As alterações são salvas apenas
          no navegador (localStorage) como persistência provisória; backend e banco de
          dados chegarão em uma etapa futura. Nenhuma autenticação ou controle de
          acesso real é aplicado.
        </span>
      </div>

      {toast && (
        <div className={`usr-toast usr-toast-${toast.type}`} role="status">
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button
            type="button"
            className="usr-toast-close"
            aria-label="Fechar aviso"
            onClick={() => setToast(null)}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
