import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const DEV_USER_ID = '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', DEV_USER_ID)
        .order('created_at', { ascending: false });
      setNotifications(data || []);
    };

    fetchNotifications();

    // Listen for new ones
    const subscription = supabase
      .channel('realtime-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchNotifications)
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  return { notifications, count: notifications.filter(n => !n.read).length };
}
