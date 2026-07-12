import { useState } from 'react';
import { Check } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import FormField from '../common/FormField.jsx';

// Quantity and Minimum Stock Level default to real, meaningful zeros — a
// brand new SKU with no stock on hand yet, or one that doesn't need a
// reorder alert, are both legitimate things a business actually wants.
// Purchase Price and Selling Price do NOT get that treatment: a $0 price
// is never a real product, it's always an unfilled field someone didn't
// notice — so these start genuinely blank ('') rather than pre-filled
// with a 0 that LOOKS like a deliberately chosen value but isn't.
const EMPTY = {
  name: '', sku: '', categoryId: '', supplierId: '', unit: '',
  quantity: 0, minStock: 5, purchasePrice: '', sellingPrice: '', image: '',
};

export default function ProductFormModal({ product, categories, suppliers, onClose, onSubmit }) {
  const editing = !!product;
  const [form, setForm] = useState(() =>
    editing
      ? {
          name: product.name, sku: product.sku, categoryId: product.categoryId, supplierId: product.supplierId,
          unit: product.unit, quantity: product.quantity, minStock: product.minStock,
          purchasePrice: product.purchasePrice, sellingPrice: product.sellingPrice, image: product.image || '',
        }
      : { ...EMPTY, categoryId: categories[0]?.id || '', supplierId: suppliers[0]?.id || '' }
  );
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        categoryId: Number(form.categoryId),
        supplierId: Number(form.supplierId),
        quantity: Number(form.quantity),
        minStock: Number(form.minStock),
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={editing ? 'Edit Product' : 'Add Product'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" icon={Check} onClick={handleSubmit} disabled={saving}>
            {editing ? 'Save Changes' : 'Add Product'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-gold-dim">Basics</div>
        <div className="grid grid-cols-2 gap-3.5">
          <FormField label="Product Name">
            <input className="field-input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </FormField>
          <FormField label="SKU">
            <input className="field-input" required value={form.sku} onChange={(e) => set('sku', e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <FormField label="Category">
            <select className="field-input" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Supplier">
            <select className="field-input" value={form.supplierId} onChange={(e) => set('supplierId', e.target.value)}>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="mb-2.5 mt-1 text-[11px] font-bold uppercase tracking-wide text-gold-dim">Stock</div>
        <div className="grid grid-cols-2 gap-3.5">
          <FormField label="Unit">
            <input
              className="field-input"
              required
              placeholder="pc, box, ream…"
              value={form.unit}
              onChange={(e) => set('unit', e.target.value)}
            />
          </FormField>
          <FormField label="Quantity">
            <input
              type="number"
              min="0"
              className="field-input"
              required
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Minimum Stock Level">
          <input
            type="number"
            min="0"
            className="field-input"
            required
            value={form.minStock}
            onChange={(e) => set('minStock', e.target.value)}
          />
        </FormField>

        <div className="mb-2.5 mt-1 text-[11px] font-bold uppercase tracking-wide text-gold-dim">Pricing</div>
        <div className="grid grid-cols-2 gap-3.5">
          <FormField label="Purchase Price">
            <input
              type="number"
              min="0.01"
              step="0.01"
              className="field-input"
              required
              value={form.purchasePrice}
              onChange={(e) => set('purchasePrice', e.target.value)}
            />
          </FormField>
          <FormField label="Selling Price">
            <input
              type="number"
              min="0.01"
              step="0.01"
              className="field-input"
              required
              value={form.sellingPrice}
              onChange={(e) => set('sellingPrice', e.target.value)}
            />
          </FormField>
        </div>

        <div className="mb-2.5 mt-1 text-[11px] font-bold uppercase tracking-wide text-gold-dim">Media</div>
        <FormField label="Product Image URL (optional)">
          <input className="field-input" placeholder="https://…" value={form.image} onChange={(e) => set('image', e.target.value)} />
        </FormField>
      </form>
    </Modal>
  );
}
