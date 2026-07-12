import { useEffect, useState, useCallback } from 'react';
import { ArrowDownToLine } from 'lucide-react';
import { Card, PanelTitle } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import FormField from '../components/common/FormField.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { getProducts } from '../api/products.js';
import { getSuppliers } from '../api/suppliers.js';
import { getRecentTransactions, stockIn } from '../api/transactions.js';
import { fmtDate, todayStr } from '../utils/format.js';

export default function StockInPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [recent, setRecent] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ productId: '', quantity: '', supplierId: '', date: todayStr(), notes: '' });

  const loadRecent = useCallback(() => {
    getRecentTransactions('in', 8).then(setRecent).catch((err) => toast(err.message || 'Failed to load recent activity', 'err'));
  }, [toast]);

  useEffect(() => {
    getProducts({ perPage: 1000 })
      .then((res) => {
        setProducts(res.data);
        setForm((f) => ({ ...f, productId: res.data[0]?.id || '' }));
      })
      .catch((err) => toast(err.message || 'Failed to load products', 'err'));
    getSuppliers()
      .then((res) => {
        setSuppliers(res);
        setForm((f) => ({ ...f, supplierId: res[0]?.id || '' }));
      })
      .catch((err) => toast(err.message || 'Failed to load suppliers', 'err'));
    loadRecent();
  }, [loadRecent, toast]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { product } = await stockIn({ ...form, quantity: Number(form.quantity) });
      toast(`Stock in recorded for ${product.name}`, 'ok');
      setForm((f) => ({ ...f, quantity: '', notes: '', date: todayStr() }));
      loadRecent();
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.3fr]">
      <Card>
        <PanelTitle title="Receive Inventory" />
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
          <FormField label="Supplier">
            <select className="field-input" required value={form.supplierId} onChange={(e) => set('supplierId', e.target.value)}>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Notes">
            <textarea className="field-input" rows={2} placeholder="Optional notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </FormField>
          <Button type="submit" variant="gold" icon={ArrowDownToLine} className="mt-1 w-full" disabled={saving}>
            Record Stock In
          </Button>
        </form>
      </Card>

      <Card>
        <PanelTitle title="Recent Stock In" subtitle="Latest receipts" />
        {recent.length === 0 ? (
          <EmptyState icon={ArrowDownToLine} message="No stock-in records yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="pb-2.5 font-semibold">Product</th>
                  <th className="pb-2.5 font-semibold">Qty</th>
                  <th className="pb-2.5 font-semibold">Supplier</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold">User</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-t border-border-soft">
                    <td className="py-3 font-semibold">{t.productName}</td>
                    <td className="py-3 font-mono text-success">+{t.quantity}</td>
                    <td className="py-3">{suppliers.find((s) => s.id === t.supplierId)?.name || '—'}</td>
                    <td className="py-3">{fmtDate(t.date)}</td>
                    <td className="py-3">{t.user}</td>
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
