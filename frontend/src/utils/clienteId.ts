const MOCK_ID_KEY = 'erp-next-cliente-id';
const DRAFT_IDS_KEY = 'erp-cliente-draft-ids';

const getStoredId = (): number => {
  const stored = localStorage.getItem(MOCK_ID_KEY);
  if (stored) return parseInt(stored, 10);
  const initial = 1001;
  localStorage.setItem(MOCK_ID_KEY, String(initial));
  return initial;
};

const getDraftIds = (): number[] => {
  const stored = localStorage.getItem(DRAFT_IDS_KEY);
  if (!stored) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));
  } catch {
    return [];
  }
};

const registerDraftId = (id: number): void => {
  const ids = getDraftIds();
  if (ids.includes(id)) return;
  localStorage.setItem(DRAFT_IDS_KEY, JSON.stringify([...ids, id]));
};

export const isClienteIdNovo = (id: number): boolean => getDraftIds().includes(id);

export const gerarProximoClienteId = (): number => {
  const current = getStoredId();
  const next = current + 1;
  localStorage.setItem(MOCK_ID_KEY, String(next));
  registerDraftId(current);
  return current;
};
