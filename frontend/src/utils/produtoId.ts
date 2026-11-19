const MOCK_ID_KEY = 'erp-next-produto-id';
const DRAFT_IDS_KEY = 'erp-produto-draft-ids';
const INITIAL_ID = 9001;

const getStoredId = (): number => {
  try {
    const stored = localStorage.getItem(MOCK_ID_KEY);
    const parsed = stored ? parseInt(stored, 10) : NaN;
    if (!Number.isNaN(parsed)) return parsed;
    localStorage.setItem(MOCK_ID_KEY, String(INITIAL_ID));
    return INITIAL_ID;
  } catch {
    return INITIAL_ID;
  }
};

const getDraftIds = (): number[] => {
  let stored: string | null;
  try {
    stored = localStorage.getItem(DRAFT_IDS_KEY);
  } catch {
    return [];
  }
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (value): value is number => typeof value === 'number' && !Number.isNaN(value)
    );
  } catch {
    return [];
  }
};

const registerDraftId = (id: number): void => {
  const ids = getDraftIds();
  if (ids.includes(id)) return;
  try {
    localStorage.setItem(DRAFT_IDS_KEY, JSON.stringify([...ids, id]));
  } catch {
    return;
  }
};

/**
 * Indica se o ID foi emitido pelo mecanismo de rascunho (botão "Novo Produto").
 * IDs arbitrários digitados na URL não são aceitos como novo cadastro.
 */
export const isProdutoIdNovo = (id: number): boolean => getDraftIds().includes(id);

/** Emite o próximo ID provisório de produto (mecanismo já existente no ERP). */
export const gerarProximoProdutoId = (): number => {
  const current = getStoredId();
  registerDraftId(current);
  try {
    localStorage.setItem(MOCK_ID_KEY, String(current + 1));
  } catch {
    return current;
  }
  return current;
};

/** Remove o ID da lista de rascunhos depois que o cadastro foi concluído. */
export const concluirProdutoId = (id: number): void => {
  const ids = getDraftIds();
  if (!ids.includes(id)) return;
  try {
    localStorage.setItem(
      DRAFT_IDS_KEY,
      JSON.stringify(ids.filter((item) => item !== id))
    );
  } catch {
    return;
  }
};

/** Código do produto derivado do ID (somente leitura e preservado na edição). */
export const formatarCodigoProduto = (id: number): string =>
  String(id).padStart(4, '0');
