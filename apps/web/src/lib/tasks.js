// REPLACE THIS IMPORT WITH THE EXACT SAME ONE USED IN YOUR WORKING family.js
import { supabase } from '@/integrations/supabase/client';

const DEV_HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('household_id', DEV_HOUSEHOLD_ID)
    .limit(25);

  if (error) throw error;
  return data ?? [];
}

export async function addTask() {
  return null;
}

export async function updateTask() {
  return null;
}

export async function toggleTaskComplete() {
  return null;
}

export async function deleteTask() {
  return null;
}
