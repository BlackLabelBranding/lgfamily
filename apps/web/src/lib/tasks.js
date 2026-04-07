import { supabase } from '@/lib/supabase';

const DEV_HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('household_id', DEV_HOUSEHOLD_ID)
    .order('status', { ascending: true })
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addTask(task) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([
      {
        household_id: DEV_HOUSEHOLD_ID,
        title: task.title?.trim(),
        notes: task.notes?.trim() || null,
        due_at: task.due_at || null,
        reminder_at: task.reminder_at || null,
        priority: task.priority || 'medium',
        status: 'open',
        assigned_to: task.assigned_to?.trim() || null,
        completed_at: null,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      household_id: DEV_HOUSEHOLD_ID,
    })
    .eq('id', id)
    .eq('household_id', DEV_HOUSEHOLD_ID)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleTaskComplete(task) {
  const isCompleting = task.status !== 'completed';

  const { data, error } = await supabase
    .from('tasks')
    .update({
      household_id: DEV_HOUSEHOLD_ID,
      status: isCompleting ? 'completed' : 'open',
      completed_at: isCompleting ? new Date().toISOString() : null,
    })
    .eq('id', task.id)
    .eq('household_id', DEV_HOUSEHOLD_ID)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('household_id', DEV_HOUSEHOLD_ID);

  if (error) throw error;
}
