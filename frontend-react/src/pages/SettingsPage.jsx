import { Card, PanelTitle } from '../components/common/Card.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <PanelTitle title="Profile" />
        <div className="mb-4">
          <label className="field-label">Name</label>
          <input className="field-input opacity-60" value={user?.name || ''} disabled />
        </div>
        <div className="mb-4">
          <label className="field-label">Email</label>
          <input className="field-input opacity-60" value={user?.email || ''} disabled />
        </div>
        <div className="mb-4">
          <label className="field-label">Role</label>
          <input className="field-input capitalize opacity-60" value={user?.role || ''} disabled />
        </div>
        <div className="text-[11.5px] text-ink-muted">Profile fields are managed by your workspace administrator.</div>
      </Card>

      <Card>
        <PanelTitle title="Appearance" />
        <div className="mb-4">
          <label className="field-label">Theme</label>
          <input className="field-input opacity-60" value="Dark + Gold" disabled />
        </div>
        <div className="mb-5 text-[11.5px] text-ink-muted">This workspace uses a fixed dark theme with gold accents.</div>

        <div className="mb-5 h-px bg-border-soft" />

        <PanelTitle title="Notifications" />
        <label className="mb-2.5 flex items-center gap-2.5 text-[13px]">
          <input type="checkbox" defaultChecked /> Low stock alerts
        </label>
        <label className="flex items-center gap-2.5 text-[13px]">
          <input type="checkbox" defaultChecked /> Weekly inventory summary email
        </label>
      </Card>
    </div>
  );
}
