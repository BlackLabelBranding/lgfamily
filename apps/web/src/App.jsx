import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop.jsx';

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
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-slate-500">Page not found</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/groceries" element={<GroceriesPage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/photos" element={<PhotosPage />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Future: auth wrapper goes here */}

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
