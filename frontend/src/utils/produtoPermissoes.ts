import type { AcaoPermissao, Usuario } from '../types';
import { listarUsuarios } from '../services/usuarioStorage';

/**
 * Permissões do Módulo de Produtos.
 *
 * O projeto ainda não possui login/sessão real. Para não inventar uma
 * autenticação paralela, o usuário atual é resolvido da seguinte forma:
 * 1. `erp-usuario-atual` (ID) no localStorage, quando existir;
 * 2. o primeiro administrador ativo do cadastro de usuários;
 * 3. nenhum usuário (acesso liberado como demonstração).
 *
 * As ações sensíveis (preços/custos/fiscais) exigem administrador, pois o
 * modelo atual de permissões só possui visualizar/incluir/editar/excluir.
 */

const USUARIO_ATUAL_KEY = 'erp-usuario-atual';

export const obterUsuarioAtual = (): Usuario | undefined => {
  const usuarios = listarUsuarios();
  let idAtual: number | null = null;
  try {
    const bruto = localStorage.getItem(USUARIO_ATUAL_KEY);
    if (bruto) {
      const parsed = Number(bruto);
      if (!Number.isNaN(parsed)) idAtual = parsed;
    }
  } catch {
    idAtual = null;
  }
  if (idAtual !== null) {
    const encontrado = usuarios.find((usuario) => usuario.id === idAtual);
    if (encontrado) return encontrado;
  }
  return (
    usuarios.find((usuario) => usuario.tipo === 'Administrador' && usuario.status === 'Ativo') ??
    usuarios.find((usuario) => usuario.tipo === 'Administrador')
  );
};

export const temPermissaoProduto = (
  acao: AcaoPermissao,
  usuario: Usuario | undefined = obterUsuarioAtual()
): boolean => {
  if (!usuario) return true;
  if (usuario.status !== 'Ativo') return false;
  if (usuario.permissaoTotal) return true;
  return Boolean(usuario.permissoes.estoque?.produtos?.[acao]);
};

export const podeEditarPrecosProduto = (
  usuario: Usuario | undefined = obterUsuarioAtual()
): boolean => {
  if (!usuario) return true;
  return usuario.tipo === 'Administrador' || usuario.permissaoTotal;
};

export const podeEditarFiscalProduto = (
  usuario: Usuario | undefined = obterUsuarioAtual()
): boolean => podeEditarPrecosProduto(usuario);

export const podeAjustarEstoqueProduto = (
  usuario: Usuario | undefined = obterUsuarioAtual()
): boolean => podeEditarPrecosProduto(usuario);
