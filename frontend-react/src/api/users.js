import { api } from './client.js';

export async function getUsers() {
  return api.get('/users');
}

export async function createUser(payload) {
  return api.post('/users', { name: payload.name, email: payload.email, role: payload.role });
}

export async function deleteUser(id) {
  await api.delete(`/users/${id}`);
  return true;
}
