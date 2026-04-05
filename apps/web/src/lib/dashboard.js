import { supabase } from '@/lib/supabaseClient.js';

export async function getDashboardIdentity() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  const { data: membership, error: membershipError } = await supabase
    .from('household_members')
    .select(`
      id,
      role,
      household:households (
        id,
        name,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .maybeSingle();

  if (membershipError) throw membershipError;

  return {
    user,
    profile,
    membership,
  };
}
