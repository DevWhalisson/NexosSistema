import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Ban,
  AlertCircle,
  PackageX,
  PackageCheck,
  X,
  FilterX,
  Info,
  Copy,
} from 'lucide-react';
import type { Produto } from '../../../types';
import { GRUPOS_PRODUTO, MARCAS_PRODUTO, TIPOS_PRODUTO, UNIDADES_MEDIDA } from '../../../data/produtos';
import {
  alterarStatusProduto,
  assinarProdutos,
  duplicarProduto,
  listarProdutos,
  verificarArmazenamentoProdutos,
} from '../../../services/produtoStorage';
import { gerarProximoProdutoId } from '../../../utils/produtoId';
import {
  descricaoOpcao,
  estoqueDisponivel,
  formatarMoeda,
  formatarNumero,
  precoVendaEfetivo,
  produtoComEstoqueCritico,
  produtoComEstoqueExcedente,
} from '../../../utils/produtoForm';
import { obterUsuarioAtual, temPermissaoProduto } from '../../../utils/produtoPermissoes';
import './Produtos.css';

const ITEMS_PER_PAGE = 10;

export const Produtos: React.FC = () => {
  const navigate = useNavigate();
  const usuario = obterUsuarioAtual();
  const podeIncluir = temPermissaoProduto('incluir', usuario);
  const podeEditar = temPermissaoProduto('editar', usuario);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterGrupo, setFilterGrupo] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterMarca, setFilterMarca] = useState<string>('todos');
  const [filterEstoque, setFilterEstoque] = useState<string>('todos');
  const [ordenacao, setOrdenacao] = useState<'descricao' | 'codigo' | 'preco'>('descricao');
  const [currentPage, setCurrentPage] = useState(1);

  const [produtos, setProdutos] = useState<Produto[]>(() => listarProdutos());
  const [estadoArmazenamento, setEstadoArmazenamento] = useState(() =>
    verificarArmazenamentoProdutos()
  );
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const atualizar = () => {
      setProdutos(listarProdutos());
      setEstadoArmazenamento(verificarArmazenamentoProdutos());
    };
    atualizar();
    return assinarProdutos(atualizar);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const avisoArmazenamento = useMemo(() => {
    if (estadoArmazenamento.situacao === 'corrompido') {
      return 'Os registros de produtos salvos neste navegador estão corrompidos e não serão substituídos. Restaure a cópia de segurança ou limpe o armazenamento local do navegador.';
    }
    if (estadoArmazenamento.situacao === 'inconsistente') {
      return `Há ${estadoArmazenamento.invalidos} registro(s) inválido(s) no armazenamento local. Por segurança, as gravações ficam bloqueadas até que o problema seja resolvido.`;
    }
    if (estadoArmazenamento.situacao === 'indisponivel') {
      return 'Não foi possível acessar o armazenamento local do navegador. As alterações feitas nesta tela não serão salvas.';
    }
    return null;
  }, [estadoArmazenamento]);

  const filteredProdutos = useMemo(() => {
    const termo = searchTerm.trim().toLowerCase();
    const lista = produtos.filter((produto) => {
      const grupo = descricaoOpcao(GRUPOS_PRODUTO, produto.grupo).toLowerCase();
      const marca = descricaoOpcao(MARCAS_PRODUTO, produto.marca).toLowerCase();
      const fornecedor = (produto.fornecedorPreferencialNome ?? '').toLowerCase();

      const matchesSearch =
        termo === '' ||
        produto.codigo.toLowerCase().includes(termo) ||
        produto.descricao.toLowerCase().includes(termo) ||
        produto.referencia.toLowerCase().includes(termo) ||
        produto.codigoBarras.includes(termo) ||
        grupo.includes(termo) ||
        marca.includes(termo) ||
        fornecedor.includes(termo);

      const matchesStatus = filterStatus === 'todos' || produto.ativo === (filterStatus === 'Ativo');
      const matchesGrupo = filterGrupo === 'todos' || produto.grupo === filterGrupo;
      const matchesTipo = filterTipo === 'todos' || produto.tipoProduto === filterTipo;
      const matchesMarca = filterMarca === 'todos' || produto.marca === filterMarca;
      const matchesEstoque =
        filterEstoque === 'todos' ||
        (filterEstoque === 'critico' && produtoComEstoqueCritico(produto)) ||
        (filterEstoque === 'zerado' && produto.quantidade === 0) ||
        (filterEstoque === 'disponivel' && estoqueDisponivel(produto) > 0);

      return matchesSearch && matchesStatus && matchesGrupo && matchesTipo && matchesMarca && matchesEstoque;
    });

    return [...lista].sort((a, b) => {
      if (ordenacao === 'codigo') return a.codigo.localeCompare(b.codigo);
      if (ordenacao === 'preco') return precoVendaEfetivo(b) - precoVendaEfetivo(a);
      return a.descricao.localeCompare(b.descricao);
    });
  }, [searchTerm, filterStatus, filterGrupo, filterTipo, filterMarca, filterEstoque, ordenacao, produtos]);

  const totalPages = Math.ceil(filteredProdutos.length / ITEMS_PER_PAGE);
  const paginatedProdutos = filteredProdutos.slice(
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

  const totalAtivos = produtos.filter((produto) => produto.ativo).length;
  const totalInativos = produtos.filter((produto) => !produto.ativo).length;
  const totalEstoqueCritico = produtos.filter(produtoComEstoqueCritico).length;

  const temFiltroAplicado =
    searchTerm.trim() !== '' ||
    filterStatus !== 'todos' ||
    filterGrupo !== 'todos' ||
    filterTipo !== 'todos' ||
    filterMarca !== 'todos' ||
    filterEstoque !== 'todos';

  const handleLimparFiltros = () => {
    setSearchTerm('');
    setFilterStatus('todos');
    setFilterGrupo('todos');
    setFilterTipo('todos');
    setFilterMarca('todos');
    setFilterEstoque('todos');
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

  /**
   * Inativa ou reativa um produto. A operação altera apenas o campo de
   * status: preços, quantidades e dados fiscais são preservados.
   */
  const handleAlternarStatus = (produto: Produto) => {
    if (processandoId !== null) return;
    if (!podeEditar) {
      showToast('Sem permissão para alterar o status do produto.', 'error');
      return;
    }
    const novoStatus = produto.ativo ? 'Inativo' : 'Ativo';
    const acao = novoStatus === 'Inativo' ? 'inativar' : 'reativar';

    let motivo = '';
    if (novoStatus === 'Inativo') {
      motivo = window.prompt('Informe o motivo da inativação:') ?? '';
      if (!motivo.trim()) {
        showToast('É necessário informar o motivo para inativar o produto.', 'error');
        return;
      }
    }

    const confirmacao = window.confirm(
      `Deseja ${acao} o produto "${produto.descricao}"?\n\n` +
        `Código: ${produto.codigo}\n` +
        `Status atual: ${produto.ativo ? 'Ativo' : 'Inativo'}\n\n` +
        (novoStatus === 'Inativo'
          ? 'O produto passará a constar como inativo na consulta. Preços, quantidades e dados fiscais não são alterados.'
          : 'O produto voltará a constar como ativo na consulta.')
    );
    if (!confirmacao) return;

    setProcessandoId(produto.id);
    const resultado = alterarStatusProduto(produto.id, novoStatus === 'Ativo', motivo.trim());
    setProcessandoId(null);

    if (!resultado.success) {
      showToast(resultado.error ?? 'Não foi possível alterar o status do produto.', 'error');
      return;
    }
    showToast(
      `Produto ${novoStatus === 'Ativo' ? 'reativado' : 'inativado'} com sucesso!`,
      'success'
    );
  };

  const handleDuplicar = (produto: Produto) => {
    if (!podeIncluir) {
      showToast('Sem permissão para duplicar/cadastrar produtos.', 'error');
      return;
    }
    const novoId = gerarProximoProdutoId();
    const resultado = duplicarProduto(produto.id, novoId);
    if ('success' in resultado) {
      showToast(resultado.error ?? 'Não foi possível duplicar o produto.', 'error');
      return;
    }
    showToast('Produto duplicado com sucesso!', 'success');
    navigate(`/estoque/produtos/${novoId}?modo=editar`);
  };

  const handleNovoProduto = () => {
    if (!podeIncluir) {
      showToast('Sem permissão para cadastrar produtos.', 'error');
      return;
    }
    let novoId = gerarProximoProdutoId();
    let tentativas = 0;
    while (produtos.some((produto) => produto.id === novoId) && tentativas < 100) {
      novoId = gerarProximoProdutoId();
      tentativas += 1;
    }
    navigate(`/estoque/produtos/${novoId}`);
  };

  const renderCelula = (
    produto: Produto,
    chave:
      | 'codigo'
      | 'produto'
      | 'referencia'
      | 'grupo'
      | 'unidade'
      | 'preco'
      | 'quantidade'
      | 'status'
      | 'acoes'
  ) => {
    switch (chave) {
      case 'codigo':
        return <span className="prt-codigo">{produto.codigo}</span>;
      case 'produto':
        return (
          <div className="prt-produto">
            <div className="prt-produto-nome">{produto.descricao}</div>
            <div className="prt-produto-meta">
              {descricaoOpcao(TIPOS_PRODUTO, produto.tipoProduto)}
              {produto.favorito && <span className="prt-favorito">Favorito</span>}
            </div>
          </div>
        );
      case 'referencia':
        return produto.referencia ? (
          <span className="prt-referencia">{produto.referencia}</span>
        ) : (
          <span className="prt-vazio">—</span>
        );
      case 'grupo':
        return produto.grupo ? (
          <span className="prt-grupo">{descricaoOpcao(GRUPOS_PRODUTO, produto.grupo)}</span>
        ) : (
          <span className="prt-vazio">—</span>
        );
      case 'unidade':
        return (
          <span className="prt-unidade">
            <span className="prt-unidade-codigo">{produto.unidadeMedida}</span>
            <span className="prt-unidade-descricao">
              {descricaoOpcao(UNIDADES_MEDIDA, produto.unidadeMedida)}
            </span>
          </span>
        );
      case 'preco':
        return (
          <div className="prt-preco-col">
            <span className="prt-preco">{formatarMoeda(precoVendaEfetivo(produto))}</span>
            {produto.precoPromocional > 0 && (
              <span className="prt-preco-promo">Promo</span>
            )}
          </div>
        );
      case 'quantidade':
        return (
          <span
            className={
              produtoComEstoqueCritico(produto)
                ? 'prt-quantidade critica'
                : produtoComEstoqueExcedente(produto)
                  ? 'prt-quantidade excedente'
                  : 'prt-quantidade'
            }
          >
            {formatarNumero(produto.quantidade)} ({formatarNumero(estoqueDisponivel(produto))} disp.)
          </span>
        );
      case 'status':
        return (
          <span className={`prt-badge ${produto.ativo ? 'ativo' : 'inativo'}`}>
            {produto.ativo ? 'Ativo' : 'Inativo'}
          </span>
        );
      case 'acoes':
        return (
          <div className="prt-actions">
            <button
              className="prt-action-btn"
              title="Visualizar"
              aria-label={`Visualizar ${produto.descricao}`}
              onClick={() => navigate(`/estoque/produtos/${produto.id}?modo=visualizar`)}
            >
              <Eye size={16} />
            </button>
            {podeEditar && (
              <button
                className="prt-action-btn"
                title="Editar"
                aria-label={`Editar ${produto.descricao}`}
                onClick={() => navigate(`/estoque/produtos/${produto.id}?modo=editar`)}
              >
                <Pencil size={16} />
              </button>
            )}
            {podeIncluir && (
              <button
                className="prt-action-btn"
                title="Duplicar"
                aria-label={`Duplicar ${produto.descricao}`}
                onClick={() => handleDuplicar(produto)}
              >
                <Copy size={16} />
              </button>
            )}
            {podeEditar && (
              <button
                className={`prt-action-btn ${produto.ativo ? 'desativar' : 'ativar'}`}
                title={produto.ativo ? 'Inativar' : 'Reativar'}
                aria-label={
                  produto.ativo
                    ? `Inativar ${produto.descricao}`
                    : `Reativar ${produto.descricao}`
                }
                disabled={processandoId === produto.id}
                onClick={() => handleAlternarStatus(produto)}
              >
                {produto.ativo ? <PackageX size={16} /> : <PackageCheck size={16} />}
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="produtos-page">
      <nav className="prt-breadcrumb">
        <button className="prt-breadcrumb-link" onClick={() => navigate('/estoque')}>
          Estoque
        </button>
        <span className="prt-breadcrumb-separator">&gt;</span>
        <span className="prt-breadcrumb-current">Produtos</span>
      </nav>

      <div className="produtos-header">
        <div className="produtos-header-left">
          <button className="prt-back-btn" onClick={() => navigate('/estoque')} title="Voltar">
            <ArrowLeft size={18} />
          </button>
          <div className="produtos-header-icon">
            <Package size={24} />
          </div>
          <div className="produtos-header-content">
            <h1 className="produtos-page-title">Produtos</h1>
            <p className="produtos-page-subtitle">
              Consulte, cadastre e gerencie os produtos da empresa.
            </p>
          </div>
        </div>
        {podeIncluir && (
          <button className="prt-btn-novo" onClick={handleNovoProduto}>
            <Plus size={18} />
            Novo Produto
          </button>
        )}
      </div>

      <div className="produtos-indicators">
        <div className="prt-indicator-box">
          <div className="prt-indicator-icon blue">
            <Package size={20} />
          </div>
          <div className="prt-indicator-text">
            <span className="prt-indicator-value">{produtos.length}</span>
            <span className="prt-indicator-label">Total de produtos</span>
          </div>
        </div>
        <div className="prt-indicator-box">
          <div className="prt-indicator-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div className="prt-indicator-text">
            <span className="prt-indicator-value">{totalAtivos}</span>
            <span className="prt-indicator-label">Produtos ativos</span>
          </div>
        </div>
        <div className="prt-indicator-box">
          <div className="prt-indicator-icon orange">
            <Ban size={20} />
          </div>
          <div className="prt-indicator-text">
            <span className="prt-indicator-value">{totalInativos}</span>
            <span className="prt-indicator-label">Produtos inativos</span>
          </div>
        </div>
        <div className="prt-indicator-box">
          <div className="prt-indicator-icon red">
            <AlertCircle size={20} />
          </div>
          <div className="prt-indicator-text">
            <span className="prt-indicator-value">{totalEstoqueCritico}</span>
            <span className="prt-indicator-label">Estoque abaixo do mínimo</span>
          </div>
        </div>
      </div>

      {avisoArmazenamento && (
        <div className="prt-storage-warning" role="status">
          <AlertCircle size={16} />
          <span>{avisoArmazenamento}</span>
        </div>
      )}

      <div className="produtos-toolbar">
        <div className="prt-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por código, descrição, referência, código de barras, grupo, marca ou fornecedor..."
            value={searchTerm}
            aria-label="Buscar produtos"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          {searchTerm !== '' && (
            <button
              type="button"
              className="prt-search-clear"
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
        <div className="prt-filter-group">
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="prt-filter-select"
            value={filterStatus}
            aria-label="Filtrar por status"
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="todos">Todos os status</option>
            <option value="Ativo">Ativos</option>
            <option value="Inativo">Inativos</option>
          </select>
          <select
            className="prt-filter-select"
            value={filterGrupo}
            aria-label="Filtrar por categoria/grupo"
            onChange={(e) => {
              setFilterGrupo(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="todos">Todas as categorias</option>
            {GRUPOS_PRODUTO.map((grupo) => (
              <option key={grupo.codigo} value={grupo.codigo}>
                {grupo.descricao}
              </option>
            ))}
          </select>
          <select
            className="prt-filter-select"
            value={filterMarca}
            aria-label="Filtrar por marca"
            onChange={(e) => {
              setFilterMarca(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="todos">Todas as marcas</option>
            {MARCAS_PRODUTO.map((marca) => (
              <option key={marca.codigo} value={marca.codigo}>
                {marca.descricao}
              </option>
            ))}
          </select>
          <select
            className="prt-filter-select"
            value={filterTipo}
            aria-label="Filtrar por tipo de produto"
            onChange={(e) => {
              setFilterTipo(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="todos">Todos os tipos</option>
            {TIPOS_PRODUTO.map((tipo) => (
              <option key={tipo.codigo} value={tipo.codigo}>
                {tipo.descricao}
              </option>
            ))}
          </select>
          <select
            className="prt-filter-select"
            value={filterEstoque}
            aria-label="Filtrar por estoque"
            onChange={(e) => {
              setFilterEstoque(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="todos">Todo o estoque</option>
            <option value="disponivel">Com saldo disponível</option>
            <option value="critico">Abaixo do mínimo</option>
            <option value="zerado">Sem saldo</option>
          </select>
          <select
            className="prt-filter-select"
            value={ordenacao}
            aria-label="Ordenar por"
            onChange={(e) => setOrdenacao(e.target.value as 'descricao' | 'codigo' | 'preco')}
          >
            <option value="descricao">Ordenar por descrição</option>
            <option value="codigo">Ordenar por código</option>
            <option value="preco">Ordenar por preço</option>
          </select>
          <button
            type="button"
            className="prt-btn-limpar"
            onClick={handleLimparFiltros}
            disabled={!temFiltroAplicado}
          >
            <FilterX size={16} />
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="produtos-table-container">
        <table className="produtos-table">
          <thead>
            <tr>
              <th className="prt-th prt-th-codigo">Código</th>
              <th className="prt-th prt-th-produto">Produto / Descrição</th>
              <th className="prt-th prt-th-referencia">Referência</th>
              <th className="prt-th prt-th-grupo">Grupo</th>
              <th className="prt-th prt-th-unidade">Unidade</th>
              <th className="prt-th prt-th-preco">Preço de venda</th>
              <th className="prt-th prt-th-quantidade">Quantidade</th>
              <th className="prt-th prt-th-status">Status</th>
              <th className="prt-th prt-th-acoes">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProdutos.map((produto) => (
              <tr key={produto.id}>
                <td className="prt-td prt-td-codigo">{renderCelula(produto, 'codigo')}</td>
                <td className="prt-td prt-td-produto">{renderCelula(produto, 'produto')}</td>
                <td className="prt-td prt-td-referencia">{renderCelula(produto, 'referencia')}</td>
                <td className="prt-td prt-td-grupo">{renderCelula(produto, 'grupo')}</td>
                <td className="prt-td prt-td-unidade">{renderCelula(produto, 'unidade')}</td>
                <td className="prt-td prt-td-preco">{renderCelula(produto, 'preco')}</td>
                <td className="prt-td prt-td-quantidade">
                  {renderCelula(produto, 'quantidade')}
                </td>
                <td className="prt-td prt-td-status">{renderCelula(produto, 'status')}</td>
                <td className="prt-td prt-td-acoes">{renderCelula(produto, 'acoes')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedProdutos.length === 0 && (
          <div className="prt-empty">
            <FilterX size={30} />
            <p className="prt-empty-title">
              {produtos.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
            </p>
            <p className="prt-empty-hint">
              {produtos.length === 0
                ? 'Cadastre o primeiro produto para começar.'
                : 'Nenhum registro corresponde aos filtros aplicados.'}
            </p>
            {temFiltroAplicado && (
              <button type="button" className="prt-empty-action" onClick={handleLimparFiltros}>
                Limpar filtros
              </button>
            )}
          </div>
        )}

        {filteredProdutos.length > 0 && (
          <div className="produtos-pagination">
            <span className="prt-pagination-info">
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProdutos.length)} de{' '}
              {filteredProdutos.length} produtos
            </span>
            <div className="prt-pagination-controls">
              <button
                className="prt-pagination-btn"
                aria-label="Página anterior"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {getPaginationRange().map((page, index) =>
                typeof page === 'string' ? (
                  <span key={`dots-${index}`} className="prt-pagination-btn dots">
                    {page}
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`prt-pagination-btn ${currentPage === page ? 'active' : ''}`}
                    aria-label={`Página ${page}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="prt-pagination-btn"
                aria-label="Próxima página"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="prt-hint">
        <Info size={15} />
        <span>
          Cadastro de produtos com persistência em localStorage (provisória). Estoque é derivado de movimentações/ajustes, com validações fiscais, preços, permissões e integração preparada para PDV. 
        </span>
      </div>

      {toast && (
        <div className={`prt-toast prt-toast-${toast.type}`} role="status">
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button
            type="button"
            className="prt-toast-close"
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
