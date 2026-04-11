import { supabase } from '@/lib/supabaseClient.js';

const DEV_HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';
const DEFAULT_TIMEZONE = 'America/Chicago';

function getHouseholdId() {
  return DEV_HOUSEHOLD_ID;
}

function normalizeEvent(row) {
  if (!row) return row;

  return {
    id: row.id,
    household_id: row.household_id,
    title: row.title || '',
    description: row.description || '',
    location: row.location || '',
    start_at: row.start_at,
    end_at: row.end_at,
    all_day: !!row.all_day,
    timezone: row.timezone || DEFAULT_TIMEZONE,
    recurrence: row.recurrence || '',
    status: row.status || 'confirmed',
    source: row.source || 'familyhub',
    google_html_link: row.google_html_link || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeConnection(row) {
  if (!row) return null;

  return {
    id: row.id,
    household_id: row.household_id,
    provider: row.provider || 'google',
    provider_account_email: row.provider_account_email || '',
    provider_calendar_id: row.provider_calendar_id || 'primary',
    access_token: row.access_token || '',
    refresh_token: row.refresh_token || '',
    token_expires_at: row.token_expires_at || null,
    sync_token: row.sync_token || '',
    watch_channel_id: row.watch_channel_id || '',
    watch_resource_id: row.watch_resource_id || '',
    watch_expiration: row.watch_expiration || null,
    is_enabled: !!row.is_enabled,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeSync(row) {
  if (!row) return null;

  return {
    id: row.id,
    family_event_id: row.family_event_id,
    connection_id: row.connection_id,
    provider: row.provider || 'google',
    provider_calendar_id: row.provider_calendar_id || 'primary',
    provider_event_id: row.provider_event_id || '',
    provider_etag: row.provider_etag || '',
    provider_updated_at: row.provider_updated_at || null,
    sync_state: row.sync_state || 'synced',
    last_synced_at: row.last_synced_at || null,
  };
}

function normalizeJob(row) {
  if (!row) return null;

  return {
    id: row.id,
    household_id: row.household_id,
    connection_id: row.connection_id || null,
    direction: row.direction,
    status: row.status,
    message: row.message || '',
    started_at: row.started_at || null,
    finished_at: row.finished_at || null,
    created_at: row.created_at || null,
  };
}

function normalizeEventPayload(payload) {
  return {
    household_id: getHouseholdId(),
    title: String(payload.title || '').trim(),
    description: payload.description ? String(payload.description).trim() : null,
    location: payload.location ? String(payload.location).trim() : null,
    start_at: payload.start_at,
    end_at: payload.end_at,
    all_day: !!payload.all_day,
    timezone: payload.timezone || DEFAULT_TIMEZONE,
    recurrence: payload.recurrence ? String(payload.recurrence).trim() : null,
    status: payload.status || 'confirmed',
    source: payload.source || 'familyhub',
    google_html_link: payload.google_html_link
      ? String(payload.google_html_link).trim()
      : null,
  };
}

/* -------------------- EVENTS -------------------- */

export async function getCalendarEvents(options = {}) {
  const householdId = getHouseholdId();
  const {
    startAt,
    endAt,
    includeCancelled = false,
    orderAscending = true,
  } = options;

  let query = supabase
    .from('family_events')
    .select('*')
    .eq('household_id', householdId);

  if (!includeCancelled) {
    query = query.neq('status', 'cancelled');
  }

  if (startAt) {
    query = query.gte('start_at', startAt);
  }

  if (endAt) {
    query = query.lte('start_at', endAt);
  }

  query = query.order('start_at', { ascending: orderAscending });

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map(normalizeEvent);
}

export async function getCalendarEventById(id) {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('family_events')
    .select('*')
    .eq('household_id', householdId)
    .eq('id', id)
    .single();

  if (error) throw error;
  return normalizeEvent(data);
}

export async function addCalendarEvent(payload) {
  const normalized = normalizeEventPayload(payload);

  const { data, error } = await supabase
    .from('family_events')
    .insert(normalized)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeEvent(data);
}

export async function updateCalendarEvent(id, payload) {
  const updates = {
    ...normalizeEventPayload(payload),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('family_events')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeEvent(data);
}

export async function deleteCalendarEvent(id) {
  const { error } = await supabase.from('family_events').delete().eq('id', id);
  if (error) throw error;
}

export async function setCalendarEventStatus(id, status) {
  const { data, error } = await supabase
    .from('family_events')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeEvent(data);
}

/* -------------------- CONNECTIONS -------------------- */

export async function getCalendarConnections() {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('calendar_connections')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(normalizeConnection);
}

export async function getPrimaryGoogleConnection() {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('calendar_connections')
    .select('*')
    .eq('household_id', householdId)
    .eq('provider', 'google')
    .eq('is_enabled', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return normalizeConnection(data);
}

export async function upsertCalendarConnection(payload) {
  const householdId = getHouseholdId();

  const row = {
    household_id: householdId,
    provider: payload.provider || 'google',
    provider_account_email: payload.provider_account_email || null,
    provider_calendar_id: payload.provider_calendar_id || 'primary',
    access_token: payload.access_token || null,
    refresh_token: payload.refresh_token || null,
    token_expires_at: payload.token_expires_at || null,
    sync_token: payload.sync_token || null,
    watch_channel_id: payload.watch_channel_id || null,
    watch_resource_id: payload.watch_resource_id || null,
    watch_expiration: payload.watch_expiration || null,
    is_enabled:
      typeof payload.is_enabled === 'boolean' ? payload.is_enabled : true,
    updated_at: new Date().toISOString(),
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from('calendar_connections')
      .update(row)
      .eq('id', payload.id)
      .select('*')
      .single();

    if (error) throw error;
    return normalizeConnection(data);
  }

  const { data, error } = await supabase
    .from('calendar_connections')
    .insert(row)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeConnection(data);
}

export async function updateCalendarConnectionTokens(id, payload) {
  const { data, error } = await supabase
    .from('calendar_connections')
    .update({
      access_token: payload.access_token || null,
      refresh_token: payload.refresh_token || null,
      token_expires_at: payload.token_expires_at || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeConnection(data);
}

export async function updateCalendarConnectionSyncState(id, payload) {
  const { data, error } = await supabase
    .from('calendar_connections')
    .update({
      sync_token: payload.sync_token || null,
      watch_channel_id: payload.watch_channel_id || null,
      watch_resource_id: payload.watch_resource_id || null,
      watch_expiration: payload.watch_expiration || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeConnection(data);
}

export async function setCalendarConnectionEnabled(id, isEnabled) {
  const { data, error } = await supabase
    .from('calendar_connections')
    .update({
      is_enabled: !!isEnabled,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeConnection(data);
}

export async function deleteCalendarConnection(id) {
  const { error } = await supabase
    .from('calendar_connections')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* -------------------- EVENT SYNC MAP -------------------- */

export async function getEventSyncByFamilyEventId(familyEventId) {
  const { data, error } = await supabase
    .from('family_event_sync')
    .select('*')
    .eq('family_event_id', familyEventId)
    .order('last_synced_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(normalizeSync);
}

export async function getEventSyncByProviderEventId(
  connectionId,
  providerCalendarId,
  providerEventId
) {
  const { data, error } = await supabase
    .from('family_event_sync')
    .select('*')
    .eq('connection_id', connectionId)
    .eq('provider_calendar_id', providerCalendarId)
    .eq('provider_event_id', providerEventId)
    .maybeSingle();

  if (error) throw error;
  return normalizeSync(data);
}

export async function upsertEventSync(payload) {
  const row = {
    family_event_id: payload.family_event_id,
    connection_id: payload.connection_id,
    provider: payload.provider || 'google',
    provider_calendar_id: payload.provider_calendar_id || 'primary',
    provider_event_id: payload.provider_event_id,
    provider_etag: payload.provider_etag || null,
    provider_updated_at: payload.provider_updated_at || null,
    sync_state: payload.sync_state || 'synced',
    last_synced_at: new Date().toISOString(),
  };

  if (payload.id) {
    const { data, error } = await supabase
      .from('family_event_sync')
      .update(row)
      .eq('id', payload.id)
      .select('*')
      .single();

    if (error) throw error;
    return normalizeSync(data);
  }

  const { data, error } = await supabase
    .from('family_event_sync')
    .upsert(row, {
      onConflict: 'family_event_id,connection_id',
    })
    .select('*')
    .single();

  if (error) throw error;
  return normalizeSync(data);
}

export async function deleteEventSyncByFamilyEventId(familyEventId) {
  const { error } = await supabase
    .from('family_event_sync')
    .delete()
    .eq('family_event_id', familyEventId);

  if (error) throw error;
}

export async function deleteEventSyncById(id) {
  const { error } = await supabase
    .from('family_event_sync')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* -------------------- SYNC JOBS -------------------- */

export async function createCalendarSyncJob(payload) {
  const { data, error } = await supabase
    .from('calendar_sync_jobs')
    .insert({
      household_id: getHouseholdId(),
      connection_id: payload.connection_id || null,
      direction: payload.direction,
      status: payload.status || 'pending',
      message: payload.message || null,
      started_at: payload.started_at || null,
      finished_at: payload.finished_at || null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return normalizeJob(data);
}

export async function updateCalendarSyncJob(id, payload) {
  const { data, error } = await supabase
    .from('calendar_sync_jobs')
    .update({
      status: payload.status,
      message: payload.message || null,
      started_at: payload.started_at || null,
      finished_at: payload.finished_at || null,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return normalizeJob(data);
}

export async function getCalendarSyncJobs(limit = 20) {
  const { data, error } = await supabase
    .from('calendar_sync_jobs')
    .select('*')
    .eq('household_id', getHouseholdId())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(normalizeJob);
}

/* -------------------- WEBHOOK EVENTS -------------------- */

export async function logCalendarWebhookEvent(payload) {
  const { data, error } = await supabase
    .from('calendar_webhook_events')
    .insert({
      connection_id: payload.connection_id || null,
      channel_id: payload.channel_id || null,
      resource_id: payload.resource_id || null,
      resource_state: payload.resource_state || null,
      message_number: payload.message_number || null,
      payload: payload.payload || {},
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/* -------------------- HELPERS FOR UI -------------------- */

export async function getCalendarPageData(options = {}) {
  const [events, connection, jobs] = await Promise.all([
    getCalendarEvents(options),
    getPrimaryGoogleConnection(),
    getCalendarSyncJobs(10),
  ]);

  return {
    events,
    connection,
    jobs,
  };
}

export function toAllDayEventPayload({
  title,
  description = '',
  location = '',
  startDate,
  endDate,
  timezone = DEFAULT_TIMEZONE,
  recurrence = '',
  source = 'familyhub',
}) {
  return {
    title,
    description,
    location,
    start_at: `${startDate}T00:00:00`,
    end_at: `${endDate}T23:59:59`,
    all_day: true,
    timezone,
    recurrence,
    status: 'confirmed',
    source,
  };
}

export function toTimedEventPayload({
  title,
  description = '',
  location = '',
  startAt,
  endAt,
  timezone = DEFAULT_TIMEZONE,
  recurrence = '',
  source = 'familyhub',
}) {
  return {
    title,
    description,
    location,
    start_at: startAt,
    end_at: endAt,
    all_day: false,
    timezone,
    recurrence,
    status: 'confirmed',
    source,
  };
}
