import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { PageHeaderProvider } from '../../context/PageHeaderContext.jsx';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PageHeaderProvider>
      <div className="grid min-h-screen md:grid-cols-[230px_1fr]">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-[80] bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        <main className="flex max-w-[1400px] flex-col px-4 pb-14 pt-6 md:px-8">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex flex-1 flex-col animate-fadeUp">
            <Outlet />
          </div>
        </main>
      </div>
    </PageHeaderProvider>
  );
}
