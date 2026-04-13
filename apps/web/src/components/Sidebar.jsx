import React, { useState, useEffect } from 'react';
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

const LOGO_URL = "https://ttjdhzwowqaecnhycyfb.supabase.co/storage/v1/object/public/website%20photos/garzalogo.png";

function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-3 z-50 h-10 w-10 rounded-xl bg-white shadow-md border lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="px-6 py-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-2 border border-white/10 group-hover:bg-white/20 transition-all">
              <img src={LOGO_URL} alt="Logo" className="h-full w-full object-contain brightness-0 invert" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-black tracking-tight text-white">GarzaHub</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Family OS</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2">
          <ul className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-slate-500")} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-800 p-6 bg-black/20 text-center">
             <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-600">
               © 2026 Garza Family Hub
             </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
