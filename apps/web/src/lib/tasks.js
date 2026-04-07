import { supabase } from './supabase';

export async function getTasks() {
  const { data, error } = await supabase.from('tasks').select('*').limit(1);
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
