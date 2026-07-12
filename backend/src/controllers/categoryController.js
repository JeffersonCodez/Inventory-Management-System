import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function toResponse(row) {
  return { id: row.id, name: row.name, description: row.description, productCount: Number(row.product_count || 0) };
}

export const list = asyncHandler(async (req, res) => {
  const rows = await Category.findAll();
  res.json(rows.map(toResponse));
});

export const create = asyncHandler(async (req, res) => {
  if (!req.body.name) throw ApiError.badRequest('Category name is required', 'name');
  const category = await Category.create(req.body);
  res.status(201).json(toResponse({ ...category, product_count: 0 }));
});

export const update = asyncHandler(async (req, res) => {
  const existing = await Category.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Category not found');
  if (!req.body.name) throw ApiError.badRequest('Category name is required', 'name');

  const category = await Category.update(req.params.id, req.body);
  const productCount = await Category.countProducts(req.params.id);
  res.json(toResponse({ ...category, product_count: productCount }));
});

export const remove = asyncHandler(async (req, res) => {
  const existing = await Category.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Category not found');

  const productCount = await Category.countProducts(req.params.id);
  if (productCount > 0) throw ApiError.conflict('Cannot delete — products are assigned to this category');

  await Category.remove(req.params.id);
  res.status(204).end();
});
