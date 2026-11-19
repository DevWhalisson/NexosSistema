import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  UserRound,
  Image as ImageIcon,
  Percent,
  ShieldCheck,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Upload,
  Pencil,
  X,
} from 'lucide-react';
import type {
  TipoUsuario,
  StatusUsuario,
  PermissoesModulo,
  AbaPermissao,
  ModuloPermissao,
  AcaoPermissao,
} from '../../../types';
import { ABAS_PERMISSAO } from '../../../data/permissoes';
import { formatarCodigoUsuario, isUsuarioIdNovo } from '../../../utils/usuarioId';
import {
  LIMITE_NOME,
  abaTotalmenteLiberada,
  comissoesFormularioVazias,
  comissoesParaFormulario,
  contarModulosLiberados,
  criarPermissoesVazias,
  emailJaUtilizado,
  normalizarPermissoesArmazenadas,
  prepareUsuario,
  type ComissoesFormulario,
  type UsuarioFormInput,
} from '../../../utils/usuarioForm';
import {
  atualizarUsuario,
  buscarUsuarioPorId,
  cadastrarUsuario,
  listarUsuarios,
} from '../../../services/usuarioStorage';
import './FichaUsuario.css';

interface UsuarioSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
}

type ModoFicha = 'cadastro' | 'editar' | 'visualizar';

const sections: UsuarioSection[] = [
  {
    id: 'gerais',
    title: 'Dados gerais',
    icon: <UserRound size={18} />,
    iconColor: 'blue',
  },
  {
    id: 'imagem',
    title: 'Imagem',
    icon: <ImageIcon size={18} />,
    iconColor: 'purple',
  },
  {
    id: 'comissoes',
    title: 'Comissões',
    icon: <Percent size={18} />,
    iconColor: 'green',
  },
  {
    id: 'permissoes',
    title: 'Permissões',
    icon: <ShieldCheck size={18} />,
    iconColor: 'orange',
  },
];

const ACOES: { key: AcaoPermissao; label: string }[] = [
  { key: 'visualizar', label: 'Visualizar' },
  { key: 'incluir', label: 'Incluir' },
  { key: 'editar', label: 'Editar' },
  { key: 'excluir', label: 'Excluir' },
];

