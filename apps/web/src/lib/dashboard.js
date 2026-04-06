import { supabase } from '@/lib/supabaseClient.js';

const DEV_HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

export async function getDashboardData() {
  let user = null;
  let profile = null;
  let membership = {
    household_id: DEV_HOUSEHOLD_ID,
    role: 'super_admin',
    household: {
      id: DEV_HOUSEHOLD_ID,
      name: 'Garza Family',
      created_at: null,
    },
  };

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (authUser) {
    user = authUser;

    const { data: authProfile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', authUser.id)
      .maybeSingle();

    profile = authProfile ?? null;

    const { data: authMembership } = await supabase
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
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (authMembership) {
      membership = authMembership;
    }
  }

  const { count, error: familyCountError } = await supabase
    .from('family_members')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', membership.household_id);

  if (familyCountError) throw familyCountError;

  return {
    user,
    profile,
    membership,
    stats: {
      familyCount: count ?? 0,
    },
  };
}
