import React, { useEffect, useMemo, useState, useRef } from 'react';
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
} from 'lucide-react';
import {
  getCalendarPageData,
  deleteCalendarEvent,
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

const HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('list'); 
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  const [form, setForm] = useState(DEFAULT_FORM);

  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    loadCalendarData();
  }, [currentMonth]);

  // IMPROVED AUTOCOMPLETE ATTACHMENT
  useEffect(() => {
    if (eventDialogOpen) {
      // Small delay to ensure Dialog is fully open and Input is in the DOM
      const timer = setTimeout(() => {
        if (locationInputRef.current && window.google) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(locationInputRef.current, {
            types: ['geocode', 'establishment'],
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            if (place.formatted_address || place.name) {
              setForm(prev => ({ ...prev, location: place.formatted_address || place.name }));
            }
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [eventDialogOpen]);

  async function loadCalendarData() {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const startAt = new Date(year, month - 1, 1).toISOString();
      const endAt = new Date(year, month + 2, 0).toISOString();
      
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
    setErrorText('');
    setSuccessText('');
    try {
      const { data, error } = await supabase.functions.invoke('hourly-calendar-sync', { 
        body: { mode: 'both' } 
      });
      if (error) throw error;
      setSuccessText('Sync successfully triggered!');
      loadCalendarData();
    } catch (error) {
      setErrorText('Sync failed: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
  }, [events]);

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
    const today = formatDateForInput(new Date());
    setForm({ ...DEFAULT_FORM, startDate: today, endDate: today });
    setEditingEvent(null);
    setEventDialogOpen(true);
  }

  async function handleSaveEvent() {
    const finalStartDate = form.startDate || formatDateForInput(new Date());
    const finalEndDate = form.endDate || finalStartDate;

    if (!form.title.trim()) {
      alert("Please enter a title");
      return;
    }

    setSaving(true);
    setErrorText('');

    try {
      const startISO = form.allDay 
        ? `${finalStartDate}T00:00:00.000Z` 
        : `${finalStartDate}T${form.startTime || '09:00'}:00.000Z`;
      
      const endISO = form.allDay 
        ? `${finalEndDate}T23:59:59.000Z` 
        : `${finalEndDate}T${form.endTime || '10:00'}:00.000Z`;

      const payload = {
        household_id: HOUSEHOLD_ID,
        title: form.title,
        description: form.description || '',
        location: form.location || '',
        start_at: startISO,
        end_at: endISO,
        all_day: form.allDay,
        timezone: form.timezone,
        recurrence: form.recurrence || null,
        status: 'confirmed',
        source: 'familyhub'
      };

      let result;
      if (editingEvent?.id) {
        result = await supabase.from('family_events').update(payload).eq('id', editingEvent.id);
      } else {
        result = await supabase.from('family_events').insert([payload]);
      }

      if (result.error) throw result.error;
      
      setEventDialogOpen(false);
      await loadCalendarData();
      setSuccessText('Event saved successfully!');
    } catch (error) {
      setErrorText(error.message || 'Error communicating with database');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!eventToDelete) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('family_events').delete().eq('id', eventToDelete.id);
      if (error) throw error;
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

      <div className="space-y-6 pb-20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">Family Calendar</h1>
            <p className="text-muted-foreground text-sm font-medium text-slate-500">Garza Household Schedule</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="rounded-lg text-[10px] font-black uppercase h-8" onClick={() => setViewMode('list')}>List</Button>
              <Button variant={viewMode === 'month' ? 'secondary' : 'ghost'} size="sm" className="rounded-lg text-[10px] font-black uppercase h-8" onClick={() => setViewMode('month')}>Month</Button>
            </div>
            <Button variant="outline" className="rounded-xl border-slate-200 h-10" onClick={handleGoogleSync} disabled={saving}>
              <RefreshCw className={cn("h-4 w-4 mr-2", saving && "animate-spin")} /> Sync
            </Button>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 h-10 text-white font-bold" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" /> New Event
            </Button>
          </div>
        </div>

        {errorText && <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm font-bold">{errorText}</div>}
        {successText && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-sm font-bold">{successText}</div>}

        {viewMode === 'month' ? (
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-xl font-black tracking-tight text-slate-900">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><ChevronLeft /></Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><ChevronRight /></Button>
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
                  <div key={i} className="min-h-[120px] bg-white p-2 relative group">
                    {day && (
                      <>
                        <span className={cn("text-xs font-bold mb-1 block h-6 w-6 flex items-center justify-center rounded-full", day.toDateString() === new Date().toDateString() ? "bg-blue-600 text-white" : "text-slate-400")}>
                          {day.getDate()}
                        </span>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map(e => (
                            <div key={e.id} className="text-[9px] font-bold p-1 rounded bg-blue-50 text-blue-700 truncate border border-blue-100">{e.title}</div>
                          ))}
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
               {loading ? <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" /></div> : 
               sortedEvents.map(event => (
                  <Card key={event.id} className="rounded-[2rem] border-none shadow-md bg-white/90 group overflow-hidden hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between p-6">
                      <div className="flex gap-4 items-center">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><CalendarIcon className="h-6 w-6" /></div>
                        <div>
                          <h3 className="font-black text-lg text-slate-900">{event.title}</h3>
                          <div className="flex flex-wrap gap-4 mt-1">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Clock3 className="h-3 w-3" /> {formatEventDateRange(event)}</span>
                            {event.location && <span className="text-xs font-bold text-slate-500 flex items-center gap-1 max-w-[200px] truncate"><MapPin className="h-3 w-3" /> {event.location}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="ghost" size="icon" className="text-slate-400 opacity-0 group-hover:opacity-100" onClick={() => {
                            setEditingEvent(event);
                            const d = new Date(event.start_at);
                            setForm({
                               ...form,
                               title: event.title,
                               location: event.location,
                               description: event.description || '',
                               recurrence: event.recurrence || '',
                               allDay: event.all_day,
                               startDate: formatDateForInput(d),
                               startTime: d.getUTCHours().toString().padStart(2, '0') + ':' + d.getUTCMinutes().toString().padStart(2, '0')
                            });
                            setEventDialogOpen(true);
                         }}><Pencil className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" className="text-red-400 opacity-0 group-hover:opacity-100" onClick={() => {setEventToDelete(event); setDeleteDialogOpen(true);}}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </Card>
               ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter">Event Details</DialogTitle>
            <DialogDescription>Syncs automatically with your shared calendar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 text-slate-900">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Title</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Event name..." className="rounded-xl border-0 bg-slate-100 h-12 font-bold focus-visible:ring-blue-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Location Search</Label>
                 <Input 
                   ref={locationInputRef}
                   value={form.location} 
                   onChange={e => setForm({...form, location: e.target.value})} 
                   placeholder="Google Maps search..." 
                   className="rounded-xl border-0 bg-slate-100 h-11 focus-visible:ring-blue-600" 
                 />
               </div>
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Recurrence</Label>
                 <select value={form.recurrence} onChange={e => setForm({...form, recurrence: e.target.value})} className="w-full rounded-xl border-0 bg-slate-100 h-11 px-3 text-sm focus:ring-2 focus:ring-blue-600">
                    <option value="">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                 </select>
               </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input type="checkbox" id="allDay" checked={form.allDay} onChange={e => setForm({...form, allDay: e.target.checked})} className="rounded h-4 w-4 accent-blue-600" />
              <Label htmlFor="allDay" className="text-sm font-bold">All-day Event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Date</Label>
                 <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value, endDate: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-11" />
               </div>
               {!form.allDay && (
                 <div className="space-y-1">
                   <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Time</Label>
                   <Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-11" />
                 </div>
               )}
            </div>

            <div className="space-y-1">
               <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Description</Label>
               <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-xl border-0 bg-slate-100 p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Add additional details..."></textarea>
            </div>

            <Button onClick={handleSaveEvent} disabled={saving} className="w-full bg-blue-600 text-white rounded-2xl h-14 font-black shadow-lg mt-2 hover:bg-blue-700 transition-all">
              {saving ? <Loader2 className="animate-spin h-5 w-5" /> : editingEvent ? "Update GarzaHub Event" : "Create GarzaHub Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl text-slate-900">Delete Event?</DialogTitle>
            <DialogDescription>This will remove the event from the shared family schedule.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} className="rounded-xl flex-1 h-12">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirmed} className="rounded-xl flex-1 font-bold h-12 shadow-lg shadow-red-500/20">Delete Forever</Button>
          </div>
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
  if (!event.start_at) return 'No date set';
  const start = new Date(event.start_at);
  const options = { hour: 'numeric', minute: '2-digit' };
  return `${start.toLocaleDateString()} @ ${event.all_day ? 'All Day' : start.toLocaleTimeString([], options)}`;
}

export default CalendarPage;
