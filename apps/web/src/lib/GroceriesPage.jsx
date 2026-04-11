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
  Users,
  User,
  Eye,
} from 'lucide-react';
import {
  getCalendarPageData,
  addCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEventById,
  toAllDayEventPayload,
  toTimedEventPayload,
  isValidSyncScopeForVisibility,
} from '@/lib/calendar.js';

const DEV_USER_ID = 'dev-user-lance';

const AVAILABLE_USERS = [
  { id: 'dev-user-lance', name: 'Lance' },
  { id: 'dev-user-shelby', name: 'Shelby' },
  { id: 'dev-user-zander', name: 'Zander' },
  { id: 'dev-user-kasper', name: 'Kasper' },
  { id: 'dev-user-pam', name: 'Pam' },
];

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
  visibility: 'household',
  syncScope: 'creator_only',
  audienceUserIds: [],
};

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [connection, setConnection] = useState(null);
  const [jobs, setJobs] = useState([]);

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

  useEffect(() => {
    if (!isValidSyncScopeForVisibility(form.visibility, form.syncScope)) {
      if (form.visibility === 'private') {
        setForm((prev) => ({
          ...prev,
          syncScope: 'creator_only',
          audienceUserIds: [],
        }));
      } else if (form.visibility === 'selected_members') {
        setForm((prev) => ({
          ...prev,
          syncScope:
            prev.syncScope === 'all_connected_users' ? 'selected_users' : prev.syncScope,
        }));
      }
    }
  }, [form.visibility, form.syncScope]);

  async function loadCalendarData() {
    setLoading(true);
    setErrorText('');

    try {
      const now = new Date();
      const startAt = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endAt = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59).toISOString();

      const data = await getCalendarPageData({
        startAt,
        endAt,
        onlyVisibleToCurrentUser: true,
        userId: DEV_USER_ID,
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
    const startDate = formatDateForInput(now);
    const endDate = formatDateForInput(now);

    setForm((prev) => ({
      ...prev,
      startDate,
      endDate,
      startTime: '09:00',
      endTime: '10:00',
      visibility: 'household',
      syncScope: 'creator_only',
      audienceUserIds: [],
    }));

    setEventDialogOpen(true);
  }

  async function openEditDialog(event) {
    try {
      const fullEvent = await getCalendarEventById(event.id);
      setEditingEvent(fullEvent);

      const start = new Date(fullEvent.start_at);
      const end = new Date(fullEvent.end_at);

      setForm({
        title: fullEvent.title || '',
        description: fullEvent.description || '',
        location: fullEvent.location || '',
        startDate: formatDateForInput(start),
        endDate: formatDateForInput(end),
        startTime: fullEvent.all_day ? '' : formatTimeForInput(start),
        endTime: fullEvent.all_day ? '' : formatTimeForInput(end),
        allDay: !!fullEvent.all_day,
        timezone: fullEvent.timezone || 'America/Chicago',
        recurrence: fullEvent.recurrence || '',
        visibility: fullEvent.visibility || 'household',
        syncScope: fullEvent.sync_scope || 'creator_only',
        audienceUserIds: fullEvent.audience_user_ids || [],
      });

      setEventDialogOpen(true);
    } catch (error) {
      console.error('Failed to load event details:', error);
      setErrorText(error?.message || 'Failed to load event details.');
    }
  }

  function openDeleteDialog(event) {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function toggleAudienceUser(userId) {
    setForm((prev) => {
      const exists = prev.audienceUserIds.includes(userId);
      return {
        ...prev,
        audienceUserIds: exists
          ? prev.audienceUserIds.filter((id) => id !== userId)
          : [...prev.audienceUserIds, userId],
      };
    });
  }

  function shouldShowAudiencePicker() {
    return (
      form.visibility === 'selected_members' ||
      form.syncScope === 'selected_users'
    );
  }

  function getAllowedSyncOptions() {
    if (form.visibility === 'private') {
      return [
        { value: 'none', label: 'Do not sync to Google' },
        { value: 'creator_only', label: 'Sync to me only' },
      ];
    }

    if (form.visibility === 'selected_members') {
      return [
        { value: 'none', label: 'Do not sync to Google' },
        { value: 'creator_only', label: 'Sync to me only' },
        { value: 'selected_users', label: 'Sync to selected people' },
      ];
    }

    return [
      { value: 'none', label: 'Do not sync to Google' },
      { value: 'creator_only', label: 'Sync to me only' },
      { value: 'selected_users', label: 'Sync to selected people' },
      { value: 'all_connected_users', label: 'Sync to all connected calendars' },
    ];
  }

  async function handleSaveEvent(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!form.startDate || !form.endDate) return;
    if (!form.allDay && (!form.startTime || !form.endTime)) return;

    if (!isValidSyncScopeForVisibility(form.visibility, form.syncScope)) {
      setErrorText('That Google sync option is not allowed for the selected visibility.');
      return;
    }

    if (
      (form.visibility === 'selected_members' || form.syncScope === 'selected_users') &&
      form.audienceUserIds.length === 0
    ) {
      setErrorText('Please select at least one person.');
      return;
    }

    setSaving(true);
    setErrorText('');
    setSuccessText('');

    try {
      let payloadBase = {
        created_by_user_id: DEV_USER_ID,
        visibility: form.visibility,
        sync_scope: form.syncScope,
        audience_user_ids: form.audienceUserIds,
      };

      let payload;

      if (form.allDay) {
        payload = toAllDayEventPayload({
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          timezone: form.timezone,
          recurrence: form.recurrence.trim(),
          ...payloadBase,
        });
      } else {
        payload = toTimedEventPayload({
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          startAt: `${form.startDate}T${form.startTime}:00`,
          endAt: `${form.endDate}T${form.endTime}:00`,
          timezone: form.timezone,
          recurrence: form.recurrence.trim(),
          ...payloadBase,
        });
      }

      if (editingEvent?.id) {
        await updateCalendarEvent(editingEvent.id, payload);
        setSuccessText('Event updated.');
      } else {
        await addCalendarEvent(payload);
        setSuccessText('Event added.');
      }

      setEventDialogOpen(false);
      resetForm();
      await loadCalendarData();
    } catch (error) {
      console.error('Failed to save event:', error);
      setErrorText(error?.message || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (!eventToDelete) return;

    setSaving(true);
    setErrorText('');
    setSuccessText('');

    try {
      await deleteCalendarEvent(eventToDelete.id);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      setSuccessText('Event deleted.');
      await loadCalendarData();
    } catch (error) {
      console.error('Failed to delete event:', error);
      setErrorText(error?.message || 'Failed to delete event.');
    } finally {
      setSaving(false);
    }
  }

  function handleGoogleConnect() {
    setSuccessText('');
    setErrorText(
      'Google Calendar auth is the next step. We still need to build the OAuth + sync function endpoints.'
    );
  }

  function handleGoogleSync() {
    setSuccessText('');
    setErrorText(
      'Manual Google sync is not wired yet. Next we’ll build the backend sync function and callback flow.'
    );
  }

  return (
    <>
      <Helmet>
        <title>Calendar - FamilyHub</title>
        <meta
          name="description"
          content="Family events with shared and personal calendar controls"
        />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              Manage shared and personal events, with Google sync controls.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2 rounded-xl" onClick={handleGoogleConnect}>
              {connection?.is_enabled ? <Unlink className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
              {connection?.is_enabled ? 'Google linked' : 'Connect Google'}
            </Button>

            <Button variant="outline" className="gap-2 rounded-xl" onClick={handleGoogleSync}>
              <RefreshCw className="h-4 w-4" />
              Sync
            </Button>

            <Button className="gap-2 rounded-xl shadow-sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4" />
              Add event
            </Button>
          </div>
        </div>

        {(errorText || successText) && (
          <div className="space-y-2">
            {errorText ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorText}
              </div>
            ) : null}
            {successText ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {successText}
              </div>
            ) : null}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total Events" value={stats.total} />
          <StatCard label="Today" value={stats.today} />
          <StatCard label="This Week" value={stats.thisWeek} />
          <StatCard
            label="Google Status"
            value={stats.connected}
            valueClassName={connection?.is_enabled ? 'text-emerald-600' : 'text-slate-900'}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Upcoming events
              </CardTitle>

              <Button variant="outline" size="sm" className="rounded-xl" onClick={loadCalendarData}>
                Refresh
              </Button>
            </CardHeader>

            <CardContent>
              {loading ? (
                <LoadingBlock text="Loading events..." />
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
                <EmptyState
                  title="No upcoming events"
                  description="Create your first event to get started."
                  actionLabel="Add event"
                  onAction={openAddDialog}
                />
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Google connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={connection?.is_enabled ? 'secondary' : 'outline'}>
                    {connection?.is_enabled ? 'Connected' : 'Not connected'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Account</span>
                  <span className="text-sm font-medium">
                    {connection?.provider_account_email || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Calendar</span>
                  <span className="text-sm font-medium">
                    {connection?.provider_calendar_id || 'primary'}
                  </span>
                </div>

                <p className="pt-2 text-xs text-muted-foreground">
                  OAuth and true two-way Google sync are the next backend step.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Recent sync jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length ? (
                  <div className="space-y-3">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="rounded-xl border bg-muted/30 p-3"
                      >
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <p className="text-sm font-medium">{job.direction}</p>
                          <Badge variant="outline" className="text-xs">
                            {job.status}
                          </Badge>
                        </div>
                        {job.message ? (
                          <p className="mb-1 text-xs text-muted-foreground">{job.message}</p>
                        ) : null}
                        <p className="text-xs text-muted-foreground">
                          {job.created_at
                            ? new Date(job.created_at).toLocaleString()
                            : 'Unknown time'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No sync jobs yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Recent past events</CardTitle>
              </CardHeader>
              <CardContent>
                {pastEvents.length ? (
                  <div className="space-y-3">
                    {pastEvents.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-xl border bg-muted/30 p-3"
                      >
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatEventDateRange(event)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No past events yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog
        open={eventDialogOpen}
        onOpenChange={(open) => {
          setEventDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit event' : 'Add event'}</DialogTitle>
            <DialogDescription>
              Create a shared or personal FamilyHub calendar event.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEvent} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" required>
                <InputLike
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Event title"
                />
              </Field>

              <Field label="Timezone">
                <select
                  value={form.timezone}
                  onChange={(e) => handleFormChange('timezone', e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Add details about this event"
                className="min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Location">
                <InputLike
                  value={form.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  placeholder="Location"
                />
              </Field>

              <Field label="Recurrence">
                <InputLike
                  value={form.recurrence}
                  onChange={(e) => handleFormChange('recurrence', e.target.value)}
                  placeholder="Optional RRULE later"
                />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-sm font-medium">All-day event</p>
                <p className="text-xs text-muted-foreground">
                  Use dates only instead of times.
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.allDay}
                onChange={(e) => handleFormChange('allDay', e.target.checked)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Start date" required>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </Field>

              <Field label="End date" required>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleFormChange('endDate', e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                />
              </Field>
            </div>

            {!form.allDay ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Start time" required>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => handleFormChange('startTime', e.target.value)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  />
                </Field>

                <Field label="End time" required>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => handleFormChange('endTime', e.target.value)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  />
                </Field>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Visibility">
                <select
                  value={form.visibility}
                  onChange={(e) => handleFormChange('visibility', e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="household">Everyone in household</option>
                  <option value="selected_members">Only selected people</option>
                  <option value="private">Private</option>
                </select>
              </Field>

              <Field label="Google sync">
                <select
                  value={form.syncScope}
                  onChange={(e) => handleFormChange('syncScope', e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {getAllowedSyncOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {shouldShowAudiencePicker() ? (
              <Field label="Selected people">
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_USERS.map((user) => {
                    const active = form.audienceUserIds.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleAudienceUser(user.id)}
                        className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs transition ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-foreground'
                        }`}
                      >
                        {user.name}
                      </button>
                    );
                  })}
                </div>
                <p className="pt-1 text-xs text-muted-foreground">
                  For selected visibility or selected Google sync, choose at least one person.
                </p>
              </Field>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEventDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : editingEvent ? (
                  'Save changes'
                ) : (
                  'Add event'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete this event from FamilyHub.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border bg-muted/40 p-3 text-sm">
            {eventToDelete?.title || 'Selected event'}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setEventToDelete(null);
              }}
            >
              Cancel
            </Button>

            <Button type="button" variant="destructive" onClick={handleDeleteConfirmed} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EventRow({ event, onEdit, onDelete }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{event.title}</h3>

            <Badge variant="secondary" className="text-xs">
              {event.all_day ? 'All day' : 'Timed'}
            </Badge>

            <Badge variant="outline" className="text-xs">
              {event.visibility === 'household'
                ? 'Household'
                : event.visibility === 'selected_members'
                ? 'Selected'
                : 'Private'}
            </Badge>

            <Badge variant="outline" className="text-xs">
              {event.sync_scope === 'none'
                ? 'No Google sync'
                : event.sync_scope === 'creator_only'
                ? 'Sync: Me'
                : event.sync_scope === 'selected_users'
                ? 'Sync: Selected'
                : 'Sync: All'}
            </Badge>
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock3 className="h-3.5 w-3.5" />
              <span>{formatEventDateRange(event)}</span>
            </div>

            {event.location ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{event.location}</span>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              {event.visibility === 'private' ? (
                <Eye className="h-3.5 w-3.5" />
              ) : event.visibility === 'selected_members' ? (
                <Users className="h-3.5 w-3.5" />
              ) : (
                <Users className="h-3.5 w-3.5" />
              )}
              <span>
                {event.visibility === 'household'
                  ? 'Visible to household'
                  : event.visibility === 'selected_members'
                  ? 'Visible to selected people'
                  : 'Private event'}
              </span>
            </div>

            {event.description ? (
              <p className="pt-1 text-sm text-muted-foreground">{event.description}</p>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={onEdit}>
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, valueClassName = 'text-slate-900' }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-semibold ${valueClassName}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function Field({ label, required = false, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function InputLike({ value, onChange, placeholder }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
    />
  );
}

function LoadingBlock({ text }) {
  return <div className="text-sm text-muted-foreground">{text}</div>;
}

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <Card className="rounded-2xl border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <CalendarDays className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 max-w-md text-sm text-muted-foreground">{description}</p>
        {actionLabel && onAction ? (
          <Button className="rounded-xl" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function formatDateForInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTimeForInput(date) {
  const d = new Date(date);
  const hours = `${d.getHours()}`.padStart(2, '0');
  const minutes = `${d.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatEventDateRange(event) {
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);

  if (event.all_day) {
    return `${start.toLocaleDateString()}${sameDay(start, end) ? '' : ` - ${end.toLocaleDateString()}`}`;
  }

  const same = sameDay(start, end);

  if (same) {
    return `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })} - ${end.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }

  return `${start.toLocaleString()} - ${end.toLocaleString()}`;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default CalendarPage;
