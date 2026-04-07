import { supabase } from '@/lib/supabaseClient.js';

const DEV_HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

export async function getCurrentHouseholdId() {
  return DEV_HOUSEHOLD_ID;
}

export async function getTasks() {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('household_id', householdId)
    .order('status', { ascending: true })
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function addTask(task) {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) {
    throw new Error('No household found. Create a household first.');
  }

  const payload = {
    household_id: householdId,
    title: task.title?.trim(),
    notes: task.notes?.trim() || null,
    due_at: task.due_at || null,
    reminder_at: task.reminder_at || null,
    priority: task.priority || 'medium',
    status: task.status || 'open',
    assigned_to: task.assigned_to?.trim() || null,
    completed_at: task.status === 'completed' ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateTask(id, updates) {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) {
    throw new Error('No household found. Create a household first.');
  }

  const payload = {
    ...updates,
    household_id: householdId,
  };

  if (typeof payload.title === 'string') payload.title = payload.title.trim();
  if (typeof payload.notes === 'string') payload.notes = payload.notes.trim() || null;
  if (typeof payload.assigned_to === 'string') payload.assigned_to = payload.assigned_to.trim() || null;

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .eq('household_id', householdId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function toggleTaskComplete(task) {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) {
    throw new Error('No household found. Create a household first.');
  }

  const isCompleting = task.status !== 'completed';

  const { data, error } = await supabase
    .from('tasks')
    .update({
      household_id: householdId,
      status: isCompleting ? 'completed' : 'open',
      completed_at: isCompleting ? new Date().toISOString() : null,
    })
    .eq('id', task.id)
    .eq('household_id', householdId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteTask(id) {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) {
    throw new Error('No household found. Create a household first.');
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) throw error;
}
