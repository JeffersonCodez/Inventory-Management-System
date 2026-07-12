import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import CategoryCard from '../components/categories/CategoryCard.jsx';
import CategoryFormModal from '../components/categories/CategoryFormModal.jsx';
import { usePageActions } from '../hooks/usePageActions.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as categoriesApi from '../api/categories.js';

export default function CategoriesPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [formTarget, setFormTarget] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    categoriesApi.getCategories().then(setCategories).catch((err) => toast(err.message || 'Failed to load categories', 'err'));
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  usePageActions(
    <Button variant="gold" icon={Plus} onClick={() => setFormTarget(null)}>
      Add Category
    </Button>,
    []
  );

  async function handleSubmit(payload) {
    try {
      if (formTarget) {
        await categoriesApi.updateCategory(formTarget.id, payload);
        toast('Category updated', 'ok');
      } else {
        await categoriesApi.createCategory(payload);
        toast('Category added', 'ok');
      }
      setFormTarget(undefined);
      load();
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  async function confirmDelete() {
    try {
      await categoriesApi.deleteCategory(deleteTarget.id);
      toast('Category deleted', 'ok');
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
        {categories.map((c) => (
          <CategoryCard key={c.id} category={c} canDelete={isAdmin} onEdit={setFormTarget} onDelete={setDeleteTarget} />
        ))}
      </div>

      {formTarget !== undefined && (
        <CategoryFormModal category={formTarget} onClose={() => setFormTarget(undefined)} onSubmit={handleSubmit} />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this category?"
          message="This will permanently remove the category."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
