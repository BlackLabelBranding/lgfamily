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
  ChevronLeft,
  ChevronRight,
  AlignLeft
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
import { cn } from '@/lib/utils';

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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'month'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
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
      const startAt = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1).toISOString();
      const endAt = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 2, 0).toISOString();
      const data = await getCalendarPageData({ startAt, endAt });
      setEvents(data.events || []);
      setConnection(data.connection || null);
    } catch (error) {
      setErrorText('Failed to load schedule.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSync() {
    setSaving(true);
    try {
      await supabase.functions.invoke('hourly-calendar-sync', { body: { mode: 'both' } });
      setSuccessText('Google Sync complete!');
      loadCalendarData();
    } catch (error) {
      setErrorText('Sync failed.');
    } finally {
      setSaving(false);
    }
  }

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
  }, [events]);

  // --- MONTHLY GRID LOGIC ---
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let i = 1; i <= days; i++) calendarDays.push(new Date(year, month, i));
    return calendarDays;
  }, [currentMonth]);

  function openAddDialog() {
    const now = formatDateForInput(new Date());
    setForm({ ...DEFAULT_FORM, startDate: now, endDate: now });
    setEditingEvent(null);
    setEventDialogOpen(true);
  }

  async function handleSaveEvent() {
    if (!form.title.trim()) { alert("Please enter a title"); return; }
    setSaving(true);
    try {
      let payload = form.allDay 
        ? toAllDayEventPayload(form) 
        : toTimedEventPayload({ ...form, startAt: `${form.startDate}T${form.startTime}:00`, endAt: `${form.endDate}T${form.endTime}:00` });

      if (editingEvent?.id) await updateCalendarEvent(editingEvent.id, payload);
      else await addCalendarEvent(payload);
      
      setEventDialogOpen(false);
      loadCalendarData();
    } catch (error) {
      setErrorText(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Helmet><title>Calendar - GarzaHub</title></Helmet>

      <div className="space-y-6 pb-20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-black tracking-tighter">Family Calendar</h1>
            <p className="text-muted-foreground text-sm font-medium">Schedule for the Garza Household</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              <Button variant={viewMode === 'list' ? 'white' : 'ghost'} size="sm" className="rounded-lg text-[10px] font-black uppercase" onClick={() => setViewMode('list')}>List</Button>
              <Button variant={viewMode === 'month' ? 'white' : 'ghost'} size="sm" className="rounded-lg text-[10px] font-black uppercase" onClick={() => setViewMode('month')}>Month</Button>
            </div>
            <Button variant="outline" className="rounded-xl border-slate-200" onClick={handleGoogleSync} disabled={saving}>
              <RefreshCw className={cn("h-4 w-4 mr-2", saving && "animate-spin")} /> Sync
            </Button>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" /> New Event
            </Button>
          </div>
        </div>

        {viewMode === 'month' ? (
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-black tracking-tight">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}><ChevronLeft /></Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}><ChevronRight /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-3 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-100">
              {daysInMonth.map((day, i) => {
                const dayEvents = day ? sortedEvents.filter(e => new Date(e.start_at).toDateString() === day.toDateString()) : [];
                return (
                  <div key={i} className="min-h-[120px] bg-white p-2">
                    {day && (
                      <>
                        <span className={cn("text-xs font-bold mb-1 block h-6 w-6 flex items-center justify-center rounded-full", day.toDateString() === new Date().toDateString() ? "bg-blue-600 text-white" : "text-slate-400")}>
                          {day.getDate()}
                        </span>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map(e => (
                            <div key={e.id} className="text-[9px] font-bold p-1 rounded bg-blue-50 text-blue-700 truncate border border-blue-100">
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && <p className="text-[8px] font-black text-slate-400 text-center">+{dayEvents.length - 3} more</p>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
               {sortedEvents.map(event => (
                  <Card key={event.id} className="rounded-[2rem] border-none shadow-md bg-white/90 hover:shadow-xl transition-all group overflow-hidden">
                    <div className="flex items-center justify-between p-6">
                      <div className="flex gap-4 items-center">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><CalendarIcon className="h-6 w-6" /></div>
                        <div>
                          <h3 className="font-black text-lg text-slate-900">{event.title}</h3>
                          <div className="flex gap-4 mt-1">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Clock3 className="h-3 w-3" /> {formatEventDateRange(event)}</span>
                            {event.location && <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-red-400 opacity-0 group-hover:opacity-100" onClick={() => {setEventToDelete(event); setDeleteDialogOpen(true);}}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </Card>
               ))}
            </div>
            <div className="space-y-4">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white p-8">
                <h3 className="text-xl font-black tracking-tight">Schedule Stats</h3>
                <div className="mt-6 space-y-4">
                   <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-slate-400 text-sm">Google Linked</span><span className="font-bold text-blue-400">{connection?.is_enabled ? 'Yes' : 'No'}</span></div>
                   <div className="flex justify-between border-b border-white/10 pb-2"><span className="text-slate-400 text-sm">Active Events</span><span className="font-bold">{events.length}</span></div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter">New Family Event</DialogTitle>
            <DialogDescription>Syncs automatically with the Garza Shared Calendar.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Title</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Shelby's Doctor Appointment" className="rounded-xl border-0 bg-slate-100 h-12 font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Location</Label>
                 <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Office, Home, etc." className="rounded-xl border-0 bg-slate-100 h-11" />
               </div>
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Recurrence</Label>
                 <select value={form.recurrence} onChange={e => setForm({...form, recurrence: e.target.value})} className="w-full rounded-xl border-0 bg-slate-100 h-11 px-3 text-sm">
                    <option value="">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                 </select>
               </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <input type="checkbox" id="allDay" checked={form.allDay} onChange={e => setForm({...form, allDay: e.target.checked})} className="rounded" />
              <Label htmlFor="allDay" className="text-sm font-bold">All-day Event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Date</Label>
                 <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value, endDate: e.target.value})} className="rounded-xl border-0 bg-slate-100" />
               </div>
               {!form.allDay && (
                 <div className="space-y-1">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Time</Label>
                   <Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="rounded-xl border-0 bg-slate-100" />
                 </div>
               )}
            </div>

            <div className="space-y-1">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Description</Label>
               <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-xl border-0 bg-slate-100 p-3 text-sm min-h-[80px]" placeholder="Add notes..."></textarea>
            </div>

            <Button onClick={handleSaveEvent} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-14 font-black shadow-lg shadow-blue-600/20">
              {saving ? <Loader2 className="animate-spin h-5 w-5" /> : "Create Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-[2.5rem]">
          <DialogHeader><DialogTitle className="font-black text-xl">Remove Event?</DialogTitle></DialogHeader>
          <p className="text-slate-500 text-sm">This will permanently remove "{eventToDelete?.title}" from the GarzaHub.</p>
          <DialogFooter className="mt-6 gap-2">
            <Button variant="ghost" className="rounded-xl" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" className="rounded-xl px-8 font-bold" onClick={() => { deleteCalendarEvent(eventToDelete.id); setDeleteDialogOpen(false); loadCalendarData(); }}>Delete</Button>
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
