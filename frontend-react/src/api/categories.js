import { api } from './client.js';

// Field names already match the backend response shape 1:1 — no mapping needed.

export async function getCategories() {
  return api.get('/categories');
}

export async function createCategory(payload) {
  return api.post('/categories', { name: payload.name, description: payload.description });
}

export async function updateCategory(id, payload) {
  return api.put(`/categories/${id}`, { name: payload.name, description: payload.description });
}

export async function deleteCategory(id) {
  await api.delete(`/categories/${id}`);
  return true;
}
