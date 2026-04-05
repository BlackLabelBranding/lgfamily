import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import WidgetCard from '@/components/WidgetCard.jsx';
import { Users, Calendar, CheckSquare, ShoppingCart, Shield } from 'lucide-react';
import { getDashboardData } from '@/lib/dashboard.js';

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboardData();
        setDashboard(data);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError(err.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const greetingName =
    dashboard?.profile?.full_name ||
    dashboard?.user?.email ||
    'there';

  return (
    <>
      <Helmet>
        <title>Dashboard - FamilyHub</title>
        <meta
          name="description"
          content="Your family management dashboard"
        />
      </Helmet>

      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1
                  className="text-3xl font-bold mb-2"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {loading ? 'Loading...' : `Good afternoon, ${greetingName}`}
                </h1>

                <p className="text-muted-foreground">
                  {dashboard?.membership?.household?.name
                    ? `Household: ${dashboard.membership.household.name}`
                    : 'Your family operating system is being wired up.'}
                </p>

                {dashboard?.membership?.role && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Role: {dashboard.membership.role}
                  </p>
                )}

                {error && (
                  <p className="text-sm text-red-500 mt-2">{error}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <WidgetCard title="Family members" icon={Users}>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">
                      {dashboard?.stats?.familyCount ?? 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Real people saved in your household
                    </p>
                  </div>
                </WidgetCard>

                <WidgetCard title="Calendar" icon={Calendar}>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">
                      No real calendar events wired yet
                    </p>
                  </div>
                </WidgetCard>

                <WidgetCard title="Tasks" icon={CheckSquare}>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">
                      Task module is next
                    </p>
                  </div>
                </WidgetCard>

                <WidgetCard title="Groceries" icon={ShoppingCart}>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">
                      Grocery module is not wired yet
                    </p>
                  </div>
                </WidgetCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <WidgetCard title="Family system status" icon={Shield}>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span>Supabase connection</span>
                      <span className="font-medium">Live</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <span>Household identity</span>
                      <span className="font-medium">
                        {dashboard?.membership?.household?.name ? 'Connected' : 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <span>Family members</span>
                      <span className="font-medium">
                        {dashboard?.stats?.familyCount > 0 ? 'Connected' : 'Ready'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <span>Tasks</span>
                      <span className="font-medium">Next</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Vault / documents</span>
                      <span className="font-medium">Later</span>
                    </div>
                  </div>
                </WidgetCard>

                <WidgetCard title="What to do next" icon={Users}>
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      This dashboard is no longer using fake family demo content.
                    </p>
                    <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                      <li>Add real family members on the Family page</li>
                      <li>Wire the Tasks page to Supabase</li>
                      <li>Wire the Calendar page after tasks</li>
                      <li>Leave vault documents until permissions feel solid</li>
                    </ul>
                  </div>
                </WidgetCard>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default DashboardPage;
