import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import WidgetCard from '@/components/WidgetCard.jsx';
import EventCard from '@/components/EventCard.jsx';
import TaskCard from '@/components/TaskCard.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  CheckSquare,
  ShoppingCart,
  FileText,
  Cake,
  Plus,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { getDashboardIdentity } from '@/lib/dashboard.js';

function DashboardPage() {
  const [identity, setIdentity] = useState(null);
  const [identityLoading, setIdentityLoading] = useState(true);
  const [identityError, setIdentityError] = useState('');

  useEffect(() => {
    async function loadIdentity() {
      try {
        const data = await getDashboardIdentity();
        setIdentity(data);
      } catch (error) {
        console.error('Dashboard identity error:', error);
        setIdentityError(error.message || 'Failed to load identity.');
      } finally {
        setIdentityLoading(false);
      }
    }

    loadIdentity();
  }, []);

  const todayEvents = [
    {
      id: 1,
      title: "Emma's soccer practice",
      time: '4:30 PM - 6:00 PM',
      type: 'activity',
      location: 'Riverside Field',
      attendees: [{ initials: 'E' }],
    },
    {
      id: 2,
      title: 'Family dinner',
      time: '7:00 PM',
      type: 'family',
      attendees: [
        { initials: 'S' },
        { initials: 'M' },
        { initials: 'E' },
        { initials: 'L' },
      ],
    },
  ];

  const upcomingEvents = [
    {
      id: 3,
      title: "Lucas's piano lesson",
      time: 'Tomorrow, 3:00 PM',
      type: 'activity',
      location: 'Music Academy',
      attendees: [{ initials: 'L' }],
    },
    {
      id: 4,
      title: 'Doctor appointment',
      time: 'Apr 6, 10:00 AM',
      type: 'appointment',
      location: 'City Medical Center',
      attendees: [{ initials: 'M' }],
    },
  ];

  const tasks = [
    {
      id: 1,
      title: 'Pick up groceries',
      completed: false,
      dueDate: 'Today',
      priority: 'high',
      assignee: { name: 'Sarah', initials: 'S' },
    },
    {
      id: 2,
      title: 'Help Emma with homework',
      completed: false,
      dueDate: 'Today',
      priority: 'medium',
      assignee: { name: 'Michael', initials: 'M' },
    },
  ];

  const reminders = [
    { text: 'Water plants', time: '6:00 PM' },
    { text: 'Call grandma', time: 'Tomorrow' },
  ];

  const groceryAlerts = [
    { item: 'Milk', status: 'Expires tomorrow' },
    { item: 'Eggs', status: 'Running low' },
  ];

  const expiringDocs = [{ doc: "Lucas's passport", date: 'Jun 15, 2026' }];

  const birthdays = [{ name: 'Grandma Rose', date: 'Apr 12' }];

  return (
    <>
      <Helmet>
        <title>Dashboard - FamilyHub</title>
        <meta
          name="description"
          content="Your family management dashboard with calendar, tasks, and important reminders"
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
                  {identityLoading
                    ? 'Loading...'
                    : `Good afternoon, ${identity?.profile?.full_name || 'there'}`}
                </h1>

                <p className="text-muted-foreground">
                  {identity?.membership?.household?.name
                    ? `Household: ${identity.membership.household.name}`
                    : "Here's what's happening with your family today"}
                </p>

                {identity?.membership?.role && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Role: {identity.membership.role}
                  </p>
                )}

                {identityError && (
                  <p className="text-sm text-red-500 mt-2">{identityError}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <WidgetCard
                  title="Today's calendar"
                  icon={Calendar}
                  action="View all"
                  className="lg:col-span-2"
                >
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </WidgetCard>

                <WidgetCard title="Task summary" icon={CheckSquare} action="View all">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Pending tasks
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-primary text-primary-foreground"
                      >
                        7
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                </WidgetCard>

                <WidgetCard title="Upcoming events" icon={Calendar}>
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </WidgetCard>

                <WidgetCard title="Reminders" icon={Bell}>
                  <div className="space-y-3">
                    {reminders.map((reminder, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                      >
                        <div className="w-2 h-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{reminder.text}</p>
                          <p className="text-xs text-muted-foreground">
                            {reminder.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </WidgetCard>

                <WidgetCard title="Grocery alerts" icon={ShoppingCart}>
                  <div className="space-y-3">
                    {groceryAlerts.map((alert, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">{alert.item}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.status}
                          </p>
                        </div>
                        <AlertCircle className="h-4 w-4 text-accent" />
                      </div>
                    ))}
                  </div>
                </WidgetCard>

                <WidgetCard title="Expiring documents" icon={FileText}>
                  <div className="space-y-3">
                    {expiringDocs.map((doc, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-1">{doc.doc}</p>
                        <p className="text-xs text-accent font-medium">
                          Expires {doc.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </WidgetCard>

                <WidgetCard title="Upcoming birthdays" icon={Cake}>
                  <div className="space-y-3">
                    {birthdays.map((birthday, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-secondary/10 rounded-lg"
                      >
                        <Cake className="h-5 w-5 text-secondary" />
                        <div>
                          <p className="text-sm font-medium">{birthday.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {birthday.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </WidgetCard>

                <WidgetCard title="Quick add" icon={Plus} className="lg:col-span-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs">Event</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <CheckSquare className="h-5 w-5" />
                      <span className="text-xs">Task</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      <span className="text-xs">Grocery</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="text-xs">Document</span>
                    </Button>
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
