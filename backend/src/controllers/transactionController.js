import { Transaction } from '../models/Transaction.js';
import { Product } from '../models/Product.js';
import * as stockService from '../services/stockService.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { deriveStatus } from '../utils/stockStatus.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildMonthlyMovement } from '../utils/monthlyMovement.js';

function toResponse(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    productSku: row.product_sku,
    type: row.transaction_type,
    quantity: row.quantity,
    userId: row.user_id,
    userName: row.user_name,
    notes: row.notes,
    reason: row.reason,
    destination: row.destination,
    supplierId: row.supplier_id,
    supplierName: row.supplier_name,
    date: row.created_at,
  };
}

function productResponse(p) {
  return {
    id: p.id, sku: p.sku, name: p.name, quantity: p.quantity,
    minimumStock: p.minimum_stock, unit: p.unit, status: deriveStatus(p.quantity, p.minimum_stock),
  };
}

export const list = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query, { defaultLimit: 8 });
  const { search, type } = req.query;
  const { rows, total } = await Transaction.findAll({ search, type, limit, offset });
  res.json({ data: rows.map(toResponse), pagination: buildPaginationMeta(total, page, limit) });
});

export const recent = asyncHandler(async (req, res) => {
  const { type, limit = 8 } = req.query;
  const rows = await Transaction.findRecent(type && type !== 'all' ? type : null, Number(limit));
  res.json(rows.map(toResponse));
});

export const getOne = asyncHandler(async (req, res) => {
  const row = await Transaction.findById(req.params.id);
  if (!row) throw ApiError.notFound('Transaction not found');
  res.json(toResponse(row));
});

export const createStockIn = asyncHandler(async (req, res) => {
  const { productId, quantity, supplierId, date, notes } = req.body;
  if (!productId || !supplierId) throw ApiError.badRequest('Product and supplier are required');

  await stockService.stockIn({
    productId, quantity: Number(quantity), supplierId, date, notes, userId: req.user.id,
  });

  const product = await Product.findById(productId);
  res.status(201).json({ product: productResponse(product) });
});

export const createStockOut = asyncHandler(async (req, res) => {
  const { productId, quantity, reason, destination, date, notes } = req.body;
  if (!productId || !destination) throw ApiError.badRequest('Product and destination are required');

  const { sale } = await stockService.stockOut({
    productId, quantity: Number(quantity), reason, destination, date, notes, userId: req.user.id,
  });

  const product = await Product.findById(productId);
  // `sale` is null unless reason === 'Sale' (see stockService.js). The
  // frontend uses this to show "profit recorded" in its confirmation
  // toast instead of a generic "stock out recorded" message.
  res.status(201).json({
    product: productResponse(product),
    sale: sale ? { totalCost: sale.totalCost, totalRevenue: sale.totalRevenue, totalProfit: sale.totalProfit } : null,
  });
});

// Aggregates transaction quantities into { month, in, out } buckets for the
// dashboard chart. The actual grouping logic lives in
// utils/monthlyMovement.js (kept pure and DB-free so it's directly unit
// testable) — this handler's only job is fetching the rows and returning
// the result.
export const monthlyMovement = asyncHandler(async (req, res) => {
  const months = Number(req.query.months) || 6;
  const all = await Transaction.findAllRaw();
  res.json(buildMonthlyMovement(all, months));
});
