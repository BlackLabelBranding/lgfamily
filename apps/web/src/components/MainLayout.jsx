import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';

const LOGO_URL = "https://ttjdhzwowqaecnhycyfb.supabase.co/storage/v1/object/public/website%20photos/garzalogo.png";

function MainLayout() {
  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans antialiased text-foreground">
      <div className="flex">
        <Sidebar />
        
        <div className="flex flex-1 flex-col transition-all duration-300 lg:ml-64">
          <Header />
          
          <main className="relative flex-1 p-6 md:p-8">
            {/* ENHANCED WATERMARK: Opacity at 6% for better visibility */}
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
