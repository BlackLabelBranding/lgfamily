import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';

const LOGO_URL = "https://ttjdhzwowqaecnhycyfb.supabase.co/storage/v1/object/public/website%20photos/garzalogo.png";
const APP_PASSWORD = "5360";

function MainLayout() {
  const [input, setInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  // 🔒 PASSWORD GATE
  if (!unlocked) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-center">
            Enter FamilyHub Password
          </h2>

          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            onClick={() => {
              if (input === APP_PASSWORD) {
                setUnlocked(true);
              }
            }}
            className="w-full rounded-md bg-primary px-4 py-2 text-white text-sm font-medium hover:opacity-90"
          >
            Enter
          </button>

          {input && input !== APP_PASSWORD && (
            <p className="text-xs text-red-500 text-center">
              Incorrect password
            </p>
          )}
        </div>
      </div>
    );
  }

  // ✅ NORMAL APP
  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans antialiased text-foreground">
      <div className="flex">
        <Sidebar />
        
        <div className="flex flex-1 flex-col transition-all duration-300 lg:ml-64">
          <Header />
          
          <main className="relative flex-1 p-6 md:p-8">
            {/* WATERMARK */}
            <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center lg:ml-64 overflow-hidden">
              <img 
                src={LOGO_URL} 
                alt="" 
                className="h-[65vh] w-[65vh] object-contain opacity-[0.06] grayscale rotate-[-12deg]"
              />
            </div>
            
            <div className="relative z-10 mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
