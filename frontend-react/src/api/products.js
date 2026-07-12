import { api } from './client.js';

// The backend uses minimumStock/createdAt/updatedAt; the UI (built against
// the mock layer first) uses minStock/dateAdded/lastUpdated. Mapping lives
// here so nothing in components/ or pages/ needs to know the difference.
function toFrontend(p) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    categoryId: p.categoryId,
    categoryName: p.categoryName,
    supplierId: p.supplierId,
    supplierName: p.supplierName,
    unit: p.unit,
    quantity: p.quantity,
    minStock: p.minimumStock,
    purchasePrice: p.purchasePrice,
    sellingPrice: p.sellingPrice,
    image: p.image,
    isActive: p.isActive,
    status: p.status,
    dateAdded: p.createdAt,
    lastUpdated: p.updatedAt,
  };
}

function toBackendPayload(payload) {
  return {
    sku: payload.sku,
    name: payload.name,
    categoryId: payload.categoryId,
    supplierId: payload.supplierId,
    unit: payload.unit,
    quantity: payload.quantity,
    minimumStock: payload.minStock,
    purchasePrice: payload.purchasePrice,
    sellingPrice: payload.sellingPrice,
    image: payload.image,
  };
}

export async function getProducts({ search = '', category = 'all', status = 'all', page = 1, perPage = 10 } = {}) {
  const result = await api.get('/products', {
    search,
    category: category === 'all' ? undefined : category,
    status: status === 'all' ? undefined : status,
    page,
    limit: perPage,
  });
  return { data: result.data.map(toFrontend), pagination: result.pagination };
}

export async function getProduct(id) {
  return toFrontend(await api.get(`/products/${id}`));
}

export async function createProduct(payload) {
  return toFrontend(await api.post('/products', toBackendPayload(payload)));
}

export async function updateProduct(id, payload) {
  return toFrontend(await api.put(`/products/${id}`, toBackendPayload(payload)));
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);
  return true;
}

export async function restoreProduct(id) {
  return toFrontend(await api.post(`/products/${id}/restore`));
}

// The backend's /products/summary doesn't know about category *count* (that
// lives with the categories resource), so it's merged in here rather than
// duplicating that query server-side.
export async function getProductSummary() {
  const [summary, categories] = await Promise.all([api.get('/products/summary'), api.get('/categories')]);
  return { ...summary, totalCategories: categories.length };
}
