import { pool } from '../config/database.js';
import { Product } from '../models/Product.js';
import { Transaction } from '../models/Transaction.js';
import { Sale } from '../models/Sale.js';
import { ApiError } from '../utils/ApiError.js';
import { hasValidPricing } from '../utils/productPricing.js';

// A stock-out is only counted as REALIZED PROFIT when it's explicitly
// marked as a completed sale. Everything else that reduces stock —
// department use, damaged/expired goods, maintenance jobs, "Other" — must
// NOT contribute to profit (this is an explicit business rule from the
// feature spec). Reusing the existing free-text `reason` field for this
// (rather than adding a new column) keeps the change minimal: the
// Stock Out form already has a reason dropdown, we're just giving one of
// its options ('Sale') special meaning on the backend.
const SALE_REASON = 'Sale';
function isSaleReason(reason) {
  return reason === SALE_REASON;
}

// Stock-in and stock-out both touch two tables (products, transactions) and
// must succeed or fail together — a crash between the two writes would
// silently corrupt the inventory count. Both run inside an explicit
// BEGIN/COMMIT/ROLLBACK using a single checked-out connection.

export async function stockIn({ productId, quantity, supplierId, date, notes, userId }) {
  if (!quantity || quantity <= 0) throw ApiError.badRequest('Enter a valid quantity', 'quantity');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[product]] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [productId]);
    if (!product) throw ApiError.notFound('Product not found');
    // The Stock In product picker only lists active products (it fetches
    // from the same filtered list the Products page uses), so reaching
    // this normally isn't possible through the UI — this guard is for
    // anyone hitting the API directly with an archived product's id.
    if (!product.is_active) throw ApiError.badRequest(`${product.name} has been removed from the catalog`, 'productId');

    await conn.query('UPDATE products SET quantity = quantity + ? WHERE id = ?', [quantity, productId]);
    const transactionId = await Transaction.createWithConnection(conn, {
      productId, type: 'in', quantity, supplierId, date, notes, userId,
    });

    await conn.commit();
    return { productId, transactionId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function stockOut({ productId, quantity, reason, destination, date, notes, userId }) {
  if (!quantity || quantity <= 0) throw ApiError.badRequest('Enter a valid quantity', 'quantity');

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[product]] = await conn.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [productId]);
    if (!product) throw ApiError.notFound('Product not found');
    if (!product.is_active) throw ApiError.badRequest(`${product.name} has been removed from the catalog`, 'productId');
    if (quantity > product.quantity) {
      throw ApiError.badRequest(`Only ${product.quantity} ${product.unit} available`, 'quantity');
    }

    // Guards against selling a product with no real price on record. This
    // matters even with the Add/Edit Product form now requiring a
    // positive price, because it doesn't retroactively fix products that
    // were already saved with a $0 price before that validation existed —
    // this is exactly the scenario that produced a nonsensical negative
    // "profit" on a sale: purchasePrice=10, sellingPrice=0 silently
    // recorded a -10 profit instead of being rejected outright. Checked
    // here, not just on the product form, so it's impossible to sell a
    // bad-data product no matter how its price ended up at zero.
    if (isSaleReason(reason) && !hasValidPricing(product)) {
      throw ApiError.badRequest(
        `${product.name} has no valid price set — edit the product and set both a purchase and selling price before selling it`,
        'productId'
      );
    }

    await conn.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [quantity, productId]);
    const transactionId = await Transaction.createWithConnection(conn, {
      productId, type: 'out', quantity, reason, destination, date, notes, userId,
    });

    // Only reached for reason === 'Sale'. Note we read purchase_price /
    // selling_price from `product` — the row we already fetched with
    // `FOR UPDATE` above — rather than issuing a second SELECT. This also
    // means the sale permanently records the price AT THE MOMENT OF SALE,
    // so editing a product's prices later never rewrites sales history.
    let sale = null;
    if (isSaleReason(reason)) {
      sale = await Sale.createWithConnection(conn, {
        transactionId,
        productId,
        quantitySold: quantity,
        purchasePrice: Number(product.purchase_price),
        sellingPrice: Number(product.selling_price),
        soldBy: userId,
        soldAt: date,
      });
    }

    await conn.commit();
    return { productId, transactionId, sale };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
