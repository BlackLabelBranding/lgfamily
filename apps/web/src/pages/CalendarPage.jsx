import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  startTime: '09:00',
  endTime: '10:00',
  allDay: false,
  timezone: 'America/Chicago',
  recurrence: '',
};

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('list');
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
    try {
      const now = new Date();
      const startAt = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endAt = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString();
      const data = await getCalendarPageData({ startAt, endAt });
      setEvents(data.events || []);
      setConnection(data.connection || null);
    } catch (error) {
      setErrorText('Failed to load calendar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSync() {
    setSaving(true);
    try {
      await supabase.functions.invoke('hourly-calendar-sync', { body: { mode: 'both' } });
      setSuccessText('Sync successful!');
      loadCalendarData();
    } catch (error) {
      setErrorText('Sync failed.');
    } finally {
      setSaving(false);
    }
  }

  const upcomingEvents = useMemo(() => {
    return [...events]
      .filter((e) => new Date(e.end_at) >= new Date())
      .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
  }, [events]);

  const stats = useMemo(() => {
    return {
      total: events.length,
      connected: connection?.is_enabled ? 'Connected' : 'Disconnected',
    };
  }, [events, connection]);

  function openAddDialog() {
    const now = formatDateForInput(new Date());
    setForm({ ...DEFAULT_FORM, startDate: now, endDate: now });
    setEditingEvent(null);
    setEventDialogOpen(true);
  }

  async function handleSaveEvent(e) {
    if (e) e.preventDefault();
    
    // VALIDATION ALERT - Don't be silent!
    if (!form.title.trim()) { alert("Please enter a title"); return; }
    if (!form.startDate) { alert("Please select a start date"); return; }

    setSaving(true);
    setErrorText('');
    
    try {
      let payload;
      if (form.allDay) {
        payload = toAllDayEventPayload(form);
      } else {
        const startISO = `${form.startDate}T${form.startTime || '00:00'}:00`;
        const endISO = `${form.endDate}T${form.endTime || '00:00'}:00`;
        payload = toTimedEventPayload({ ...form, startAt: startISO, endAt: endISO });
      }

      if (editingEvent?.id) {
        await updateCalendarEvent(editingEvent.id, payload);
      } else {
        await addCalendarEvent(payload);
      }
      
      setEventDialogOpen(false);
      loadCalendarData();
      setSuccessText('Event saved successfully!');
    } catch (error) {
      setErrorText(error.message || 'Error saving event');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirmed() {
    setSaving(true);
    try {
      await deleteCalendarEvent(eventToDelete.id);
      setDeleteDialogOpen(false);
      loadCalendarData();
    } catch (error) {
      setErrorText('Delete failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Helmet><title>Calendar - GarzaHub</title></Helmet>

      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">Family Calendar</h1>
            <p className="text-muted-foreground text-sm">Unified Garza Family planning.</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl" onClick={handleGoogleSync} disabled={saving}>
              <RefreshCw className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} /> Sync
            </Button>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" /> Add Event
            </Button>
          </div>
        </div>

        {errorText && <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">{errorText}</div>}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-black">
                  <CalendarDays className="h-5 w-5 text-blue-600" /> Upcoming Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                   <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>
                ) : upcomingEvents.length ? (
                  upcomingEvents.map(event => (
                    <div key={event.id} className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><CalendarIcon className="h-5 w-5" /></div>
                        <div>
                          <h3 className="font-bold text-slate-900">{event.title}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1"><Clock3 className="h-3 w-3" /> {formatEventDateRange(event)}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => {setEventToDelete(event); setDeleteDialogOpen(true);}}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))
                ) : <p className="text-center py-10 text-slate-400">No events found.</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
             <Card className="rounded-[2rem] border-none shadow-xl bg-blue-600 text-white p-6">
                <h3 className="font-black text-lg">Calendar Status</h3>
                <div className="mt-4 space-y-2 text-sm opacity-90">
                   <div className="flex justify-between"><span>Google Sync</span><span className="font-bold">{stats.connected}</span></div>
                   <div className="flex justify-between"><span>Total Events</span><span className="font-bold">{stats.total}</span></div>
                </div>
             </Card>
          </div>
        </div>
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter">Create New Event</DialogTitle>
            <DialogDescription>Add a one-time or recurring family event.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase ml-1 text-slate-500">Event Title</Label>
              <Input 
                value={form.title} 
                onChange={(e) => setForm({...form, title: e.target.value})} 
                placeholder="Family Dinner, Practice, etc." 
                className="rounded-xl border-0 bg-slate-100 h-12" 
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <input type="checkbox" id="allDay" checked={form.allDay} onChange={e => setForm({...form, allDay: e.target.checked})} className="rounded" />
              <Label htmlFor="allDay" className="text-sm font-bold">All-day Event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase ml-1 text-slate-500">Date</Label>
                 <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value, endDate: e.target.value})} className="rounded-xl border-0 bg-slate-100" />
               </div>
               {!form.allDay && (
                 <div className="space-y-1">
                   <Label className="text-[10px] font-black uppercase ml-1 text-slate-500">Time</Label>
                   <Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="rounded-xl border-0 bg-slate-100" />
                 </div>
               )}
            </div>

            <Button 
              onClick={handleSaveEvent} 
              disabled={saving} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-blue-600/20 mt-4"
            >
              {saving ? <Loader2 className="animate-spin h-5 w-5" /> : "Create Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-[2.5rem]">
          <DialogHeader><DialogTitle className="font-black">Delete Event?</DialogTitle></DialogHeader>
          <p className="text-slate-500 text-sm italic">Are you sure you want to remove this from the Garza family schedule?</p>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="rounded-xl px-8" onClick={handleDeleteConfirmed} disabled={saving}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatDateForInput(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatEventDateRange(event) {
  const start = new Date(event.start_at);
  const timeOptions = { hour: 'numeric', minute: '2-digit' };
  return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} @ ${event.all_day ? 'All Day' : start.toLocaleTimeString([], timeOptions)}`;
}

export default CalendarPage;
