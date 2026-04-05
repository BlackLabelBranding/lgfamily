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
      </Routes>
    </>
  );
}

export default App;