export const FichaUsuario: React.FC = () => {
  const { usuarioId } = useParams<{ usuarioId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const envioEmAndamento = useRef(false);

  const id = Number(usuarioId);
  const usuarioExistente = useMemo(
    () => (Number.isNaN(id) ? undefined : buscarUsuarioPorId(id)),
    [id]
  );

  // O modo chega por parâmetro de consulta: ?modo=visualizar | ?modo=editar.
  // Ausência do parâmetro mantém o modo de edição (compatibilidade com links antigos).
  const modoSolicitado = (searchParams.get('modo') ?? '').trim().toLowerCase();
  const ehVisualizacao = modoSolicitado === 'visualizar';

  const isNovoRegistro =
    !usuarioExistente && !Number.isNaN(id) && isUsuarioIdNovo(id);

  // Registro ainda não salvo não pode ser visualizado: cai na tela de não encontrado.
  const notFound =
    Number.isNaN(id) || (!usuarioExistente && (!isNovoRegistro || ehVisualizacao));

  const modo: ModoFicha = !usuarioExistente
    ? 'cadastro'
    : ehVisualizacao
      ? 'visualizar'
      : 'editar';

  const somenteLeitura = modo === 'visualizar';
  const isNew = modo === 'cadastro';

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    gerais: true,
    imagem: false,
    comissoes: false,
    permissoes: false,
  });

  const [nome, setNome] = useState(() => usuarioExistente?.nome ?? '');
  const [email, setEmail] = useState(() => usuarioExistente?.email ?? '');
  const [tipo, setTipo] = useState<TipoUsuario>(() => usuarioExistente?.tipo ?? 'Usuario');
  const [status, setStatus] = useState<StatusUsuario>(
    () => usuarioExistente?.status ?? 'Ativo'
  );
  const [imagem, setImagem] = useState<string | undefined>(() => usuarioExistente?.imagem);
  const [imagemAviso, setImagemAviso] = useState(false);
  const imagemPersistida = usuarioExistente?.imagem;
  const [comissoes, setComissoes] = useState<ComissoesFormulario>(() =>
    usuarioExistente ? comissoesParaFormulario(usuarioExistente.comissoes) : comissoesFormularioVazias()
  );
  const [permissaoTotal, setPermissaoTotal] = useState(
    () => usuarioExistente?.permissaoTotal ?? false
  );
  const [permissoes, setPermissoes] = useState<PermissoesModulo>(
    () =>
      normalizarPermissoesArmazenadas(usuarioExistente?.permissoes) ?? criarPermissoesVazias()
  );
  const [abasAbertas, setAbasAbertas] = useState<Record<string, boolean>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const codigo = useMemo(
    () => usuarioExistente?.codigo ?? formatarCodigoUsuario(Number.isNaN(id) ? 0 : id),
    [usuarioExistente, id]
  );

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const formInput = useMemo<UsuarioFormInput>(
    () => ({
      id: Number.isNaN(id) ? 0 : id,
      codigo,
      nome,
      email,
      tipo,
      status,
      imagem,
      comissoes,
      permissaoTotal,
      permissoes,
    }),
    [id, codigo, nome, email, tipo, status, imagem, comissoes, permissaoTotal, permissoes]
  );

  const prepared = useMemo(() => prepareUsuario(formInput), [formInput]);

  const errors = useMemo(() => {
    const base = prepared.errors;
    if (!base.email && email.trim()) {
      const existentes = listarUsuarios();
      if (emailJaUtilizado(email, existentes, isNew ? undefined : id)) {
        return { ...base, email: 'Já existe um usuário com este e-mail.' };
      }
    }
    return base;
  }, [prepared.errors, email, id, isNew]);
  const valid = Object.keys(errors).length === 0;

  const showFieldError = (field: string) =>
    !somenteLeitura && Boolean((touched[field] || submitted) && errors[field]);
  const inputClass = (field: string) =>
    `fu-input ${showFieldError(field) ? 'has-error' : ''}`;
  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  /**
   * Navegação por teclado entre os cabeçalhos das seções (padrão de acordeão):
   * setas movem o foco, Home/End vão para a primeira e a última seção.
   */
  const handleSectionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    seletor: string
  ) => {
    const total = sections.length;
    let destino = -1;
    if (event.key === 'ArrowDown') destino = (index + 1) % total;
    else if (event.key === 'ArrowUp') destino = (index - 1 + total) % total;
    else if (event.key === 'Home') destino = 0;
    else if (event.key === 'End') destino = total - 1;
    if (destino < 0) return;
    event.preventDefault();
    const botoes = document.querySelectorAll<HTMLButtonElement>(seletor);
    botoes[destino]?.focus();
  };

  const handleAbaKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const total = ABAS_PERMISSAO.length;
    let destino = -1;
    if (event.key === 'ArrowDown') destino = (index + 1) % total;
    else if (event.key === 'ArrowUp') destino = (index - 1 + total) % total;
    else if (event.key === 'Home') destino = 0;
    else if (event.key === 'End') destino = total - 1;
    if (destino < 0) return;
    event.preventDefault();
    const botoes = document.querySelectorAll<HTMLButtonElement>(
      '.fu-permissao-aba-toggle'
    );
    botoes[destino]?.focus();
  };

  const handlePermissaoTotal = (checked: boolean) => {
    if (somenteLeitura) return;
    setPermissaoTotal(checked);
    setDirty(true);
  };

  const toggleAba = (aba: AbaPermissao) => {
    setAbasAbertas((prev) => ({ ...prev, [aba]: !prev[aba] }));
  };

  const togglePermissao = (
    aba: AbaPermissao,
    modulo: ModuloPermissao,
    acao: AcaoPermissao
  ) => {
    if (somenteLeitura || permissaoTotal) return;
    setPermissoes((prev) => {
      const acoesAtuais = {
        ...(prev[aba]?.[modulo] ?? {
          visualizar: false,
          incluir: false,
          editar: false,
          excluir: false,
        }),
      };
      const novoValor = !acoesAtuais[acao];
      if (acao === 'visualizar') {
        // Sem visualizar não há como operar o módulo: as demais ações são removidas.
        acoesAtuais.visualizar = novoValor;
        if (!novoValor) {
          acoesAtuais.incluir = false;
          acoesAtuais.editar = false;
          acoesAtuais.excluir = false;
        }
      } else {
        acoesAtuais[acao] = novoValor;
        if (novoValor) acoesAtuais.visualizar = true;
      }
      return {
        ...prev,
        [aba]: { ...prev[aba], [modulo]: acoesAtuais },
      };
    });
    setDirty(true);
  };

  const toggleAbaTotal = (aba: AbaPermissao, liberar: boolean) => {
    if (somenteLeitura || permissaoTotal) return;
    const catalogo = ABAS_PERMISSAO.find((item) => item.key === aba);
    if (!catalogo) return;
    setPermissoes((prev) => {
      const modulos = { ...(prev[aba] ?? {}) };
      catalogo.modulos.forEach((modulo) => {
        modulos[modulo.key] = {
          visualizar: liberar,
          incluir: liberar,
          editar: liberar,
          excluir: liberar,
        };
      });
      return { ...prev, [aba]: modulos };
    });
    setDirty(true);
  };

  const updateComissao = (campo: keyof ComissoesFormulario, valor: string) => {
    if (somenteLeitura) return;
    setComissoes((prev) => ({ ...prev, [campo]: valor }));
    setDirty(true);
  };

  const handleSelecionarImagem = () => {
    if (somenteLeitura) return;
    fileInputRef.current?.click();
  };

  const handleImagemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (somenteLeitura) return;
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagem(typeof reader.result === 'string' ? reader.result : undefined);
      setImagemAviso(true);
    };
    reader.readAsDataURL(file);
  };

  const handleVoltar = () => {
    navigate('/cadastros/usuarios');
  };

  const handleIrParaEdicao = () => {
    navigate(`/cadastros/usuarios/${id}?modo=editar`);
  };

  const handleCancelar = () => {
    if (dirty && !window.confirm('Há alterações não salvas. Deseja descartá-las?')) return;
    navigate('/cadastros/usuarios');
  };

  const handleSalvar = () => {
    if (somenteLeitura) return;
    if (saving || envioEmAndamento.current) return;

    setSubmitted(true);
    if (!valid) {
      showToast('Corrija os erros antes de salvar.', 'error');
      return;
    }

    if (isNew && !isUsuarioIdNovo(id)) {
      showToast(
        'Identificador inválido para cadastro. Use o botão "Novo Usuário" da consulta para iniciar um novo cadastro.',
        'error'
      );
      return;
    }

    envioEmAndamento.current = true;
    setSaving(true);
    const resultado = isNew
      ? cadastrarUsuario(prepared.data)
      : atualizarUsuario(prepared.data);

    if (!resultado.success) {
      envioEmAndamento.current = false;
      setSaving(false);
      showToast(resultado.error ?? 'Não foi possível salvar o usuário.', 'error');
      return;
    }

    setDirty(false);
    showToast('Usuário salvo com sucesso!', 'success');
    setTimeout(() => {
      navigate('/cadastros/usuarios');
    }, 1200);
  };

  if (notFound) {
    return (
      <div className="ficha-usuario-page">
        <nav className="fu-breadcrumb">
          <button className="fu-breadcrumb-link" onClick={() => navigate('/cadastros')}>
            Cadastros
          </button>
          <span className="fu-breadcrumb-separator">&gt;</span>
          <button
            className="fu-breadcrumb-link"
            onClick={() => navigate('/cadastros/usuarios')}
          >
            Usuários
          </button>
          <span className="fu-breadcrumb-separator">&gt;</span>
          <span className="fu-breadcrumb-current">
            {ehVisualizacao ? 'Visualização' : 'Cadastro'}
          </span>
        </nav>
        <div className="fu-notfound">
          <AlertCircle size={40} />
          <h2>Usuário não encontrado</h2>
          <p>
            {ehVisualizacao && isNovoRegistro
              ? 'Este cadastro ainda não foi salvo, portanto não pode ser visualizado.'
              : 'O usuário solicitado não existe ou foi removido.'}
          </p>
          <button className="fu-btn-secondary" onClick={handleVoltar}>
            <ArrowLeft size={16} />
            Voltar para usuários
          </button>
        </div>
      </div>
    );
  }

  const renderDadosGerais = () => (
    <div className="fu-form-row fu-form-row--dados-gerais">
      <div className="fu-field fu-field-nome">
        <label className="fu-label">
          Nome <span className="fu-required">*</span>
        </label>
        <input
          className={inputClass('nome')}
          type="text"
          placeholder="Nome completo do usuário"
          maxLength={LIMITE_NOME}
          value={nome}
          disabled={somenteLeitura}
          onChange={(e) => {
            if (somenteLeitura) return;
            setNome(e.target.value);
            setDirty(true);
          }}
          onBlur={() => markTouched('nome')}
        />
        {showFieldError('nome') && (
          <span className="fu-field-error">{errors.nome}</span>
        )}
      </div>
      <div className="fu-field fu-field-email">
        <label className="fu-label">
          E-mail <span className="fu-required">*</span>
        </label>
        <input
          className={inputClass('email')}
          type="email"
          placeholder="usuario@empresa.com.br"
          value={email}
          disabled={somenteLeitura}
          onChange={(e) => {
            if (somenteLeitura) return;
            setEmail(e.target.value);
            setDirty(true);
          }}
          onBlur={() => markTouched('email')}
        />
        {showFieldError('email') && (
          <span className="fu-field-error">{errors.email}</span>
        )}
      </div>
      <div className="fu-field">
        <label className="fu-label">Tipo</label>
        <select
          className={`fu-select ${showFieldError('tipo') ? 'has-error' : ''}`}
          value={tipo}
          disabled={somenteLeitura}
          onChange={(e) => {
            if (somenteLeitura) return;
            setTipo(e.target.value as TipoUsuario);
            setDirty(true);
          }}
          onBlur={() => markTouched('tipo')}
        >
          <option value="Usuario">Usuário</option>
          <option value="Administrador">Administrador</option>
        </select>
        {showFieldError('tipo') && (
          <span className="fu-field-error">{errors.tipo}</span>
        )}
      </div>
      <div className="fu-field">
        <label className="fu-label">Status</label>
        <select
          className={`fu-select ${showFieldError('status') ? 'has-error' : ''}`}
          value={status}
          disabled={somenteLeitura}
          onChange={(e) => {
            if (somenteLeitura) return;
            setStatus(e.target.value as StatusUsuario);
            setDirty(true);
          }}
          onBlur={() => markTouched('status')}
        >
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>
        {showFieldError('status') && (
          <span className="fu-field-error">{errors.status}</span>
        )}
      </div>
    </div>
  );

  const renderImagem = () => (
    <div className="fu-image-block">
      <div className="fu-image-preview">
        {imagem ? (
          <img src={imagem} alt="Pré-visualização do usuário" />
        ) : (
          <span className="fu-image-placeholder">Avatar</span>
        )}
      </div>
      <div className="fu-image-actions">
        {somenteLeitura ? (
          <p className="fu-field-hint">
            A seleção de novas imagens não está disponível no modo de visualização.
          </p>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="fu-image-input"
              onChange={handleImagemChange}
            />
            <button className="fu-btn-secondary" onClick={handleSelecionarImagem}>
              <Upload size={16} />
              Selecionar imagem
            </button>
            <p className="fu-field-hint">
              Formatos aceitos: JPG, PNG e WebP.
            </p>
            <p className="fu-image-warning">
              A imagem selecionada é apenas uma pré-visualização local: o arquivo, o
              conteúdo em base64 e a URL temporária não serão gravados. Se o usuário já
              possuir uma imagem registrada, ela será preservada.
            </p>
            {imagemAviso && (
              <>
                <span className="fu-image-badge">Pré-visualização local — não será salva</span>
                {imagemPersistida && (
                  <p className="fu-field-hint">
                    A imagem já registrada deste usuário será mantida ao salvar.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderComissoes = () => {
    const campos: {
      chave: keyof ComissoesFormulario;
      label: string;
      erro: string;
    }[] = [
      { chave: 'vendasAVista', label: 'Vendas à vista', erro: 'comissaoVendasAVista' },
      { chave: 'vendasAPrazo', label: 'Vendas a prazo', erro: 'comissaoVendasAPrazo' },
      { chave: 'vendasCartao', label: 'Vendas no cartão', erro: 'comissaoVendasCartao' },
      { chave: 'servicos', label: '% Comissão para serviços', erro: 'comissaoServicos' },
    ];

    return (
      <div className="fu-form-row cols-4">
        {campos.map(({ chave, label, erro }) => (
          <div className="fu-field" key={chave}>
            <label className="fu-label">{label}</label>
            <div className="fu-percent-input">
              <input
                className={inputClass(erro)}
                type="text"
                inputMode="decimal"
                value={comissoes[chave]}
                disabled={somenteLeitura}
                onChange={(e) => updateComissao(chave, e.target.value)}
                onBlur={() => markTouched(erro)}
              />
              <span className="fu-percent-suffix">%</span>
            </div>
            {showFieldError(erro) && (
              <span className="fu-field-error">{errors[erro]}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPermissoes = () => (
    <div className="fu-permissoes">
      <p className="fu-permissoes-dica">
        Libere o acesso às abas do sistema e, dentro de cada aba, escolha quais
        módulos o usuário poderá utilizar e com quais permissões.
      </p>
      {ABAS_PERMISSAO.map((aba, index) => {
        const expandida = Boolean(abasAbertas[aba.key]);
        const liberados = contarModulosLiberados(permissoes, aba.key);
        const abaLiberada = abaTotalmenteLiberada(permissoes, aba.key);
        return (
          <div className="fu-permissao-aba" key={aba.key}>
            <div className="fu-permissao-aba-header">
              <button
                type="button"
                className="fu-permissao-aba-toggle"
                aria-expanded={expandida}
                aria-controls={`fu-permissao-aba-${aba.key}`}
                onClick={() => toggleAba(aba.key)}
                onKeyDown={(e) => handleAbaKeyDown(e, index)}
              >
                <ChevronDown
                  size={16}
                  className={`fu-permissao-aba-chevron ${expandida ? 'open' : ''}`}
                />
                <span className="fu-permissao-aba-nome">{aba.label}</span>
                <span className="fu-permissao-aba-contador">
                  {liberados} de {aba.modulos.length} módulos liberados
                </span>
              </button>
              <label
                className={`fu-permissao-aba-total ${somenteLeitura ? 'fu-readonly' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={permissaoTotal || abaLiberada}
                  disabled={somenteLeitura || permissaoTotal}
                  onChange={(e) => toggleAbaTotal(aba.key, e.target.checked)}
                />
                <span>Liberar aba</span>
              </label>
            </div>
            {expandida && (
              <div
                className="fu-permissoes-table-wrapper"
                id={`fu-permissao-aba-${aba.key}`}
                role="region"
                aria-label={`Módulos da aba ${aba.label}`}
              >
                <table className="fu-permissoes-table">
                  <thead>
                    <tr>
                      <th>Módulo</th>
                      {ACOES.map((acao) => (
                        <th key={acao.key}>{acao.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {aba.modulos.map((modulo) => (
                      <tr key={modulo.key}>
                        <td className="fu-permissoes-modulo">
                          <span className="fu-permissoes-modulo-nome">{modulo.label}</span>
                          <span className="fu-permissoes-modulo-path">{modulo.path}</span>
                        </td>
                        {ACOES.map((acao) => (
                          <td key={acao.key} className="fu-permissoes-cell">
                            <label className="fu-check">
                              <input
                                type="checkbox"
                                checked={
                                  permissaoTotal ||
                                  Boolean(permissoes[aba.key]?.[modulo.key]?.[acao.key])
                                }
                                disabled={somenteLeitura || permissaoTotal}
                                onChange={() =>
                                  togglePermissao(aba.key, modulo.key, acao.key)
                                }
                              />
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderSectionContent = (sectionId: string) => {
    if (sectionId === 'gerais') return renderDadosGerais();
    if (sectionId === 'imagem') return renderImagem();
    if (sectionId === 'comissoes') return renderComissoes();
    if (sectionId === 'permissoes') return renderPermissoes();
    return null;
  };

  return (
    <div className="ficha-usuario-page">
      <nav className="fu-breadcrumb">
        <button className="fu-breadcrumb-link" onClick={() => navigate('/cadastros')}>
          Cadastros
        </button>
        <span className="fu-breadcrumb-separator">&gt;</span>
        <button className="fu-breadcrumb-link" onClick={() => navigate('/cadastros/usuarios')}>
          Usuários
        </button>
        <span className="fu-breadcrumb-separator">&gt;</span>
        <span className="fu-breadcrumb-current">
          {modo === 'visualizar' ? 'Visualização' : modo === 'editar' ? 'Edição' : 'Cadastro'}
        </span>
      </nav>

      <div className="fu-header">
        <div className="fu-header-left">
          <h1 className="fu-page-title">
            {modo === 'visualizar'
              ? 'Visualizar Usuário'
              : modo === 'editar'
                ? 'Editar Usuário'
                : 'Cadastro de Usuário'}
          </h1>
          <p className="fu-page-subtitle">
            {modo === 'visualizar'
              ? `Dados cadastrados de ${usuarioExistente?.nome ?? 'usuário'}.`
              : modo === 'editar'
                ? `Alterando os dados de ${usuarioExistente?.nome ?? 'usuário'}.`
                : 'Preencha os dados para cadastrar um novo usuário.'}
          </p>
        </div>
        <div className="fu-header-actions">
          {somenteLeitura ? (
            <>
              <button className="fu-btn-secondary" onClick={handleVoltar}>
                <ArrowLeft size={16} />
                Voltar
              </button>
              <button className="fu-btn-primary" onClick={handleIrParaEdicao}>
                <Pencil size={16} />
                Editar usuário
              </button>
            </>
          ) : (
            <>
              <button className="fu-btn-secondary" onClick={handleCancelar}>
                Cancelar
              </button>
              <button
                className="fu-btn-primary"
                onClick={handleSalvar}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="fu-control-data">
        <span>Código: {codigo}</span>
        <span className="fu-control-separator">|</span>
        <span>Status: {status}</span>
        <span className="fu-control-separator">|</span>
        <span>Tipo: {tipo}</span>
        {somenteLeitura && (
          <>
            <span className="fu-control-separator">|</span>
            <span className="fu-readonly-badge">Somente leitura</span>
          </>
        )}
      </div>

      <div className="fu-sections">
        {sections.map((section, index) => {
          const isOpen = openSections[section.id];
          const isPermissoes = section.id === 'permissoes';
          return (
            <div className="fu-section" key={section.id}>
              <div className="fu-section-header">
                <button
                  type="button"
                  className="fu-section-toggle"
                  aria-expanded={isOpen}
                  aria-controls={`fu-section-${section.id}`}
                  onClick={() => toggleSection(section.id)}
                  onKeyDown={(e) => handleSectionKeyDown(e, index, '.fu-section-toggle')}
                >
                  <div className="fu-section-header-left">
                    <div className={`fu-section-icon ${section.iconColor}`}>{section.icon}</div>
                    <h3 className="fu-section-title" id={`fu-section-title-${section.id}`}>
                      {section.title}
                    </h3>
                  </div>
                </button>
                <div className="fu-section-header-right">
                  {isPermissoes && (
                    <label
                      className={`fu-permissao-total ${somenteLeitura ? 'fu-readonly' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={permissaoTotal}
                        disabled={somenteLeitura}
                        onChange={(e) => handlePermissaoTotal(e.target.checked)}
                      />
                      <span className="fu-permissao-total-label">Permissão total</span>
                    </label>
                  )}
                  <button
                    type="button"
                    className="fu-section-chevron-btn"
                    aria-expanded={isOpen}
                    aria-controls={`fu-section-${section.id}`}
                    aria-label={isOpen ? `Recolher ${section.title}` : `Expandir ${section.title}`}
                    onClick={() => toggleSection(section.id)}
                  >
                    <ChevronDown
                      size={18}
                      className={`fu-section-chevron ${isOpen ? 'open' : ''}`}
                    />
                  </button>
                </div>
              </div>
              {isOpen && (
                <div
                  className="fu-section-body"
                  id={`fu-section-${section.id}`}
                  role="region"
                  aria-labelledby={`fu-section-title-${section.id}`}
                >
                  {renderSectionContent(section.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toast && (
        <div className={`fu-toast fu-toast-${toast.type}`} role="status">
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
          <button
            type="button"
            className="fu-toast-close"
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
