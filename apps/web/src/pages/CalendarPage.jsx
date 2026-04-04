
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import EventCard from '@/components/EventCard.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Grid3x3, List, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

function CalendarPage() {
  const [view, setView] = useState('month');
  const [selectedMember, setSelectedMember] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const events = [
    { id: 1, title: "Emma's soccer practice", time: "Apr 4, 4:30 PM", type: "activity", location: "Riverside Field", attendees: [{ initials: "E" }] },
    { id: 2, title: "Family dinner", time: "Apr 4, 7:00 PM", type: "family", attendees: [{ initials: "S" }, { initials: "M" }, { initials: "E" }, { initials: "L" }] },
    { id: 3, title: "Lucas's piano lesson", time: "Apr 5, 3:00 PM", type: "activity", location: "Music Academy", attendees: [{ initials: "L" }] },
    { id: 4, title: "Doctor appointment", time: "Apr 6, 10:00 AM", type: "appointment", location: "City Medical Center", attendees: [{ initials: "M" }] },
    { id: 5, title: "Parent-teacher conference", time: "Apr 8, 2:00 PM", type: "school", location: "Oakwood Elementary", attendees: [{ initials: "S" }, { initials: "M" }] },
  ];

  return (
    <>
      <Helmet>
        <title>Calendar - FamilyHub</title>
        <meta name="description" content="Family calendar with events, appointments, and activities" />
      </Helmet>
      
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>Family calendar</h1>
                  <p className="text-muted-foreground">Manage events and appointments</p>
                </div>
                <Button className="gap-2 touch-target">
                  <Plus className="h-4 w-4" />
                  Add event
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar View */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        April 2026
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        variant={view === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('month')}
                        className="gap-1"
                      >
                        <Grid3x3 className="h-4 w-4" />
                        Month
                      </Button>
                      <Button
                        variant={view === 'week' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('week')}
                        className="gap-1"
                      >
                        <List className="h-4 w-4" />
                        Week
                      </Button>
                      <Button
                        variant={view === 'day' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setView('day')}
                        className="gap-1"
                      >
                        <Calendar className="h-4 w-4" />
                        Day
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Simple month grid */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 35 }, (_, i) => {
                        const day = i - 2; // April 1 starts on Tuesday
                        const isCurrentMonth = day >= 1 && day <= 30;
                        const isToday = day === 4;
                        const hasEvent = [4, 5, 6, 8].includes(day);
                        
                        return (
                          <div
                            key={i}
                            className={`aspect-square p-2 rounded-lg text-center text-sm transition-all duration-200 ${
                              isCurrentMonth
                                ? 'hover:bg-muted cursor-pointer'
                                : 'text-muted-foreground/40'
                            } ${isToday ? 'bg-primary text-primary-foreground font-semibold' : ''}`}
                          >
                            {isCurrentMonth && (
                              <>
                                <div>{day}</div>
                                {hasEvent && (
                                  <div className="flex justify-center gap-0.5 mt-1">
                                    <div className="w-1 h-1 rounded-full bg-secondary" />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Filters & Events */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Family member</label>
                        <Select value={selectedMember} onValueChange={setSelectedMember}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All members</SelectItem>
                            <SelectItem value="sarah">Sarah (Mom)</SelectItem>
                            <SelectItem value="michael">Michael (Dad)</SelectItem>
                            <SelectItem value="emma">Emma</SelectItem>
                            <SelectItem value="lucas">Lucas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Event type</label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="appointment">Appointments</SelectItem>
                            <SelectItem value="activity">Activities</SelectItem>
                            <SelectItem value="school">School</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Upcoming events</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {events.map(event => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default CalendarPage;
