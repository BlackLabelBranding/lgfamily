import { supabase } from '@/lib/supabaseClient.js';
import { getFamilyMembers } from '@/lib/family.js';

const DEV_HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

function getHouseholdId() {
  return DEV_HOUSEHOLD_ID;
}

async function ensureDefaults() {
  const householdId = getHouseholdId();

  const [
    settingsRes,
    permissionsRes,
    notificationsRes,
    backupsRes,
    integrationsRes,
  ] = await Promise.all([
    supabase
      .from('household_settings')
      .select('*')
      .eq('household_id', householdId)
      .maybeSingle(),
    supabase
      .from('household_permissions')
      .select('*')
      .eq('household_id', householdId)
      .maybeSingle(),
    supabase
      .from('household_notifications')
      .select('*')
      .eq('household_id', householdId)
      .maybeSingle(),
    supabase
      .from('household_backups')
      .select('*')
      .eq('household_id', householdId)
      .maybeSingle(),
    supabase
      .from('household_integrations')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true }),
  ]);

  if (settingsRes.error) throw settingsRes.error;
  if (permissionsRes.error) throw permissionsRes.error;
  if (notificationsRes.error) throw notificationsRes.error;
  if (backupsRes.error) throw backupsRes.error;
  if (integrationsRes.error) throw integrationsRes.error;

  if (!settingsRes.data) {
    const { error } = await supabase.from('household_settings').insert({
      household_id: householdId,
      household_name: 'FamilyHub',
      timezone: 'America/Chicago',
      address: '',
    });
    if (error) throw error;
  }

  if (!permissionsRes.data) {
    const { error } = await supabase.from('household_permissions').insert({
      household_id: householdId,
      allow_event_creation: true,
      allow_task_creation: true,
      require_vault_approval: true,
      allow_photo_uploads: true,
    });
    if (error) throw error;
  }

  if (!notificationsRes.data) {
    const { error } = await supabase.from('household_notifications').insert({
      household_id: householdId,
      email_notifications: true,
      calendar_reminders: true,
      task_due_alerts: true,
      document_expiration_warnings: true,
    });
    if (error) throw error;
  }

  if (!backupsRes.data) {
    const { error } = await supabase.from('household_backups').insert({
      household_id: householdId,
      automatic_backups: true,
      backup_frequency: 'daily',
      last_backup_at: null,
    });
    if (error) throw error;
  }

  if (!integrationsRes.data || integrationsRes.data.length === 0) {
    const { error } = await supabase.from('household_integrations').insert([
      { household_id: householdId, name: 'Google Calendar', connected: false },
      { household_id: householdId, name: 'Dropbox', connected: false },
      { household_id: householdId, name: 'iCloud Photos', connected: false },
    ]);
    if (error) throw error;
  }
}

export async function getSettingsData() {
  const householdId = getHouseholdId();
  await ensureDefaults();

  const [
    householdRes,
    permissionsRes,
    notificationsRes,
    backupsRes,
    integrationsRes,
    auditRes,
    familyMembers,
  ] = await Promise.all([
    supabase
      .from('household_settings')
      .select('*')
      .eq('household_id', householdId)
      .single(),
    supabase
      .from('household_permissions')
      .select('*')
      .eq('household_id', householdId)
      .single(),
    supabase
      .from('household_notifications')
      .select('*')
      .eq('household_id', householdId)
      .single(),
    supabase
      .from('household_backups')
      .select('*')
      .eq('household_id', householdId)
      .single(),
    supabase
      .from('household_integrations')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true }),
    supabase
      .from('household_audit_logs')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })
      .limit(20),
    getFamilyMembers(),
  ]);

  if (householdRes.error) throw householdRes.error;
  if (permissionsRes.error) throw permissionsRes.error;
  if (notificationsRes.error) throw notificationsRes.error;
  if (backupsRes.error) throw backupsRes.error;
  if (integrationsRes.error) throw integrationsRes.error;
  if (auditRes.error) throw auditRes.error;

  const roles = (familyMembers || []).map((member) => ({
    id: member.id,
    name: member.display_name || member.first_name || member.name || 'Unnamed',
    email: member.email || '',
    role: member.role || 'Member',
  }));

  return {
    household: {
      householdName: householdRes.data.household_name || 'FamilyHub',
      timezone: householdRes.data.timezone || 'America/Chicago',
      address: householdRes.data.address || '',
    },
    permissions: {
      allowEventCreation: !!permissionsRes.data.allow_event_creation,
      allowTaskCreation: !!permissionsRes.data.allow_task_creation,
      requireVaultApproval: !!permissionsRes.data.require_vault_approval,
      allowPhotoUploads: !!permissionsRes.data.allow_photo_uploads,
    },
    notifications: {
      emailNotifications: !!notificationsRes.data.email_notifications,
      calendarReminders: !!notificationsRes.data.calendar_reminders,
      taskDueAlerts: !!notificationsRes.data.task_due_alerts,
      documentExpirationWarnings:
        !!notificationsRes.data.document_expiration_warnings,
    },
    backups: {
      automaticBackups: !!backupsRes.data.automatic_backups,
      backupFrequency: backupsRes.data.backup_frequency || 'daily',
      lastBackupAt: backupsRes.data.last_backup_at || null,
    },
    integrations: integrationsRes.data || [],
    auditLogs: (auditRes.data || []).map((log) => ({
      id: log.id,
      action: log.action,
      user: log.user_name || 'System',
      details: log.details || '',
      timestamp: log.created_at,
    })),
    roles,
  };
}

