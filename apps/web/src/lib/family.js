import { supabase } from '@/lib/supabaseClient.js';

export async function getFamilyMembers() {
  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}
