
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import TasksPage from './pages/TasksPage';
import GroceriesPage from './pages/GroceriesPage';
import FamilyPage from './pages/FamilyPage';
import PhotosPage from './pages/PhotosPage';
import VaultPage from './pages/VaultPage';
import EmergencyPage from './pages/EmergencyPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
