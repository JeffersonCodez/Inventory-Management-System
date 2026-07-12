import { useState } from 'react';
import { Check } from 'lucide-react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';
import FormField from '../common/FormField.jsx';

export default function CategoryFormModal({ category, onClose, onSubmit }) {
  const editing = !!category;
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ name, description });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={editing ? 'Edit Category' : 'Add Category'}
      onClose={onClose}
      maxWidth="max-w-[440px]"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" icon={Check} onClick={handleSubmit} disabled={saving}>
            {editing ? 'Save Changes' : 'Add Category'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormField label="Category Name">
          <input className="field-input" required value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="Description">
          <textarea className="field-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>
      </form>
    </Modal>
  );
}
