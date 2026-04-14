import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Clock3, MapPin, Plus, Pencil, Trash2, RefreshCw, 
  Loader2, Calendar as CalendarIcon, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { getCalendarPageData } from '@/lib/calendar.js';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

const DEFAULT_FORM = { title: '', description: '', location: '', startDate: '', endDate: '', startTime: '09:00', endTime: '10:00', allDay: false, recurrence: '' };
const HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('list'); 
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const autocompleteRef = useRef(null);

  useEffect(() => { loadCalendarData(); }, [currentMonth]);

  // GOOGLE MAPS LOOKUP LOGIC
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
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [eventDialogOpen]);

  async function loadCalendarData() {
    setLoading(true);
    try {
      const data = await getCalendarPageData({ 
        startAt: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString(),
        endAt: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString()
      });
      setEvents(data.events || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  async function handleGoogleSync() {
    setSaving(true);
    try {
      await supabase.functions.invoke('hourly-calendar-sync-index-ts', { body: { mode: 'both' } });
      loadCalendarData();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  }

  async function handleSaveEvent() {
    if (!form.title.trim()) return;
    setSaving(true);
    const startISO = form.allDay ? `${form.startDate}T00:00:00.000Z` : `${form.startDate}T${form.startTime}:00.000Z`;
    const endISO = form.allDay ? `${form.startDate}T23:59:59.000Z` : `${form.startDate}T${form.endTime || '10:00'}:00.000Z`;
    
    const payload = { 
      household_id: HOUSEHOLD_ID, title: form.title, description: form.description, 
      location: form.location, start_at: startISO, end_at: endISO, 
      all_day: form.allDay, recurrence: form.recurrence || null 
    };

    if (editingEvent?.id) await supabase.from('family_events').update(payload).eq('id', editingEvent.id);
    else await supabase.from('family_events').insert([payload]);

    setEventDialogOpen(false);
    loadCalendarData();
    setSaving(false);
  }

  // CALENDAR GRID CALCULATIONS
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

  return (
    <>
      <Helmet><title>Calendar - GarzaHub</title></Helmet>
      <div className="space-y-6 pb-20 p-2 sm:p-4 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row bg-white/50 p-4 rounded-[2rem] backdrop-blur-sm shadow-sm">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">Garza Calendar</h1>
            <p className="text-slate-500 font-medium text-sm">Family Schedule</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" className="flex-1 sm:flex-none rounded-lg font-bold" onClick={() => setViewMode('list')}>List</Button>
              <Button variant={viewMode === 'month' ? 'secondary' : 'ghost'} size="sm" className="flex-1 sm:flex-none rounded-lg font-bold" onClick={() => setViewMode('month')}>Month</Button>
            </div>
            <Button variant="outline" className="rounded-xl h-10 flex-1 sm:flex-none" onClick={handleGoogleSync} disabled={saving}>
              <RefreshCw className={cn("h-4 w-4 mr-2", saving && "animate-spin")} /> Sync
            </Button>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 flex-1 sm:flex-none" onClick={() => { setForm({ ...DEFAULT_FORM, startDate: new Date().toISOString().split('T')[0] }); setEditingEvent(null); setEventDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> New
            </Button>
          </div>
        </div>

        {/* VIEW MODES */}
        {viewMode === 'month' ? (
          <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
            <div className="p-4 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-black text-lg">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><ChevronLeft /></Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><ChevronRight /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center border-b border-slate-100 py-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[10px] font-black text-slate-400">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-100">
              {daysInMonth.map((day, i) => {
                const dayEvents = day ? events.filter(e => new Date(e.start_at).toDateString() === day.toDateString()) : [];
                return (
                  <div key={i} className="min-h-[80px] sm:min-h-[120px] bg-white p-1">
                    {day && (
                      <>
                        <span className={cn("text-[10px] font-bold block h-5 w-5 flex items-center justify-center rounded-full mx-auto", day.toDateString() === new Date().toDateString() ? "bg-blue-600 text-white" : "text-slate-400")}>{day.getDate()}</span>
                        <div className="space-y-0.5 mt-1">
                          {dayEvents.slice(0, 2).map(e => <div key={e.id} className="text-[8px] sm:text-[10px] bg-blue-50 text-blue-700 p-0.5 rounded border border-blue-100 truncate font-bold">{e.title}</div>)}
                          {dayEvents.length > 2 && <div className="text-[8px] text-slate-400 text-center">+{dayEvents.length - 2} more</div>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {loading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div> : 
              events.map(event => (
                <Card key={event.id} className="p-4 rounded-[1.5rem] border-none shadow-sm flex items-center justify-between bg-white group hover:shadow-md transition-all">
                  <div className="flex gap-3 items-center text-slate-900 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><CalendarIcon className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <h3 className="font-black truncate">{event.title}</h3>
                      <div className="flex gap-2 text-[10px] font-bold text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 shrink-0"><Clock3 className="h-3 w-3" /> {new Date(event.start_at).toLocaleDateString()}</span>
                        {event.location && <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3" /> {event.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={() => {
                      setEditingEvent(event);
                      const d = new Date(event.start_at);
                      setForm({...form, title: event.title, location: event.location, description: event.description || '', recurrence: event.recurrence || '', allDay: event.all_day, startDate: event.start_at.split('T')[0], startTime: d.getUTCHours().toString().padStart(2, '0') + ':00'});
                      setEventDialogOpen(true);
                    }}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={async () => { await supabase.from('family_events').delete().eq('id', event.id); loadCalendarData(); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </Card>
              ))
            }
          </div>
        )}
      </div>

      {/* ADD/EDIT DIALOG */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-2xl font-black">Event Details</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2 text-slate-900">
            <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-12 font-bold" /></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Location Lookup</Label>
                 <Input id="location-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Start typing..." className="rounded-xl border-0 bg-slate-100 h-11" />
               </div>
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Recurrence</Label>
                 <select value={form.recurrence} onChange={e => setForm({...form, recurrence: e.target.value})} className="w-full rounded-xl border-0 bg-slate-100 h-11 px-3 text-sm">
                   <option value="">One-time</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                 </select>
               </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input type="checkbox" id="allDay" checked={form.allDay} onChange={e => setForm({...form, allDay: e.target.checked})} className="rounded h-4 w-4 accent-blue-600" />
              <Label htmlFor="allDay" className="text-sm font-bold">All-day Event</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value, endDate: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-11" /></div>
               {!form.allDay && <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Time</Label><Input type="time" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-11" /></div>}
            </div>

            <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Description</Label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-xl border-0 bg-slate-100 p-3 text-sm min-h-[80px]" placeholder="Extra notes..."></textarea></div>
            
            <Button onClick={handleSaveEvent} disabled={saving} className="w-full bg-blue-600 text-white rounded-2xl h-14 font-black shadow-lg">{saving ? <Loader2 className="animate-spin h-5 w-5" /> : "Save to GarzaHub"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CalendarPage;
