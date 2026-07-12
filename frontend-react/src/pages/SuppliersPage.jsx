import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import SupplierCard from '../components/suppliers/SupplierCard.jsx';
import SupplierFormModal from '../components/suppliers/SupplierFormModal.jsx';
import { usePageActions } from '../hooks/usePageActions.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as suppliersApi from '../api/suppliers.js';

export default function SuppliersPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [formTarget, setFormTarget] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    suppliersApi.getSuppliers().then(setSuppliers).catch((err) => toast(err.message || 'Failed to load suppliers', 'err'));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  usePageActions(
    <Button variant="gold" icon={Plus} onClick={() => setFormTarget(null)}>
      Add Supplier
    </Button>,
    []
  );

  async function handleSubmit(payload) {
    try {
      if (formTarget) {
        await suppliersApi.updateSupplier(formTarget.id, payload);
        toast('Supplier updated', 'ok');
      } else {
        await suppliersApi.createSupplier(payload);
        toast('Supplier added', 'ok');
      }
      setFormTarget(undefined);
      load();
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  async function confirmDelete() {
    try {
      await suppliersApi.deleteSupplier(deleteTarget.id);
      toast('Supplier deleted', 'ok');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err.message, 'err');
      setDeleteTarget(null);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((s) => (
          <SupplierCard key={s.id} supplier={s} canDelete={isAdmin} onEdit={setFormTarget} onDelete={setDeleteTarget} />
        ))}
      </div>

      {formTarget !== undefined && (
        <SupplierFormModal supplier={formTarget} onClose={() => setFormTarget(undefined)} onSubmit={handleSubmit} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this supplier?"
          message="This will permanently remove the supplier."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
