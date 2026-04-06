import { supabase } from '@/lib/supabaseClient.js';

const DEV_HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

export async function getCurrentHouseholdId() {
  return DEV_HOUSEHOLD_ID;
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
    throw new Error('No household found. Create a household first.');
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
