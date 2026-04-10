import { supabase } from '@/lib/supabaseClient.js';

const DEV_HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

function getHouseholdId() {
  return DEV_HOUSEHOLD_ID;
}

/* -------------------- CONTACTS -------------------- */

export async function getEmergencyContacts() {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_contacts')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addEmergencyContact(payload) {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_contacts')
    .insert({
      household_id: householdId,
      name: payload.name,
      relationship: payload.relationship || null,
      phone: payload.phone || null,
      email: payload.email || null,
      address: payload.address || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEmergencyContact(id, payload) {
  const { data, error } = await supabase
    .from('emergency_contacts')
    .update({
      name: payload.name,
      relationship: payload.relationship || null,
      phone: payload.phone || null,
      email: payload.email || null,
      address: payload.address || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEmergencyContact(id) {
  const { error } = await supabase
    .from('emergency_contacts')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* -------------------- DOCTORS -------------------- */

export async function getEmergencyDoctors() {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_doctors')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addEmergencyDoctor(payload) {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_doctors')
    .insert({
      household_id: householdId,
      name: payload.name,
      specialty: payload.specialty || null,
      phone: payload.phone || null,
      address: payload.address || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEmergencyDoctor(id, payload) {
  const { data, error } = await supabase
    .from('emergency_doctors')
    .update({
      name: payload.name,
      specialty: payload.specialty || null,
      phone: payload.phone || null,
      address: payload.address || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEmergencyDoctor(id) {
  const { error } = await supabase
    .from('emergency_doctors')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* -------------------- MEDICATIONS -------------------- */

export async function getEmergencyMedications() {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_medications')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addEmergencyMedication(payload) {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_medications')
    .insert({
      household_id: householdId,
      name: payload.name,
      person: payload.person || null,
      dosage: payload.dosage || null,
      prescriber: payload.prescriber || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEmergencyMedication(id, payload) {
  const { data, error } = await supabase
    .from('emergency_medications')
    .update({
      name: payload.name,
      person: payload.person || null,
      dosage: payload.dosage || null,
      prescriber: payload.prescriber || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEmergencyMedication(id) {
  const { error } = await supabase
    .from('emergency_medications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* -------------------- INSURANCE -------------------- */

export async function getEmergencyInsuranceCards() {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_insurance_cards')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    ...item,
    policyNumber: item.policy_number ?? '',
    groupNumber: item.group_number ?? '',
  }));
}

export async function addEmergencyInsuranceCard(payload) {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_insurance_cards')
    .insert({
      household_id: householdId,
      type: payload.type,
      provider: payload.provider || null,
      policy_number: payload.policyNumber || null,
      group_number: payload.groupNumber || null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    policyNumber: data.policy_number ?? '',
    groupNumber: data.group_number ?? '',
  };
}

export async function updateEmergencyInsuranceCard(id, payload) {
  const { data, error } = await supabase
    .from('emergency_insurance_cards')
    .update({
      type: payload.type,
      provider: payload.provider || null,
      policy_number: payload.policyNumber || null,
      group_number: payload.groupNumber || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    policyNumber: data.policy_number ?? '',
    groupNumber: data.group_number ?? '',
  };
}

export async function deleteEmergencyInsuranceCard(id) {
  const { error } = await supabase
    .from('emergency_insurance_cards')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* -------------------- LEGAL -------------------- */

export async function getEmergencyLegalDirectives() {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_legal_directives')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((item) => ({
    ...item,
    lastUpdated: item.last_updated ?? '',
  }));
}

export async function addEmergencyLegalDirective(payload) {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_legal_directives')
    .insert({
      household_id: householdId,
      title: payload.title,
      status: payload.status || 'Current',
      last_updated: payload.lastUpdated || null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    lastUpdated: data.last_updated ?? '',
  };
}

export async function updateEmergencyLegalDirective(id, payload) {
  const { data, error } = await supabase
    .from('emergency_legal_directives')
    .update({
      title: payload.title,
      status: payload.status || 'Current',
      last_updated: payload.lastUpdated || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    lastUpdated: data.last_updated ?? '',
  };
}

export async function deleteEmergencyLegalDirective(id) {
  const { error } = await supabase
    .from('emergency_legal_directives')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* -------------------- CHECKLIST -------------------- */

export async function getEmergencyChecklistItems() {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_checklist_items')
    .select('*')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function addEmergencyChecklistItem(payload) {
  const householdId = getHouseholdId();

  const { data, error } = await supabase
    .from('emergency_checklist_items')
    .insert({
      household_id: householdId,
      item: payload.item,
      checked: !!payload.checked,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEmergencyChecklistItem(id, payload) {
  const { data, error } = await supabase
    .from('emergency_checklist_items')
    .update({
      item: payload.item,
      checked: !!payload.checked,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleEmergencyChecklistItem(id, currentChecked) {
  const { data, error } = await supabase
    .from('emergency_checklist_items')
    .update({
      checked: !currentChecked,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEmergencyChecklistItem(id) {
  const { error } = await supabase
    .from('emergency_checklist_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* -------------------- DASHBOARD LOAD -------------------- */

export async function getEmergencyData() {
  const [
    contacts,
    doctors,
    medications,
    insuranceCards,
    legalDirectives,
    checklistItems,
  ] = await Promise.all([
    getEmergencyContacts(),
    getEmergencyDoctors(),
    getEmergencyMedications(),
    getEmergencyInsuranceCards(),
    getEmergencyLegalDirectives(),
    getEmergencyChecklistItems(),
  ]);

  return {
    contacts,
    doctors,
    medications,
    insuranceCards,
    legalDirectives,
    checklistItems,
  };
}
