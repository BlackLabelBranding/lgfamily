import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import MainLayout from '@/components/MainLayout.jsx';

import DashboardPage from '@/pages/DashboardPage.jsx';
import CalendarPage from '@/pages/CalendarPage.jsx';
import TasksPage from '@/pages/TasksPage.jsx';
import GroceriesPage from '@/pages/GroceriesPage.jsx';
import FamilyPage from '@/pages/FamilyPage.jsx';
import PhotosPage from '@/pages/PhotosPage.jsx';
import VaultPage from '@/pages/VaultPage.jsx';
import EmergencyPage from '@/pages/EmergencyPage.jsx';
import SettingsPage from '@/pages/SettingsPage.jsx';

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-slate-500">Page not found</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/groceries" element={<GroceriesPage />} />
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
