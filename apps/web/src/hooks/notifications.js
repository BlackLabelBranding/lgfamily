import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
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
    fetchNotifications();

    const channel = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${DEV_USER_ID}` 
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount };
}
