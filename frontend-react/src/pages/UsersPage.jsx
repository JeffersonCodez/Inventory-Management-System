import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, AlertTriangle, Check } from 'lucide-react';
import { Card } from '../components/common/Card.jsx';
import Button, { IconButton } from '../components/common/Button.jsx';
import { RoleBadge } from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import FormField from '../components/common/FormField.jsx';
import { usePageActions } from '../hooks/usePageActions.js';
import { useToast } from '../context/ToastContext.jsx';
import * as usersApi from '../api/users.js';

function AddUserModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ name, email, role });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Add User"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gold" icon={Check} onClick={handleSubmit} disabled={saving}>
            Add User
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormField label="Full Name">
          <input className="field-input" required placeholder="e.g. Jamie Cruz" value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
        <FormField label="Email">
          <input
            type="email"
            className="field-input"
            required
            placeholder="jamie@ledger.io"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <FormField label="Role">
          <select className="field-input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>
      </form>
    </Modal>
  );
}

export default function UsersPage() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    usersApi.getUsers().then(setUsers);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  usePageActions(
    <Button variant="gold" icon={Plus} onClick={() => setShowAdd(true)}>
      Add User
    </Button>,
    []
  );

  async function handleAdd(payload) {
    await usersApi.createUser(payload);
    toast('User added', 'ok');
    setShowAdd(false);
    load();
  }

  async function confirmDelete() {
    await usersApi.deleteUser(deleteTarget.id);
    toast('User removed', 'ok');
    setDeleteTarget(null);
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5 rounded-control border border-border-soft bg-bg-elevated px-3 py-2 text-[11.5px] text-ink-muted">
        <AlertTriangle size={15} />
        Admins have full access. Staff can view products and update inventory but cannot delete records.
      </div>

      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-muted">
                <th className="px-5 pb-2.5 pt-4 font-semibold">Name</th>
                <th className="pb-2.5 pt-4 font-semibold">Email</th>
                <th className="pb-2.5 pt-4 font-semibold">Role</th>
                <th className="pb-2.5 pt-4" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border-soft">
                  <td className="px-5 py-3.5 font-semibold">{u.name}</td>
                  <td className="py-3.5 text-ink-muted">{u.email}</td>
                  <td className="py-3.5">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="py-3.5 pr-5">
                    <div className="flex justify-end">
                      <IconButton icon={Trash2} title="Remove" onClick={() => setDeleteTarget(u)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove this user?"
          message="This will permanently remove the user from the workspace."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
