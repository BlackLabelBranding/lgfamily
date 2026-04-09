import React, { useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Tasks', path: '/tasks' },
  { label: 'Groceries', path: '/groceries' },
  { label: 'Family', path: '/family' },
  { label: 'Photos', path: '/photos' },
  { label: 'Vault', path: '/vault' },
  { label: 'Emergency', path: '/emergency' },
  { label: 'Settings', path: '/settings' },
];

function isActivePath(currentPath, itemPath) {
  if (itemPath === '/') return currentPath === '/';
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function getPageTitle(pathname) {
  const match = navItems.find((item) => isActivePath(pathname, item.path));
  return match?.label || 'FamilyHub';
}

function SidebarNav({ onNavigate = () => {} }) {
  const location = useLocation();

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = isActivePath(location.pathname, item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={[
              'block rounded-xl px-4 py-3 text-sm font-medium transition',
              active
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
            ].join(' ')}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MainLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-6 py-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                FamilyHub
              </h1>
              <p className="text-sm text-slate-500">
                Your family operating system
              </p>
            </div>
          </div>

          <div className="flex-1 px-4 py-4">
            <SidebarNav />
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <p className="text-xs text-slate-500">
              Native family tools first. Syncs later.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 lg:hidden"
                >
                  Menu
                </button>

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-slate-900 md:text-2xl">
                    {pageTitle}
                  </h2>
                  <p className="hidden text-sm text-slate-500 sm:block">
                    Manage your household in one place
                  </p>
                </div>
              </div>

              <Link
                to="/tasks"
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Quick Add
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">FamilyHub</h2>
                <p className="text-sm text-slate-500">Navigation</p>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="flex-1 px-4 py-4">
              <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default MainLayout;
