import { supabase } from '@/lib/supabaseClient.js';

export async function getDashboardData() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    return {
      user: null,
      profile: null,
      membership: null,
      stats: {
        familyCount: 0,
      },
    };
  }

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
      household_id,
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

  let familyCount = 0;

  if (membership?.household_id) {
    const { count, error: familyCountError } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', membership.household_id);

    if (familyCountError) throw familyCountError;
    familyCount = count ?? 0;
  }

  return {
    user,
    profile,
    membership,
    stats: {
      familyCount,
    },
  };
}
