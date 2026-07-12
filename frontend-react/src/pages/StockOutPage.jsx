import { useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowUpFromLine } from 'lucide-react';
import { Card, PanelTitle } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import FormField from '../components/common/FormField.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getProducts } from '../api/products.js';
import { getRecentTransactions, stockOut } from '../api/transactions.js';
import { fmtDate, fmtMoney, todayStr } from '../utils/format.js';

// 'Sale' is what stockService.js on the backend checks for to decide
// whether this stock-out should also create a row in the sales table (see
// the SALE_REASON constant there). It's listed first since, for most
// businesses, selling product is the single most common reason stock
// leaves the building.
const REASONS = ['Sale', 'Department use', 'Fully depleted', 'Damaged / expired', 'Client demo', 'Maintenance job', 'Other'];

export default function StockOutPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [recent, setRecent] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    productId: '', quantity: '', reason: REASONS[0], destination: '', date: todayStr(), notes: '',
  });

  const loadRecent = useCallback(() => {
    getRecentTransactions('out', 8).then(setRecent).catch((err) => toast(err.message || 'Failed to load recent activity', 'err'));
  }, [toast]);

  useEffect(() => {
    getProducts({ perPage: 1000 })
      .then((res) => {
        setProducts(res.data);
        setForm((f) => ({ ...f, productId: res.data[0]?.id || '' }));
      })
      .catch((err) => toast(err.message || 'Failed to load products', 'err'));
    loadRecent();
  }, [loadRecent, toast]);

  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === String(form.productId)),
    [products, form.productId]
  );

  // Purely a UI preview so the person filling this form can SEE the profit
  // before they submit — the real, authoritative calculation still happens
  // once on the backend (Sale.createWithConnection), which is what
  // actually gets stored. This just mirrors that same formula client-side.
  const isSale = form.reason === 'Sale';
  const previewProfit = useMemo(() => {
    if (!isSale || !selectedProduct || !form.quantity) return null;
    const qty = Number(form.quantity);
    if (!qty || qty <= 0) return null;
    return (Number(selectedProduct.sellingPrice) - Number(selectedProduct.purchasePrice)) * qty;
  }, [isSale, selectedProduct, form.quantity]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { product, sale } = await stockOut({ ...form, quantity: Number(form.quantity) });
      toast(
        sale ? `Sale recorded for ${product.name} — profit ${fmtMoney(sale.totalProfit)}` : `Stock out recorded for ${product.name}`,
        'ok'
      );
      setForm((f) => ({ ...f, quantity: '', destination: '', notes: '', date: todayStr() }));
      loadRecent();
      getProducts({ perPage: 1000 }).then((res) => setProducts(res.data)).catch((err) => toast(err.message || 'Failed to refresh products', 'err'));
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.3fr]">
      <Card>
        <PanelTitle title="Dispatch Inventory" />
        <form onSubmit={handleSubmit}>
          <FormField label="Product">
            <select className="field-input" required value={form.productId} onChange={(e) => set('productId', e.target.value)}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3.5">
            <FormField label="Quantity">
              <input
                type="number"
                min="1"
                required
                className="field-input"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                placeholder="0"
              />
            </FormField>
            <FormField label="Date">
              <input type="date" required className="field-input" value={form.date} onChange={(e) => set('date', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Reason">
            <select className="field-input" value={form.reason} onChange={(e) => set('reason', e.target.value)}>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>
          {isSale && previewProfit !== null && (
            <div
              className={`mb-3.5 rounded-control border px-3.5 py-2.5 text-[13px] ${
                previewProfit >= 0 ? 'border-success/30 bg-success-bg text-success' : 'border-danger/30 bg-danger-bg text-danger'
              }`}
            >
              Profit on this sale: <b className="font-mono">{fmtMoney(previewProfit)}</b>
              <span className="ml-1 text-ink-muted">
                (({fmtMoney(selectedProduct.sellingPrice)} − {fmtMoney(selectedProduct.purchasePrice)}) × {form.quantity})
              </span>
            </div>
          )}
          <FormField label={isSale ? 'Customer / Buyer' : 'Destination / User'}>
            <input
              className="field-input"
              required
              placeholder={isSale ? 'e.g. Walk-in customer' : 'e.g. Marketing Team'}
              value={form.destination}
              onChange={(e) => set('destination', e.target.value)}
            />
          </FormField>
          <FormField
            label="Notes"
            hint={selectedProduct ? `Available: ${selectedProduct.quantity} ${selectedProduct.unit}` : ''}
          >
            <textarea className="field-input" rows={2} placeholder="Optional notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </FormField>
          <Button type="submit" variant="gold" icon={ArrowUpFromLine} className="mt-1 w-full" disabled={saving}>
            Record Stock Out
          </Button>
        </form>
      </Card>

      <Card>
        <PanelTitle title="Recent Stock Out" subtitle="Latest dispatches" />
        {recent.length === 0 ? (
          <EmptyState icon={ArrowUpFromLine} message="No stock-out records yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="pb-2.5 font-semibold">Product</th>
                  <th className="pb-2.5 font-semibold">Qty</th>
                  <th className="pb-2.5 font-semibold">Reason</th>
                  <th className="pb-2.5 font-semibold">Destination</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-t border-border-soft">
                    <td className="py-3 font-semibold">{t.productName}</td>
                    <td className="py-3 font-mono text-danger">-{t.quantity}</td>
                    <td className="py-3">{t.reason || '—'}</td>
                    <td className="py-3">{t.destination || '—'}</td>
                    <td className="py-3">{fmtDate(t.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
