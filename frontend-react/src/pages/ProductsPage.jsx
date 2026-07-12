import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import SearchInput from '../components/common/SearchInput.jsx';
import Pagination from '../components/common/Pagination.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import ProductTable from '../components/products/ProductTable.jsx';
import ProductFormModal from '../components/products/ProductFormModal.jsx';
import ProductDetailModal from '../components/products/ProductDetailModal.jsx';
import { usePageActions } from '../hooks/usePageActions.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useAutoPageSize } from '../hooks/useAutoPageSize.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as productsApi from '../api/products.js';
import { getCategories } from '../api/categories.js';
import { getSuppliers } from '../api/suppliers.js';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'ok', label: 'In Stock' },
  { value: 'low', label: 'Low Stock' },
  { value: 'out', label: 'Out of Stock' },
  { value: 'archived', label: 'Archived' },
];

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const { containerRef, pageSize } = useAutoPageSize();

  const [formTarget, setFormTarget] = useState(undefined); // undefined = closed, null = create, object = edit
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProducts = useCallback(() => {
    productsApi
      .getProducts({ search: debouncedSearch, category, status, page, perPage: pageSize })
      .then(setResult);
  }, [debouncedSearch, category, status, page, pageSize]);

  // Whenever the search/category/status filters change, OR pageSize
  // recalculates (e.g. the window was resized), `page` can end up
  // pointing past the end of the new result set — e.g. sitting on "page
  // 2" right as pageSize grows enough that everything now fits on one
  // page. This correction runs DURING RENDER rather than in its own
  // useEffect deliberately: a separate effect would race with the fetch
  // effect below — both reacting to the same pageSize change — and the
  // fetch could fire with the OLD page number and the NEW pageSize
  // combined, requesting a page that no longer exists (the backend
  // returns it as empty, and the pagination controls vanish because
  // totalPages is briefly 1). Adjusting state directly in the render body
  // happens in the same pass, so the fetch effect never sees that
  // mismatched combination at all. (This is a React-documented pattern
  // for resetting derived state when an input changes.)
  const [filterKey, setFilterKey] = useState(`${debouncedSearch}|${category}|${status}|${pageSize}`);
  const nextFilterKey = `${debouncedSearch}|${category}|${status}|${pageSize}`;
  if (filterKey !== nextFilterKey) {
    setFilterKey(nextFilterKey);
    if (page !== 1) setPage(1);
  }

  useEffect(() => {
    // Guards against a slower, older request resolving AFTER a newer one
    // and overwriting it with stale data — the same protection
    // ProfitPage's fetch effect already has.
    let cancelled = false;
    productsApi
      .getProducts({ search: debouncedSearch, category, status, page, perPage: pageSize })
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        // Without this, a backend failure here (e.g. a migration that
        // hadn't been run yet) silently left `result` at its empty
        // initial state forever — indistinguishable on screen from
        // "there really are zero products", with no error shown at all.
        if (!cancelled) toast(err.message || 'Failed to load products', 'err');
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, status, page, pageSize, toast]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => toast(err.message || 'Failed to load categories', 'err'));
    getSuppliers()
      .then(setSuppliers)
      .catch((err) => toast(err.message || 'Failed to load suppliers', 'err'));
  }, [toast]);

  usePageActions(
    <Button variant="gold" icon={Plus} onClick={() => setFormTarget(null)}>
      Add Product
    </Button>,
    []
  );

  async function handleFormSubmit(payload) {
    try {
      if (formTarget) {
        await productsApi.updateProduct(formTarget.id, payload);
        toast('Product updated', 'ok');
      } else {
        await productsApi.createProduct(payload);
        toast('Product added', 'ok');
      }
      setFormTarget(undefined);
      loadProducts();
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  async function confirmDelete() {
    try {
      await productsApi.deleteProduct(deleteTarget.id);
      toast('Product removed from the active catalog', 'ok');
      setDeleteTarget(null);
      loadProducts();
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  async function handleRestore(product) {
    try {
      await productsApi.restoreProduct(product.id);
      toast(`${product.name} restored`, 'ok');
      loadProducts();
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search name or SKU…" className="w-[250px]" />
        <select className="field-input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs ${
                status === f.value ? 'border-gold-dim bg-gold/10 text-gold-light' : 'border-border text-ink-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card noPadding className="flex flex-1 flex-col" ref={containerRef}>
        <ProductTable
          products={result.data}
          canDelete={isAdmin}
          onView={setDetailTarget}
          onEdit={setFormTarget}
          onDelete={setDeleteTarget}
          onRestore={handleRestore}
        />
        <Pagination page={result.pagination.page} totalPages={result.pagination.totalPages} onChange={setPage} />
      </Card>

      {formTarget !== undefined && (
        <ProductFormModal
          product={formTarget}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setFormTarget(undefined)}
          onSubmit={handleFormSubmit}
        />
      )}

      {detailTarget && (
        <ProductDetailModal
          product={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={() => {
            setFormTarget(detailTarget);
            setDetailTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove this product?"
          message={`"${deleteTarget.name}" will be removed from the active catalog and won't appear in search, filters, or Stock In/Out anymore. Its existing transaction and profit history is kept, and it can be restored later from the Archived filter.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
