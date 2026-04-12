import { supabase } from './supabaseClient';

export async function getUnreadNotificationsCount() {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('read', false);
  
  if (error) return 0;
  return count;
}

export async function markAllAsRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('read', false);
  
  return !error;
}
