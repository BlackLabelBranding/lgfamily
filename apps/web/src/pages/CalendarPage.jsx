import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
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
import { getCalendarPageData } from '@/lib/calendar.js';
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

  const autocompleteRef = useRef(null);

  useEffect(() => {
    loadCalendarData();
  }, [currentMonth]);

  // FIX: Attach Google Autocomplete to the Input inside the Dialog
  useEffect(() => {
    if (eventDialogOpen) {
      const timer = setTimeout(() => {
        const input = document.getElementById('location-input');
        if (input && window.google?.maps?.places) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(input, {
            types: ['geocode', 'establishment'],
          });

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current.getPlace();
            if (place.formatted_address || place.name) {
              setForm(prev => ({ ...prev, location: place.formatted_address || place.name }));
            }
          });
          
          // Prevent Dialog from closing on Enter key when selecting an address
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') e.stopPropagation();
          });
        }
      }, 400); // Wait for Dialog animation
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
      const { error } = await supabase.functions.invoke('hourly-calendar-sync-index-ts', { 
        body: { mode: 'both' } 
      });
      if (error) throw error;
      setSuccessText('Sync successfully triggered!');
      loadCalendarData();
    } catch (error) {
      setErrorText('Sync error. Ensure service account has access.');
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
    if (!form.title.trim()) return alert("Please enter a title");
    setSaving(true);
    try {
      const startISO = form.allDay ? `${form.startDate}T00:00:00.000Z` : `${form.startDate}T${form.startTime}:00.000Z`;
      const endISO = form.allDay ? `${form.endDate}T23:59:59.000Z` : `${form.endDate}T${form.endTime}:00.000Z`;
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
      if (editingEvent?.id) {
        await supabase.from('family_events').update(payload).eq('id', editingEvent.id);
      } else {
        await supabase.from('family_events').insert([payload]);
      }
      setEventDialogOpen(false);
      loadCalendarData();
      setSuccessText('Event saved successfully!');
    } catch (error) {
      setErrorText('Error saving event');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Helmet><title>Calendar - GarzaHub</title></Helmet>
      <div className="space-y-6 pb-20 p-4 max-w-7xl mx-auto">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">Family Calendar</h1>
            <p className="text-slate-500 font-medium">Garza Household Schedule</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-xl h-10" onClick={handleGoogleSync} disabled={saving}>
              <RefreshCw className={cn("h-4 w-4 mr-2", saving && "animate-spin")} /> Sync
            </Button>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-10" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" /> New Event
            </Button>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="space-y-4">
            {loading ? <Loader2 className="animate-spin mx-auto mt-10" /> : 
              sortedEvents.map(event => (
                <Card key={event.id} className="p-6 rounded-[2rem] border-none shadow-sm flex items-center justify-between bg-white group hover:shadow-md transition-all">
                  <div className="flex gap-4 items-center">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><CalendarIcon /></div>
                    <div>
                      <h3 className="font-black text-slate-900">{event.title}</h3>
                      <div className="flex gap-3 text-xs font-bold text-slate-500 mt-1">
                        <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {formatEventDateRange(event)}</span>
                        {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-400 group-hover:opacity-100 opacity-0" onClick={async () => {
                    await supabase.from('family_events').delete().eq('id', event.id);
                    loadCalendarData();
                  }}><Trash2 className="h-4 w-4" /></Button>
                </Card>
              ))
            }
          </div>
        )}
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="rounded-[2rem] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Event Details</DialogTitle>
            <DialogDescription>Add to your Google Family Calendar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-500">Title</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="rounded-xl bg-slate-100 border-none h-12 font-bold" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-500">Location Search</Label>
              <Input id="location-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Google Maps search..." className="rounded-xl bg-slate-100 border-none h-12" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-slate-500">Date</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value, endDate: e.target.value})} className="rounded-xl bg-slate-100 border-none h-11" />
              </div>
              {!form.allDay && (
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase text-slate-500">Time</Label>
                  <Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="rounded-xl bg-slate-100 border-none h-11" />
                </div>
              )}
            </div>
            <Button onClick={handleSaveEvent} className="w-full bg-blue-600 text-white rounded-2xl h-14 font-black mt-4 shadow-lg">Save Event</Button>
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
  const start = new Date(event.start_at);
  return `${start.toLocaleDateString()} @ ${event.all_day ? 'All Day' : start.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}`;
}

export default CalendarPage;
