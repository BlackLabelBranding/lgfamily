import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient.js';

/**
 * This Hook connects your UI to the Supabase 'notifications' table.
 * It handles the initial load and the Realtime "listening" for new alerts.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  // Matching your DEV_USER_ID from calendar.js
  const DEV_USER_ID = '00000000-0000-0000-0000-000000000000';

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', DEV_USER_ID)
      .order('created_at', { ascending: false })
      .limit(5);
    setNotifications(data || []);
  };

  useEffect(() => {
    // 1. Get existing notifications on load
    fetchNotifications();

    // 2. Setup Realtime subscription for your dev user
    const channel = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${DEV_USER_ID}` 
      }, () => {
        // Refresh the list whenever a change happens in the DB
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount };
}
