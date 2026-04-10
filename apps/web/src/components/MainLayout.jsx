import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 lg:ml-64">
        <Header />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