export async function updateHouseholdSettings(payload) {
  const householdId = getHouseholdId();
  const { data, error } = await supabase
    .from('household_settings')
    .update({
      household_name: payload.householdName,
      timezone: payload.timezone,
      address: payload.address,
      updated_at: new Date().toISOString(),
    })
    .eq('household_id', householdId)
    .select()
    .single();

  if (error) throw error;
  await addAuditLog('Settings updated', 'System', 'Household settings changed');
  return data;
}

export async function updatePermissionsSettings(payload) {
  const householdId = getHouseholdId();
  const { data, error } = await supabase
    .from('household_permissions')
    .update({
      allow_event_creation: !!payload.allowEventCreation,
      allow_task_creation: !!payload.allowTaskCreation,
      require_vault_approval: !!payload.requireVaultApproval,
      allow_photo_uploads: !!payload.allowPhotoUploads,
      updated_at: new Date().toISOString(),
    })
    .eq('household_id', householdId)
    .select()
    .single();

  if (error) throw error;
  await addAuditLog('Permissions updated', 'System', 'Permission settings changed');
  return data;
}

export async function updateNotificationSettings(payload) {
  const householdId = getHouseholdId();
  const { data, error } = await supabase
    .from('household_notifications')
    .update({
      email_notifications: !!payload.emailNotifications,
      calendar_reminders: !!payload.calendarReminders,
      task_due_alerts: !!payload.taskDueAlerts,
      document_expiration_warnings: !!payload.documentExpirationWarnings,
      updated_at: new Date().toISOString(),
    })
    .eq('household_id', householdId)
    .select()
    .single();

  if (error) throw error;
  await addAuditLog('Notifications updated', 'System', 'Notification settings changed');
  return data;
}

export async function updateBackupSettings(payload) {
  const householdId = getHouseholdId();
  const { data, error } = await supabase
    .from('household_backups')
    .update({
      automatic_backups: !!payload.automaticBackups,
      backup_frequency: payload.backupFrequency,
      updated_at: new Date().toISOString(),
    })
    .eq('household_id', householdId)
    .select()
    .single();

  if (error) throw error;
  await addAuditLog('Backup settings updated', 'System', 'Backup settings changed');
  return data;
}

export async function runBackupNow() {
  const householdId = getHouseholdId();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('household_backups')
    .update({
      last_backup_at: now,
      updated_at: now,
    })
    .eq('household_id', householdId)
    .select()
    .single();

  if (error) throw error;
  await addAuditLog('Backup created', 'System', 'Manual backup triggered');
  return data;
}

export async function toggleIntegration(id, connected) {
  const { data, error } = await supabase
    .from('household_integrations')
    .update({
      connected: !connected,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await addAuditLog(
    !connected ? 'Integration connected' : 'Integration disconnected',
    'System',
    data.name
  );
  return data;
}

export async function addAuditLog(action, userName, details) {
  const householdId = getHouseholdId();
  const { error } = await supabase.from('household_audit_logs').insert({
    household_id: householdId,
    action,
    user_name: userName || 'System',
    details: details || '',
  });

  if (error) throw error;
}
