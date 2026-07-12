import { Product } from '../models/Product.js';
import { deriveStatus } from '../utils/stockStatus.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function toResponse(row) {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    unit: row.unit,
    quantity: row.quantity,
    minimumStock: row.minimum_stock,
    purchasePrice: Number(row.purchase_price),
    sellingPrice: Number(row.selling_price),
    image: row.image,
    isActive: !!row.is_active,
    status: deriveStatus(row.quantity, row.minimum_stock),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query, { defaultLimit: 6 });
  const { search, category, status } = req.query;

  const { rows, total } = await Product.findAll({
    search, categoryId: category && category !== 'all' ? category : null,
    status: status && status !== 'all' ? status : null, limit, offset,
  });

  res.json({ data: rows.map(toResponse), pagination: buildPaginationMeta(total, page, limit) });
});

export const summary = asyncHandler(async (req, res) => {
  res.json(await Product.summary());
});

export const getOne = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  res.json(toResponse(product));
});

export const create = asyncHandler(async (req, res) => {
  const data = req.body;
  if (!data.name || !data.sku) throw ApiError.badRequest('Name and SKU are required', 'name');

  const existing = await Product.findBySku(data.sku);
  if (existing) throw ApiError.conflict('SKU already exists', 'sku');

  const product = await Product.create(data);
  res.status(201).json(toResponse(product));
});

export const update = asyncHandler(async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Product not found');

  if (req.body.sku) {
    const clash = await Product.findBySku(req.body.sku, req.params.id);
    if (clash) throw ApiError.conflict('SKU already exists', 'sku');
  }

  const merged = {
    sku: req.body.sku ?? existing.sku,
    name: req.body.name ?? existing.name,
    categoryId: req.body.categoryId ?? existing.category_id,
    supplierId: req.body.supplierId ?? existing.supplier_id,
    unit: req.body.unit ?? existing.unit,
    quantity: req.body.quantity ?? existing.quantity,
    minimumStock: req.body.minimumStock ?? existing.minimum_stock,
    purchasePrice: req.body.purchasePrice ?? existing.purchase_price,
    sellingPrice: req.body.sellingPrice ?? existing.selling_price,
    image: req.body.image ?? existing.image,
  };

  const product = await Product.update(req.params.id, merged);
  res.json(toResponse(product));
});

export const remove = asyncHandler(async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Product not found');
  await Product.remove(req.params.id);
  res.status(204).end();
});

export const restore = asyncHandler(async (req, res) => {
  const existing = await Product.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Product not found');
  await Product.restore(req.params.id);
  res.json(toResponse(await Product.findById(req.params.id)));
});
