import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function SettingsPage() {
  const [settings, setSettings] = useState({
    householdName: 'FamilyHub',
    address: '',
    emailNotifications: true,
    taskReminders: true,
    vaultApproval: true,
  });

  const [members] = useState([
    { name: 'Lance Garza', role: 'Admin' },
    { name: 'Shelby Harris', role: 'Admin' },
    { name: 'Zander', role: 'Member' },
    { name: 'Kasper', role: 'Member' },
  ]);

  const [integrations, setIntegrations] = useState([
    { name: 'Google Calendar', connected: false },
    { name: 'Dropbox', connected: false },
    { name: 'iCloud Photos', connected: false },
  ]);

  const toggleIntegration = (index) => {
    const updated = [...integrations];
    updated[index].connected = !updated[index].connected;
    setIntegrations(updated);
  };

  return (
    <>
      <Helmet>
        <title>Settings - FamilyHub</title>
      </Helmet>

      <div className="space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your household, preferences, and integrations
          </p>
        </div>

        {/* TABS */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          {/* GENERAL */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Household Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Household Name</Label>
                  <Input
                    value={settings.householdName}
                    onChange={(e) =>
                      setSettings({ ...settings, householdName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Address</Label>
                  <Input
                    value={settings.address}
                    onChange={(e) =>
                      setSettings({ ...settings, address: e.target.value })
                    }
                  />
                </div>

                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MEMBERS */}
          <TabsContent value="members">
            <div className="grid md:grid-cols-2 gap-4">
              {members.map((member, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* PERMISSIONS */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingToggle
                  label="Allow task creation"
                  value={settings.taskReminders}
                  onChange={(val) =>
                    setSettings({ ...settings, taskReminders: val })
                  }
                />

                <SettingToggle
                  label="Require vault approval"
                  value={settings.vaultApproval}
                  onChange={(val) =>
                    setSettings({ ...settings, vaultApproval: val })
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingToggle
                  label="Email notifications"
                  value={settings.emailNotifications}
                  onChange={(val) =>
                    setSettings({ ...settings, emailNotifications: val })
                  }
                />

                <SettingToggle
                  label="Task reminders"
                  value={settings.taskReminders}
                  onChange={(val) =>
                    setSettings({ ...settings, taskReminders: val })
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* INTEGRATIONS */}
          <TabsContent value="integrations">
            <div className="grid md:grid-cols-2 gap-4">
              {integrations.map((item, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <Badge variant={item.connected ? 'secondary' : 'outline'}>
                        {item.connected ? 'Connected' : 'Not Connected'}
                      </Badge>
                    </div>

                    <Button
                      size="sm"
                      variant={item.connected ? 'outline' : 'default'}
                      onClick={() => toggleIntegration(i)}
                    >
                      {item.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* BACKUP */}
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Last backup: Not available
                </p>

                <Button variant="outline">Download Backup</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

/* reusable toggle */
function SettingToggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

export default SettingsPage;
