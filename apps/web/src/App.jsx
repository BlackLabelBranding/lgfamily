import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import MainLayout from '@/components/MainLayout.jsx';

// Page Imports
import DashboardPage from '@/pages/DashboardPage.jsx';
import CalendarPage from '@/pages/CalendarPage.jsx';
import TasksPage from '@/pages/TasksPage.jsx';
import GroceriesPage from '@/pages/GroceriesPage.jsx';
import FamilyPage from '@/pages/FamilyPage.jsx';
import FamilyProfile from '@/pages/FamilyProfile.jsx'; // New Profile Page
import PhotosPage from '@/pages/PhotosPage.jsx';
import VaultPage from '@/pages/VaultPage.jsx';
import EmergencyPage from '@/pages/EmergencyPage.jsx';
import SettingsPage from '@/pages/SettingsPage.jsx';

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="rounded-[2.5rem] border border-border bg-card p-12 text-center shadow-xl shadow-blue-500/5">
        <h1 className="text-5xl font-black text-blue-600">404</h1>
        <p className="mt-2 font-bold text-foreground">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">The GarzaHub section you're looking for doesn't exist.</p>
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
          {/* Main Dashboard */}
          <Route path="/" element={<DashboardPage />} />
          
          {/* Calendar & Scheduling */}
          <Route path="/calendar" element={<CalendarPage />} />
          
          {/* Organization & Lists */}
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/groceries" element={<GroceriesPage />} />
          
          {/* Family Section */}
          <Route path="/family" element={<FamilyPage />} />
          <Route path="/family/:memberId" element={<FamilyProfile />} />
          
          {/* Media & Security */}
          <Route path="/photos" element={<PhotosPage />} />
          <Route path="/vault" element={<VaultPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          
          {/* App Configuration */}
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
