import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  ShoppingCart,
  Users,
  Image,
  Lock,
  AlertCircle,
  Settings,
  Menu,
  X,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/groceries', label: 'Groceries', icon: ShoppingCart },
  { path: '/family', label: 'Family', icon: Users },
  { path: '/photos', label: 'Photos', icon: Image },
  { path: '/vault', label: 'Vault', icon: Lock },
  { path: '/emergency', label: 'Emergency', icon: AlertCircle },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="border-b border-border px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-foreground">
                FamilyHub
              </h1>
              <p className="text-xs text-muted-foreground">
                Your family operating system
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <ul className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className={cn(isActive && 'font-medium')}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-4 py-4">
          <p className="text-center text-xs text-muted-foreground">
            © 2026 FamilyHub
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
