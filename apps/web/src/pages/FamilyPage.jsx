
import React from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import FamilyMemberCard from '@/components/FamilyMemberCard.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, Heart, Stethoscope, Calendar } from 'lucide-react';

function FamilyPage() {
  const familyMembers = [
    { 
      name: "Sarah Chen", 
      initials: "SC", 
      role: "parent", 
      email: "sarah.chen@email.com", 
      phone: "(555) 123-4567",
      birthday: "March 15, 1985"
    },
    { 
      name: "Michael Chen", 
      initials: "MC", 
      role: "parent", 
      email: "michael.chen@email.com", 
      phone: "(555) 234-5678",
      birthday: "July 22, 1983"
    },
    { 
      name: "Emma Chen", 
      initials: "EC", 
      role: "child", 
      email: "emma.chen@email.com", 
      phone: null,
      birthday: "September 8, 2014"
    },
    { 
      name: "Lucas Chen", 
      initials: "LC", 
      role: "child", 
      email: null, 
      phone: null,
      birthday: "January 12, 2018"
    },
  ];

  const emergencyContacts = [
    { name: "Dr. Anika Bergström", relationship: "Family Doctor", phone: "(555) 345-6789", email: "dr.bergstrom@clinic.com" },
    { name: "Grandma Rose", relationship: "Grandmother", phone: "(555) 456-7890", email: "rose.chen@email.com" },
    { name: "Tom Martinez", relationship: "Neighbor", phone: "(555) 567-8901", email: "tom.m@email.com" },
  ];

  const medicalSummary = [
    { member: "Emma", condition: "Seasonal allergies", medication: "Antihistamine as needed" },
    { member: "Lucas", condition: "Asthma", medication: "Inhaler (Albuterol)" },
  ];

  const importantDates = [
    { event: "Grandma Rose's birthday", date: "Apr 12, 2026" },
    { event: "Emma's birthday", date: "Sep 8, 2026" },
    { event: "Lucas's birthday", date: "Jan 12, 2027" },
    { event: "Wedding anniversary", date: "Jun 20, 2026" },
  ];

  return (
    <>
      <Helmet>
        <title>Family - FamilyHub</title>
        <meta name="description" content="Family members, contacts, and important information" />
      </Helmet>
      
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>Family</h1>
                  <p className="text-muted-foreground">Manage family members and contacts</p>
                </div>
                <Button className="gap-2 touch-target">
                  <Plus className="h-4 w-4" />
                  Add member
                </Button>
              </div>

              <Tabs defaultValue="members" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
                  <TabsTrigger value="members" className="text-xs sm:text-sm">Family members</TabsTrigger>
                  <TabsTrigger value="tree" className="text-xs sm:text-sm">Family tree</TabsTrigger>
                  <TabsTrigger value="contacts" className="text-xs sm:text-sm">Contacts</TabsTrigger>
                  <TabsTrigger value="medical" className="text-xs sm:text-sm">Medical summary</TabsTrigger>
                  <TabsTrigger value="dates" className="text-xs sm:text-sm">Important dates</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {familyMembers.map((member, index) => (
                      <FamilyMemberCard key={index} member={member} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="tree" className="space-y-4">
                  <Card>
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center gap-8">
                        {/* Simple family tree visualization */}
                        <div className="flex gap-8">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold mb-2">
                              SC
                            </div>
                            <p className="font-medium">Sarah</p>
                            <p className="text-xs text-muted-foreground">Mom</p>
                          </div>
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold mb-2">
                              MC
                            </div>
                            <p className="font-medium">Michael</p>
                            <p className="text-xs text-muted-foreground">Dad</p>
                          </div>
                        </div>
                        <div className="w-px h-12 bg-border" />
                        <div className="flex gap-8">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center text-xl font-semibold mb-2">
                              EC
                            </div>
                            <p className="font-medium">Emma</p>
                            <p className="text-xs text-muted-foreground">Daughter, 12</p>
                          </div>
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center text-xl font-semibold mb-2">
                              LC
                            </div>
                            <p className="font-medium">Lucas</p>
                            <p className="text-xs text-muted-foreground">Son, 8</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contacts" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {emergencyContacts.map((contact, index) => (
                      <Card key={index} className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Heart className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">{contact.name}</h4>
                              <Badge variant="secondary" className="text-xs mb-2">{contact.relationship}</Badge>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3" />
                                  <span>{contact.phone}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  <span>{contact.email}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medicalSummary.map((item, index) => (
                      <Card key={index} className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-2">{item.member}</h4>
                              <div className="space-y-1 text-xs">
                                <p className="text-muted-foreground">Condition: <span className="text-foreground font-medium">{item.condition}</span></p>
                                <p className="text-muted-foreground">Medication: <span className="text-foreground font-medium">{item.medication}</span></p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="dates" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {importantDates.map((item, index) => (
                      <Card key={index} className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">{item.event}</h4>
                              <p className="text-xs text-muted-foreground">{item.date}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default FamilyPage;
