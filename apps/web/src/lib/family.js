import { supabase } from '@/lib/supabaseClient.js';

export async function getCurrentHouseholdId() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) return null;

  const { data, error } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  return data?.household_id ?? null;
}

export async function getFamilyMembers() {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) return [];

  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function addFamilyMember(member) {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) {
    throw new Error('You must be signed in and linked to a household to add members.');
  }

  const payload = {
    household_id: householdId,
    first_name: member.first_name,
    last_name: member.last_name || null,
    display_name: member.display_name || member.first_name,
    relationship: member.relationship || 'family',
    birth_date: member.birth_date || null,
    notes: member.notes || null,
  };

  const { data, error } = await supabase
    .from('family_members')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  return data;
}
