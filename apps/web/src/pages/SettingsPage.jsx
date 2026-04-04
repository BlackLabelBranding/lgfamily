
import React from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings as SettingsIcon, Users, Shield, Link, Bell, Database, FileText } from 'lucide-react';

function SettingsPage() {
  const familyMembers = [
    { name: "Sarah Chen", role: "Admin", email: "sarah.chen@email.com" },
    { name: "Michael Chen", role: "Admin", email: "michael.chen@email.com" },
    { name: "Emma Chen", role: "Member", email: "emma.chen@email.com" },
    { name: "Lucas Chen", role: "Member", email: null },
  ];

  const integrations = [
    { name: "Google Calendar", status: "Connected", icon: "📅" },
    { name: "iCloud Photos", status: "Not connected", icon: "📸" },
    { name: "Dropbox", status: "Connected", icon: "📦" },
  ];

  const auditLogs = [
    { action: "Document uploaded", user: "Sarah", timestamp: "Apr 4, 2026 2:30 PM", details: "Emma's passport" },
    { action: "Task completed", user: "Michael", timestamp: "Apr 4, 2026 11:15 AM", details: "Pay electricity bill" },
    { action: "Event created", user: "Sarah", timestamp: "Apr 3, 2026 4:45 PM", details: "Doctor appointment" },
  ];

  return (
    <>
      <Helmet>
        <title>Settings - FamilyHub</title>
        <meta name="description" content="Manage household settings, user roles, and preferences" />
      </Helmet>
      
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>Settings</h1>
                <p className="text-muted-foreground">Manage your family hub preferences</p>
              </div>

              <Tabs defaultValue="household" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto">
                  <TabsTrigger value="household" className="text-xs sm:text-sm">Household</TabsTrigger>
                  <TabsTrigger value="roles" className="text-xs sm:text-sm">User roles</TabsTrigger>
                  <TabsTrigger value="permissions" className="text-xs sm:text-sm">Permissions</TabsTrigger>
                  <TabsTrigger value="integrations" className="text-xs sm:text-sm">Integrations</TabsTrigger>
                  <TabsTrigger value="notifications" className="text-xs sm:text-sm">Notifications</TabsTrigger>
                  <TabsTrigger value="backups" className="text-xs sm:text-sm">Backups</TabsTrigger>
                  <TabsTrigger value="audit" className="text-xs sm:text-sm">Audit logs</TabsTrigger>
                </TabsList>

                <TabsContent value="household" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5 text-primary" />
                        Household information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="household-name">Household name</Label>
                          <Input id="household-name" defaultValue="Chen Family" className="mt-2" />
                        </div>
                        <div>
                          <Label htmlFor="timezone">Timezone</Label>
                          <Select defaultValue="est">
                            <SelectTrigger id="timezone" className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="est">Eastern Time (ET)</SelectItem>
                              <SelectItem value="cst">Central Time (CT)</SelectItem>
                              <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                              <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">Home address</Label>
                        <Input id="address" defaultValue="123 Main Street, Anytown, USA" className="mt-2" />
                      </div>
                      <Button>Save changes</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {familyMembers.map((member, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">{member.name}</h4>
                              {member.email && (
                                <p className="text-xs text-muted-foreground mb-2">{member.email}</p>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                            <Button variant="outline" size="sm" className="text-xs">
                              Edit role
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Permission settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Allow members to add events</p>
                          <p className="text-xs text-muted-foreground">Members can create calendar events</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Allow members to add tasks</p>
                          <p className="text-xs text-muted-foreground">Members can create and assign tasks</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Require admin approval for vault access</p>
                          <p className="text-xs text-muted-foreground">Admins must approve document access</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Allow photo uploads</p>
                          <p className="text-xs text-muted-foreground">Members can upload photos and videos</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="integrations" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map((integration, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="text-3xl">{integration.icon}</div>
                              <div>
                                <h4 className="font-semibold text-sm mb-1">{integration.name}</h4>
                                <Badge 
                                  variant={integration.status === "Connected" ? "secondary" : "outline"}
                                  className={integration.status === "Connected" ? "bg-secondary text-secondary-foreground text-xs" : "text-xs"}
                                >
                                  {integration.status}
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              variant={integration.status === "Connected" ? "outline" : "default"}
                              size="sm" 
                              className="text-xs"
                            >
                              {integration.status === "Connected" ? "Disconnect" : "Connect"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Notification preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Email notifications</p>
                          <p className="text-xs text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Calendar reminders</p>
                          <p className="text-xs text-muted-foreground">Get notified before events</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Task due date alerts</p>
                          <p className="text-xs text-muted-foreground">Reminders for upcoming tasks</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Document expiration warnings</p>
                          <p className="text-xs text-muted-foreground">Alerts for expiring documents</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="backups" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        Backup settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Automatic backups</p>
                          <p className="text-xs text-muted-foreground">Daily backup at 2:00 AM</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div>
                        <Label>Backup frequency</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-4">
                        <p className="text-sm text-muted-foreground mb-3">Last backup: Apr 4, 2026 at 2:00 AM</p>
                        <Button variant="outline">Download backup now</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="audit" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Recent activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {auditLogs.map((log, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm">{log.action}</p>
                                <Badge variant="outline" className="text-xs">{log.user}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">{log.details}</p>
                              <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default SettingsPage;
