import { Supplier } from '../models/Supplier.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function toResponse(row) {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email,
    address: row.address,
    notes: row.notes,
    productCount: Number(row.product_count || 0),
  };
}

export const list = asyncHandler(async (req, res) => {
  const rows = await Supplier.findAll();
  res.json(rows.map(toResponse));
});

export const create = asyncHandler(async (req, res) => {
  if (!req.body.name) throw ApiError.badRequest('Supplier name is required', 'name');
  const supplier = await Supplier.create(req.body);
  res.status(201).json(toResponse({ ...supplier, product_count: 0 }));
});

export const update = asyncHandler(async (req, res) => {
  const existing = await Supplier.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Supplier not found');
  if (!req.body.name) throw ApiError.badRequest('Supplier name is required', 'name');

  const supplier = await Supplier.update(req.params.id, req.body);
  const productCount = await Supplier.countProducts(req.params.id);
  res.json(toResponse({ ...supplier, product_count: productCount }));
});

export const remove = asyncHandler(async (req, res) => {
  const existing = await Supplier.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Supplier not found');

  const productCount = await Supplier.countProducts(req.params.id);
  if (productCount > 0) throw ApiError.conflict('Cannot delete — products reference this supplier');

  await Supplier.remove(req.params.id);
  res.status(204).end();
});
