import { supabase } from '@/lib/supabaseClient.js';

// --- CONFIGURATION ---
// Ensure this ID matches your household table
const DEV_HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';
const DEFAULT_TIMEZONE = 'America/Chicago';

// FIXED: Changed from "dev-user-lance" to a valid UUID format to stop the Postgres Error
const DEV_USER_ID = '00000000-0000-0000-0000-000000000000'; 

function getHouseholdId() {
  return DEV_HOUSEHOLD_ID;
}

function getCurrentUserId() {
  return DEV_USER_ID;
}

/* -------------------- NORMALIZERS -------------------- */

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
    created_by_user_id: row.created_by_user_id || '',
    visibility: row.visibility || 'household',
    sync_scope: row.sync_scope || 'creator_only',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeConnection(row) {
  if (!row) return null;
  return {
    id: row.id,
    household_id: row.household_id,
    user_id: row.user_id || '',
    provider: row.provider || 'google',
    provider_account_email: row.provider_account_email || '',
    provider_calendar_id: row.provider_calendar_id || 'primary',
    is_enabled: !!row.is_enabled,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeJob(row) {
  if (!row) return null;
  return {
    id: row.id,
    household_id: row.household_id,
    direction: row.direction,
    status: row.status,
    message: row.message || '',
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
    created_by_user_id: payload.created_by_user_id || getCurrentUserId(),
    visibility: payload.visibility || 'household',
    sync_scope: payload.sync_scope || 'creator_only',
  };
}

/* -------------------- EVENTS -------------------- */

export async function getCalendarEvents(options = {}) {
  const householdId = getHouseholdId();
  const { startAt, endAt, includeCancelled = false } = options;

  let query = supabase.from('family_events').select('*').eq('household_id', householdId);

  if (!includeCancelled) query = query.neq('status', 'cancelled');
  if (startAt) query = query.gte('start_at', startAt);
  if (endAt) query = query.lte('start_at', endAt);

  const { data, error } = await query.order('start_at', { ascending: true });
  if (error) throw error;

  return (data || []).map(normalizeEvent);
}

export async function addCalendarEvent(payload) {
  const normalized = normalizeEventPayload(payload);
  const { data, error } = await supabase.from('family_events').insert(normalized).select('*').single();
  if (error) throw error;
  return normalizeEvent(data);
}

export async function updateCalendarEvent(id, payload) {
  const updates = { ...normalizeEventPayload(payload), updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from('family_events').update(updates).eq('id', id).select('*').single();
  if (error) throw error;
  return normalizeEvent(data);
}

export async function deleteCalendarEvent(id) {
  const { error } = await supabase.from('family_events').delete().eq('id', id);
  if (error) throw error;
}

/* -------------------- CONNECTIONS (SHARED MODEL) -------------------- */

/**
 * FIXED: Fetches the primary household connection regardless of which user is logged in.
 * This ensures the "Google Status" card reflects the family's shared calendar state.
 */
export async function getPrimaryGoogleConnection() {
  const householdId = getHouseholdId();
  const { data, error } = await supabase
    .from('calendar_connections')
    .select('*')
    .eq('household_id', householdId)
    .eq('provider', 'google')
    .eq('is_enabled', true)
    .maybeSingle();

  if (error) throw error;
  return normalizeConnection(data);
}

/* -------------------- SYNC JOBS -------------------- */

export async function getCalendarSyncJobs(limit = 10) {
  const { data, error } = await supabase
    .from('calendar_sync_jobs')
    .select('*')
    .eq('household_id', getHouseholdId())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(normalizeJob);
}

/* -------------------- DATA LOADER -------------------- */

export async function getCalendarPageData(options = {}) {
  const [events, connection, jobs] = await Promise.all([
    getCalendarEvents(options),
    getPrimaryGoogleConnection(),
    getCalendarSyncJobs(10),
  ]);

  return { events, connection, jobs };
}

/* -------------------- PAYLOAD HELPERS -------------------- */

export function toAllDayEventPayload(data) {
  return {
    ...data,
    start_at: `${data.startDate}T00:00:00`,
    end_at: `${data.endDate}T23:59:59`,
    all_day: true,
  };
}

export function toTimedEventPayload(data) {
  return {
    ...data,
    all_day: false,
  };
}
