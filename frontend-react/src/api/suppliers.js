import { api } from './client.js';

// Backend uses contactPerson; the UI (built against the mock layer first)
// uses contact — mapped here so components don't need to change.
function toFrontend(s) {
  return {
    id: s.id,
    name: s.name,
    contact: s.contactPerson,
    phone: s.phone,
    email: s.email,
    address: s.address,
    notes: s.notes,
    productCount: s.productCount,
  };
}

function toBackendPayload(payload) {
  return {
    name: payload.name,
    contactPerson: payload.contact,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
    notes: payload.notes,
  };
}

export async function getSuppliers() {
  const rows = await api.get('/suppliers');
  return rows.map(toFrontend);
}

export async function createSupplier(payload) {
  return toFrontend(await api.post('/suppliers', toBackendPayload(payload)));
}

export async function updateSupplier(id, payload) {
  return toFrontend(await api.put(`/suppliers/${id}`, toBackendPayload(payload)));
}

export async function deleteSupplier(id) {
  await api.delete(`/suppliers/${id}`);
  return true;
}
