import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock3, MapPin, Plus, Pencil, Trash2, RefreshCw, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { getCalendarPageData } from '@/lib/calendar.js';
import { supabase } from '@/lib/supabaseClient';
import { cn } from '@/lib/utils';

const DEFAULT_FORM = { title: '', description: '', location: '', startDate: '', endDate: '', startTime: '09:00', endTime: '10:00', allDay: false, recurrence: '' };
const HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => { loadCalendarData(); }, []);

  async function loadCalendarData() {
    setLoading(true);
    try {
      const data = await getCalendarPageData({ startAt: new Date(2024, 0, 1).toISOString(), endAt: new Date(2027, 0, 1).toISOString() });
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
    const endISO = form.allDay ? `${form.endDate}T23:59:59.000Z` : `${form.endDate}T${form.endTime}:00.000Z`;
    const payload = { 
      household_id: HOUSEHOLD_ID, 
      title: form.title, 
      description: form.description, 
      location: form.location, 
      start_at: startISO, 
      end_at: endISO, 
      all_day: form.allDay, 
      recurrence: form.recurrence || null 
    };

    if (editingEvent?.id) await supabase.from('family_events').update(payload).eq('id', editingEvent.id);
    else await supabase.from('family_events').insert([payload]);

    setEventDialogOpen(false);
    loadCalendarData();
    setSaving(false);
  }

  return (
    <>
      <Helmet><title>Calendar - GarzaHub</title></Helmet>
      <div className="space-y-6 pb-20 p-4 max-w-7xl mx-auto">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">Family Calendar</h1>
            <p className="text-slate-500 font-medium text-sm">Garza Household Schedule</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl h-10" onClick={handleGoogleSync} disabled={saving}>
              <RefreshCw className={cn("h-4 w-4 mr-2", saving && "animate-spin")} /> Sync
            </Button>
            <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-10" onClick={() => { 
              setForm({ ...DEFAULT_FORM, startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }); 
              setEditingEvent(null); 
              setEventDialogOpen(true); 
            }}>
              <Plus className="h-4 w-4 mr-2" /> New Event
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-600" /></div> : 
            events.map(event => (
              <Card key={event.id} className="p-6 rounded-[2rem] border-none shadow-sm flex items-center justify-between bg-white group hover:shadow-md transition-all">
                <div className="flex gap-4 items-center text-slate-900">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><CalendarIcon /></div>
                  <div>
                    <h3 className="font-black">{event.title}</h3>
                    <div className="flex gap-3 text-xs font-bold text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {new Date(event.start_at).toLocaleDateString()}</span>
                      {event.location && <span className="flex items-center gap-1 line-clamp-1"><MapPin className="h-3 w-3" /> {event.location}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => { 
                     setEditingEvent(event); 
                     setForm({...form, title: event.title, location: event.location, description: event.description || '', recurrence: event.recurrence || '', allDay: event.all_day, startDate: event.start_at.split('T')[0], startTime: '09:00'}); 
                     setEventDialogOpen(true); 
                   }}><Pencil className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="icon" className="text-red-400" onClick={async () => { await supabase.from('family_events').delete().eq('id', event.id); loadCalendarData(); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))
          }
        </div>
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-2xl font-black">Event Details</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 text-slate-900">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Title</Label>
              <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-12 font-bold" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                 <Label className="text-[10px] font-black uppercase text-slate-500 ml-1">Location</Label>
                 <Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Enter address or place..." className="rounded-xl border-0 bg-slate-100 h-11" />
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
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-xl border-0 bg-slate-100 p-3 text-sm min-h-[80px]" placeholder="Add notes..."></textarea>
            </div>

            <Button onClick={handleSaveEvent} disabled={saving} className="w-full bg-blue-600 text-white rounded-2xl h-14 font-black shadow-lg">
              {saving ? <Loader2 className="animate-spin h-5 w-5" /> : "Save to GarzaHub"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CalendarPage;
