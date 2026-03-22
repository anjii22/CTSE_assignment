export const formatMoney = (value: unknown) => {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
};

export const formatDateShort = (value: unknown) => {
  if (!value) return '—';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
};

export const getUserId = (user: unknown): string => {
  if (!user || typeof user !== 'object') return '';
  const u = user as { _id?: unknown; id?: unknown; userId?: unknown };
  return (
    (typeof u._id === 'string' && u._id) ||
    (typeof u.id === 'string' && u.id) ||
    (typeof u.userId === 'string' && u.userId) ||
    ''
  );
};

