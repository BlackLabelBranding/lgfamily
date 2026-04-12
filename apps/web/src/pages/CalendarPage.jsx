import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Link as LinkIcon,
  Unlink,
  Loader2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  getCalendarPageData,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  toAllDayEventPayload,
  toTimedEventPayload,
} from '@/lib/calendar.js';
import { supabase } from '@/lib/supabaseClient';

const DEFAULT_FORM = {
  title: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  allDay: false,
  timezone: 'America/Chicago',
  recurrence: '',
};

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [connection, setConnection] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'day', 'week', 'month'

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingEvent, setEditingEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    loadCalendarData();
  }, []);

  async function loadCalendarData() {
    setLoading(true);
    setErrorText('');

    try {
      const now = new Date();
      // Look ahead 3 months for planning
      const startAt = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endAt = new Date(now.getFullYear(), now.getMonth() + 3, 0, 23, 59, 59).toISOString();

      const data = await getCalendarPageData({
        startAt,
        endAt,
      });

      setEvents(data.events || []);
      setConnection(data.connection || null);
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      setErrorText(error?.message || 'Failed to load calendar data.');
    } finally {
      setLoading(false);
    }
  }

  // --- FORCE SYNC LOGIC ---
  async function handleGoogleSync() {
    setSaving(true);
    setErrorText('');
    setSuccessText('');
    try {
      // Invoke the Edge Function we built for the hourly sync
      const { data, error } = await supabase.functions.invoke('hourly-calendar-sync', {
        body: { mode: 'both' }
      });

      if (error) throw error;
      
      setSuccessText('Manual sync successful! Refreshing calendar...');
      await loadCalendarData();
    } catch (error) {
      console.error('Sync error:', error);
      setErrorText('Sync failed: ' + (error.message || 'Check function logs'));
    } finally {
      setSaving(false);
    }
  }

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((event) => new Date(event.end_at) >= now)
      .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
  }, [events]);

  const pastEvents = useMemo(() => {
    const now = new Date();
    return [...events]
      .filter((event) => new Date(event.end_at) < now)
      .sort((a, b) => new Date(b.start_at) - new Date(a.start_at))
      .slice(0, 10);
  }, [events]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const weekEnd = new Date(todayEnd);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return {
      total: events.length,
      today: events.filter((event) => {
        const start = new Date(event.start_at);
        return start >= todayStart && start <= todayEnd;
      }).length,
      thisWeek: events.filter((event) => {
        const start = new Date(event.start_at);
        return start >= todayStart && start <= weekEnd;
      }).length,
      connected: connection?.is_enabled ? 'Connected' : 'Not connected',
    };
  }, [events, connection]);

  function resetForm() {
    setForm(DEFAULT_FORM);
    setEditingEvent(null);
  }

  function openAddDialog() {
    resetForm();
    const now = new Date();
    setForm((prev) => ({
      ...prev,
      startDate: formatDateForInput(now),
      endDate: formatDateForInput(now),
      startTime: '09:00',
      endTime: '10:00',
    }));
    setEventDialogOpen(true);
  }

  function openEditDialog(event) {
    setEditingEvent(event);
    const start = new Date(event.start_at);
    const end = new Date(event.end_at);
    setForm({
      title: event.title || '',
      description: event.description || '',
      location: event.location || '',
      startDate: formatDateForInput(start),
      endDate: formatDateForInput(end),
      startTime: event.all_day ? '' : formatTimeForInput(start),
      endTime: event.all_day ? '' : formatTimeForInput(end),
      allDay: !!event.all_day,
      timezone: event.timezone || 'America/Chicago',
      recurrence: event.recurrence || '',
    });
    setEventDialogOpen(true);
  }

  function openDeleteDialog(event) {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveEvent(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.startDate || !form.endDate) return;
    setSaving(true);
    try {
      const payload = form.allDay 
        ? toAllDayEventPayload(form) 
        : toTimedEventPayload({ ...form, startAt: `${form.startDate}T${form.startTime}:00`, endAt: `${form.endDate}T${form.endTime}:00` });

      if (editingEvent?.id) {
        await updateCalendarEvent(editingEvent.id, payload);
      } else {
        await addCalendarEvent(payload);
      }
      setEventDialogOpen(false);
      resetForm();
      await loadCalendarData();
      setSuccessText('Calendar updated.');
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!eventToDelete) return;
    setSaving(true);
    try {
      await deleteCalendarEvent(eventToDelete.id);
      setDeleteDialogOpen(false);
      await loadCalendarData();
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Helmet><title>Calendar - FamilyHub</title></Helmet>

      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Family Calendar</h1>
            <p className="text-muted-foreground">Unified planning for events, tasks, and birthdays.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex bg-muted p-1 rounded-xl mr-2">
               {['list', 'month'].map((m) => (
                 <Button 
                   key={m} 
                   variant={viewMode === m ? 'secondary' : 'ghost'} 
                   size="sm" 
                   className="rounded-lg capitalize"
                   onClick={() => setViewMode(m)}
                 >
                   {m}
                 </Button>
               ))}
            </div>
            
            <Button variant="outline" className="gap-2 rounded-xl" onClick={handleGoogleSync} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync Google
            </Button>

            <Button className="gap-2 rounded-xl shadow-sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4" /> Add Event
            </Button>
          </div>
        </div>

        {errorText && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errorText}</div>
        )}
        {successText && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{successText}</div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total Items" value={stats.total} />
          <StatCard label="Today" value={stats.today} />
          <StatCard label="This Week" value={stats.thisWeek} />
          <StatCard 
            label="Google Status" 
            value={stats.connected} 
            valueClassName={connection?.is_enabled ? 'text-emerald-600' : 'text-slate-400'} 
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                {viewMode === 'list' ? 'Upcoming Schedule' : 'Calendar Grid'}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>Loading your family schedule...</p>
                </div>
              ) : upcomingEvents.length ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      onEdit={() => openEditDialog(event)}
                      onDelete={() => openDeleteDialog(event)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState title="Clear skies!" description="No upcoming events or tasks found." onAction={openAddDialog} actionLabel="Add Event" />
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm border-primary/10 bg-primary/5">
               <CardHeader><CardTitle className="text-sm">Family Tip</CardTitle></CardHeader>
               <CardContent className="text-xs text-muted-foreground">
                 Birthdays from your Family page and Tasks with due dates appear here automatically.
               </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle>Shared Google Calendar</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Provider</span>
                  <Badge variant="outline">Google Calendar</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Calendar ID</span>
                  <span className="font-mono text-[10px] truncate max-w-[120px]">{connection?.provider_calendar_id || 'primary'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle>Past Events</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pastEvents.map(e => (
                  <div key={e.id} className="text-xs border-b pb-2 last:border-0">
                    <p className="font-medium">{e.title}</p>
                    <p className="text-muted-foreground">{new Date(e.start_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveEvent} className="space-y-4 pt-4">
            <Field label="Title" required>
              <InputLike value={form.title} onChange={(e) => handleFormChange('title', e.target.value)} placeholder="e.g., Family Dinner" />
            </Field>

            <Field label="Description">
              <textarea 
                value={form.description} 
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="w-full rounded-xl border bg-background p-3 text-sm min-h-[80px]" 
                placeholder="Details..."
              />
            </Field>

            <div className="flex items-center justify-between p-3 border rounded-xl bg-muted/20">
               <span className="text-sm font-medium">All-day Event</span>
               <input type="checkbox" checked={form.allDay} onChange={(e) => handleFormChange('allDay', e.target.checked)} className="h-4 w-4" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Start Date" required>
                <input type="date" value={form.startDate} onChange={(e) => handleFormChange('startDate', e.target.value)} className="w-full border p-2 rounded-lg text-sm" />
              </Field>
              <Field label="End Date" required>
                <input type="date" value={form.endDate} onChange={(e) => handleFormChange('endDate', e.target.value)} className="w-full border p-2 rounded-lg text-sm" />
              </Field>
            </div>

            {!form.allDay && (
               <div className="grid grid-cols-2 gap-4">
                 <Field label="Start Time" required>
                   <input type="time" value={form.startTime} onChange={(e) => handleFormChange('startTime', e.target.value)} className="w-full border p-2 rounded-lg text-sm" />
                 </Field>
                 <Field label="End Time" required>
                   <input type="time" value={form.endTime} onChange={(e) => handleFormChange('endTime', e.target.value)} className="w-full border p-2 rounded-lg text-sm" />
                 </Field>
               </div>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setEventDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="rounded-xl">
                {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                {editingEvent ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Event?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will remove "{eventToDelete?.title}" from the family calendar.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>Keep it</Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed} disabled={saving}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- HELPER COMPONENTS ---

function EventRow({ event, onEdit, onDelete }) {
  const isTask = event.type === 'task' || event.source === 'tasks';
  const isBirthday = event.category === 'birthday';

  return (
    <div className="group rounded-2xl border p-4 shadow-sm hover:border-primary/50 transition-all bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className={`mt-1 p-2 rounded-lg ${isBirthday ? 'bg-pink-100 text-pink-600' : isTask ? 'bg-blue-100 text-blue-600' : 'bg-primary/10 text-primary'}`}>
             {isBirthday ? <Plus className="h-4 w-4" /> : isTask ? <RefreshCw className="h-4 w-4" /> : <CalendarIcon className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold">{event.title}</h3>
              {isBirthday && <Badge className="bg-pink-500 hover:bg-pink-600 text-[10px] h-4">Birthday</Badge>}
              {isTask && <Badge variant="outline" className="text-[10px] h-4 border-blue-200 text-blue-600">Task</Badge>}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
               <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {formatEventDateRange(event)}</span>
               {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>}
            </div>
          </div>
        </div>

        {!isBirthday && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 rounded-lg"><Pencil className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 rounded-lg text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, valueClassName = '' }) {
  return (
    <Card className="rounded-2xl border-none shadow-sm bg-muted/30">
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">{label}</p>
        <p className={`text-xl font-black ${valueClassName}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function InputLike({ value, onChange, placeholder }) {
  return <input value={value} onChange={onChange} placeholder={placeholder} className="w-full h-11 rounded-xl border bg-background px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all" />;
}

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4"><CalendarDays className="h-8 w-8 text-muted-foreground/40" /></div>
      <h3 className="font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-[200px]">{description}</p>
      <Button onClick={onAction} className="rounded-xl">{actionLabel}</Button>
    </div>
  );
}

// --- DATE HELPERS ---

function formatDateForInput(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTimeForInput(date) {
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatEventDateRange(event) {
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);
  const same = start.toDateString() === end.toDateString();

  if (event.all_day) {
    return same ? start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  }

  const timeOptions = { hour: 'numeric', minute: '2-digit' };
  return same 
    ? `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • ${start.toLocaleTimeString([], timeOptions)} - ${end.toLocaleTimeString([], timeOptions)}`
    : `${start.toLocaleDateString()} ${start.toLocaleTimeString([], timeOptions)} - ${end.toLocaleTimeString([], timeOptions)}`;
}

export default CalendarPage;
