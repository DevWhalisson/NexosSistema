const MOCK_ID_KEY = 'erp-next-cliente-id';

const getStoredId = (): number => {
  const stored = localStorage.getItem(MOCK_ID_KEY);
  if (stored) return parseInt(stored, 10);
  const initial = 1001;
  localStorage.setItem(MOCK_ID_KEY, String(initial));
  return initial;
};

export const gerarProximoClienteId = (): number => {
  const current = getStoredId();
  const next = current + 1;
  localStorage.setItem(MOCK_ID_KEY, String(next));
  return current;
};
