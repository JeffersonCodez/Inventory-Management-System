import { useState } from 'react';
import { Check } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import FormField from '../common/FormField.jsx';

const EMPTY = { name: '', contact: '', phone: '', email: '', address: '', notes: '' };

export default function SupplierFormModal({ supplier, onClose, onSubmit }) {
  const editing = !!supplier;
  const [form, setForm] = useState(editing ? { ...EMPTY, ...supplier } : EMPTY);
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={editing ? 'Edit Supplier' : 'Add Supplier'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" icon={Check} onClick={handleSubmit} disabled={saving}>
            {editing ? 'Save Changes' : 'Add Supplier'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3.5">
          <FormField label="Supplier Name">
            <input className="field-input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </FormField>
          <FormField label="Contact Person">
            <input className="field-input" value={form.contact} onChange={(e) => set('contact', e.target.value)} />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <FormField label="Phone">
            <input className="field-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </FormField>
          <FormField label="Email">
            <input type="email" className="field-input" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </FormField>
        </div>
        <FormField label="Address">
          <input className="field-input" value={form.address} onChange={(e) => set('address', e.target.value)} />
        </FormField>
        <FormField label="Notes">
          <textarea className="field-input" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </FormField>
      </form>
    </Modal>
  );
}
