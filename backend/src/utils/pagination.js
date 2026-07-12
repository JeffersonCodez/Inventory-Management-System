function toInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

export function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, toInt(query.page, 1));
  const limit = Math.min(maxLimit, Math.max(1, toInt(query.limit, defaultLimit)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function buildPaginationMeta(total, page, limit) {
  return {
    page,
    perPage: limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
