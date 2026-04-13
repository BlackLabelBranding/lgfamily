import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';

const LOGO_URL = "https://ttjdhzwowqaecnhycyfb.supabase.co/storage/v1/object/public/website%20photos/garzalogo.png";

function MainLayout() {
  return (
    // THE CHANGE IS HERE: We added 'bg-slate-50' for the overall canvas.
    <div className="min-h-screen w-full bg-slate-50 font-sans antialiased text-foreground">
      <div className="flex">
        <Sidebar />
        
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col transition-all duration-300 lg:ml-64">
          <Header />
          
          {/* THE BRANDING INJECTION */}
          <main className="relative flex-1 p-6 md:p-8">
            
            {/* 1. Large, Faded Logo Watermark in the background */}
            <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center lg:ml-64 overflow-hidden">
                <img 
                    src={LOGO_URL} 
                    alt="Watermark" 
                    className="h-[70vh] w-[70vh] object-contain opacity-[0.03] grayscale rotate-[-15deg]"
                />
            </div>
            
            {/* 2. Content Renders Here (Above the watermark) */}
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
