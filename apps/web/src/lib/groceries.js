import { supabase } from '@/lib/supabaseClient.js';

const DEV_HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

export async function getCurrentHouseholdId() {
  return DEV_HOUSEHOLD_ID;
}

export async function getGroceryItems() {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) return [];

  const { data, error } = await supabase
    .from('grocery_items')
    .select('*')
    .eq('household_id', householdId)
    .order('list_type', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function addGroceryItem(item) {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) {
    throw new Error('No household found. Create a household first.');
  }

  const payload = {
    household_id: householdId,
    name: item.name?.trim(),
    notes: item.notes?.trim() || null,
    category: item.category?.trim() || null,
    quantity: item.quantity?.trim() || null,
    status: item.status || 'active',
    list_type: item.list_type || 'shopping',
    assigned_to: item.assigned_to || null,
  };

  const { data, error } = await supabase
    .from('grocery_items')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateGroceryItem(id, updates) {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) {
    throw new Error('No household found. Create a household first.');
  }

  const payload = {
    ...updates,
    household_id: householdId,
  };

  if (typeof payload.name === 'string') payload.name = payload.name.trim();
  if (typeof payload.notes === 'string') payload.notes = payload.notes.trim() || null;
  if (typeof payload.category === 'string') payload.category = payload.category.trim() || null;
  if (typeof payload.quantity === 'string') payload.quantity = payload.quantity.trim() || null;

  const { data, error } = await supabase
    .from('grocery_items')
    .update(payload)
    .eq('id', id)
    .eq('household_id', householdId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function toggleGroceryItemStatus(item) {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) {
    throw new Error('No household found. Create a household first.');
  }

  const nextStatus = item.status === 'done' ? 'active' : 'done';

  const { data, error } = await supabase
    .from('grocery_items')
    .update({
      household_id: householdId,
      status: nextStatus,
    })
    .eq('id', item.id)
    .eq('household_id', householdId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteGroceryItem(id) {
  const householdId = await getCurrentHouseholdId();

  if (!householdId) {
    throw new Error('No household found. Create a household first.');
  }

  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('id', id)
    .eq('household_id', householdId);

  if (error) throw error;
}
