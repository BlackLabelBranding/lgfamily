import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Database,
  FileText,
  Loader2,
  Plug,
  Users,
} from 'lucide-react';
import {
  getSettingsData,
  updateHouseholdSettings,
  updatePermissionsSettings,
  updateNotificationSettings,
  updateBackupSettings,
  runBackupNow,
  toggleIntegration,
} from '@/lib/settings.js';

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');

  const [household, setHousehold] = useState({
    householdName: '',
    timezone: 'America/Chicago',
    address: '',
  });

  const [permissions, setPermissions] = useState({
    allowEventCreation: true,
    allowTaskCreation: true,
    requireVaultApproval: true,
    allowPhotoUploads: true,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    calendarReminders: true,
    taskDueAlerts: true,
    documentExpirationWarnings: true,
  });

  const [backups, setBackups] = useState({
    automaticBackups: true,
    backupFrequency: 'daily',
    lastBackupAt: null,
  });

  const [roles, setRoles] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setErrorText('');

    try {
      const data = await getSettingsData();
      setHousehold(data.household);
      setPermissions(data.permissions);
      setNotifications(data.notifications);
      setBackups(data.backups);
      setRoles(data.roles || []);
      setIntegrations(data.integrations || []);
      setAuditLogs(data.auditLogs || []);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setErrorText(error?.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveHousehold() {
    setSavingSection('household');
    setErrorText('');
    setSuccessText('');

    try {
      await updateHouseholdSettings(household);
      setSuccessText('Household settings saved.');
      await loadSettings();
    } catch (error) {
      setErrorText(error?.message || 'Failed to save household settings.');
    } finally {
      setSavingSection('');
    }
  }

  async function handleSavePermissions() {
    setSavingSection('permissions');
    setErrorText('');
    setSuccessText('');

    try {
      await updatePermissionsSettings(permissions);
      setSuccessText('Permission settings saved.');
      await loadSettings();
    } catch (error) {
      setErrorText(error?.message || 'Failed to save permissions.');
    } finally {
      setSavingSection('');
    }
  }

  async function handleSaveNotifications() {
    setSavingSection('notifications');
    setErrorText('');
    setSuccessText('');

    try {
      await updateNotificationSettings(notifications);
      setSuccessText('Notification settings saved.');
      await loadSettings();
    } catch (error) {
      setErrorText(error?.message || 'Failed to save notifications.');
    } finally {
      setSavingSection('');
    }
  }

  async function handleSaveBackups() {
    setSavingSection('backups');
    setErrorText('');
    setSuccessText('');

    try {
      await updateBackupSettings(backups);
      setSuccessText('Backup settings saved.');
      await loadSettings();
    } catch (error) {
      setErrorText(error?.message || 'Failed to save backup settings.');
    } finally {
      setSavingSection('');
    }
  }

  async function handleRunBackupNow() {
    setSavingSection('backup_now');
    setErrorText('');
    setSuccessText('');

    try {
      await runBackupNow();
      setSuccessText('Backup completed.');
      await loadSettings();
    } catch (error) {
      setErrorText(error?.message || 'Failed to run backup.');
    } finally {
      setSavingSection('');
    }
  }

  async function handleToggleIntegration(item) {
    setSavingSection(`integration_${item.id}`);
    setErrorText('');
    setSuccessText('');

    try {
      await toggleIntegration(item.id, item.connected);
      setSuccessText(
        item.connected ? `${item.name} disconnected.` : `${item.name} connected.`
      );
      await loadSettings();
    } catch (error) {
      setErrorText(error?.message || 'Failed to update integration.');
    } finally {
      setSavingSection('');
    }
  }

  return (
    <>
      <Helmet>
        <title>Settings - FamilyHub</title>
        <meta
          name="description"
          content="Manage your household settings, user roles, and preferences"
        />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your household preferences, permissions, and integrations.
          </p>
        </div>

        {(errorText || successText) && (
          <div className="space-y-2">
            {errorText ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorText}
              </div>
            ) : null}
            {successText ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {successText}
              </div>
            ) : null}
          </div>
        )}

        <Tabs defaultValue="household" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="household" className="text-xs sm:text-sm">
              Household
            </TabsTrigger>
            <TabsTrigger value="roles" className="text-xs sm:text-sm">
              User roles
            </TabsTrigger>
            <TabsTrigger value="permissions" className="text-xs sm:text-sm">
              Permissions
            </TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs sm:text-sm">
              Integrations
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="backups" className="text-xs sm:text-sm">
              Backups
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs sm:text-sm">
              Audit logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="household" className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-primary" />
                  Household information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <LoadingRow text="Loading household settings..." />
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="household-name">Household name</Label>
                        <Input
                          id="household-name"
                          value={household.householdName}
                          onChange={(e) =>
                            setHousehold((prev) => ({
                              ...prev,
                              householdName: e.target.value,
                            }))
                          }
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                          id="timezone"
                          value={household.timezone}
                          onChange={(e) =>
                            setHousehold((prev) => ({
                              ...prev,
                              timezone: e.target.value,
                            }))
                          }
                          className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                        >
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Chicago">Central Time</option>
                          <option value="America/Denver">Mountain Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Home address</Label>
                      <Input
                        id="address"
                        value={household.address}
                        onChange={(e) =>
                          setHousehold((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        className="mt-2"
                      />
                    </div>

                    <Button onClick={handleSaveHousehold} disabled={savingSection === 'household'}>
                      {savingSection === 'household' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save changes'
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            {loading ? (
              <LoadingCard text="Loading household members..." />
            ) : roles.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {roles.map((member) => (
                  <Card key={member.id} className="rounded-2xl shadow-sm">
                    <CardContent className="flex items-start justify-between gap-3 p-4">
                      <div className="flex-1">
                        <h4 className="mb-1 font-semibold text-sm">{member.name}</h4>
                        {member.email ? (
                          <p className="mb-2 text-xs text-muted-foreground">{member.email}</p>
                        ) : null}
                        <Badge variant="secondary" className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs" disabled>
                        Managed on Family page
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Users className="h-6 w-6 text-muted-foreground" />}
                title="No members found"
                description="Add family members first, then role management can be expanded here."
              />
            )}
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Permission settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <LoadingRow text="Loading permissions..." />
                ) : (
                  <>
                    <ToggleRow
                      title="Allow members to add events"
                      description="Members can create calendar events."
                      checked={permissions.allowEventCreation}
                      onChange={(checked) =>
                        setPermissions((prev) => ({
                          ...prev,
                          allowEventCreation: checked,
                        }))
                      }
                    />
                    <ToggleRow
                      title="Allow members to add tasks"
                      description="Members can create and assign tasks."
                      checked={permissions.allowTaskCreation}
                      onChange={(checked) =>
                        setPermissions((prev) => ({
                          ...prev,
                          allowTaskCreation: checked,
                        }))
                      }
                    />
                    <ToggleRow
                      title="Require admin approval for vault access"
                      description="Admins must approve document access."
                      checked={permissions.requireVaultApproval}
                      onChange={(checked) =>
                        setPermissions((prev) => ({
                          ...prev,
                          requireVaultApproval: checked,
                        }))
                      }
                    />
                    <ToggleRow
                      title="Allow photo uploads"
                      description="Members can upload photos and memories."
                      checked={permissions.allowPhotoUploads}
                      onChange={(checked) =>
                        setPermissions((prev) => ({
                          ...prev,
                          allowPhotoUploads: checked,
                        }))
                      }
                    />

                    <Button onClick={handleSavePermissions} disabled={savingSection === 'permissions'}>
                      {savingSection === 'permissions' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save permissions'
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            {loading ? (
              <LoadingCard text="Loading integrations..." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {integrations.map((integration) => (
                  <Card key={integration.id} className="rounded-2xl shadow-sm">
                    <CardContent className="flex items-start justify-between gap-3 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                          <Plug className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="mb-1 font-semibold text-sm">{integration.name}</h4>
                          <Badge
                            variant={integration.connected ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {integration.connected ? 'Connected' : 'Not connected'}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        variant={integration.connected ? 'outline' : 'default'}
                        size="sm"
                        className="text-xs"
                        onClick={() => handleToggleIntegration(integration)}
                        disabled={savingSection === `integration_${integration.id}`}
                      >
                        {savingSection === `integration_${integration.id}` ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Working...
                          </>
                        ) : integration.connected ? (
                          'Disconnect'
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <LoadingRow text="Loading notifications..." />
                ) : (
                  <>
                    <ToggleRow
                      title="Email notifications"
                      description="Receive updates via email."
                      checked={notifications.emailNotifications}
                      onChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          emailNotifications: checked,
                        }))
                      }
                    />
                    <ToggleRow
                      title="Calendar reminders"
                      description="Get notified before events."
                      checked={notifications.calendarReminders}
                      onChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          calendarReminders: checked,
                        }))
                      }
                    />
                    <ToggleRow
                      title="Task due date alerts"
                      description="Reminders for upcoming tasks."
                      checked={notifications.taskDueAlerts}
                      onChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          taskDueAlerts: checked,
                        }))
                      }
                    />
                    <ToggleRow
                      title="Document expiration warnings"
                      description="Alerts for expiring documents."
                      checked={notifications.documentExpirationWarnings}
                      onChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          documentExpirationWarnings: checked,
                        }))
                      }
                    />

                    <Button onClick={handleSaveNotifications} disabled={savingSection === 'notifications'}>
                      {savingSection === 'notifications' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save notifications'
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backups" className="space-y-4">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Backup settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <LoadingRow text="Loading backup settings..." />
                ) : (
                  <>
                    <ToggleRow
                      title="Automatic backups"
                      description="Keep household settings backed up automatically."
                      checked={backups.automaticBackups}
                      onChange={(checked) =>
                        setBackups((prev) => ({
                          ...prev,
                          automaticBackups: checked,
                        }))
                      }
                    />

                    <div>
                      <Label>Backup frequency</Label>
                      <select
                        value={backups.backupFrequency}
                        onChange={(e) =>
                          setBackups((prev) => ({
                            ...prev,
                            backupFrequency: e.target.value,
                          }))
                        }
                        className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <p className="mb-3 text-sm text-muted-foreground">
                        Last backup:{' '}
                        {backups.lastBackupAt
                          ? new Date(backups.lastBackupAt).toLocaleString()
                          : 'Not available'}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          onClick={handleRunBackupNow}
                          disabled={savingSection === 'backup_now'}
                        >
                          {savingSection === 'backup_now' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Running...
                            </>
                          ) : (
                            'Run backup now'
                          )}
                        </Button>

                        <Button
                          onClick={handleSaveBackups}
                          disabled={savingSection === 'backups'}
                        >
                          {savingSection === 'backups' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save backup settings'
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <LoadingRow text="Loading audit logs..." />
                ) : auditLogs.length ? (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 rounded-lg bg-muted p-3"
                      >
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="text-sm font-medium">{log.action}</p>
                            <Badge variant="outline" className="text-xs">
                              {log.user}
                            </Badge>
                          </div>
                          {log.details ? (
                            <p className="mb-1 text-xs text-muted-foreground">{log.details}</p>
                          ) : null}
                          <p className="text-xs text-muted-foreground">
                            {log.timestamp
                              ? new Date(log.timestamp).toLocaleString()
                              : 'Unknown time'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FileText className="h-6 w-6 text-muted-foreground" />}
                    title="No audit logs yet"
                    description="Recent settings activity will appear here."
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function LoadingRow({ text }) {
  return <div className="text-sm text-muted-foreground">{text}</div>;
}

function LoadingCard({ text }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6 text-sm text-muted-foreground">
        {text}
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <Card className="rounded-2xl border-dashed shadow-sm">
      <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default SettingsPage;
