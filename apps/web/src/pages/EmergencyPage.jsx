
import React from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import EmergencyContactCard from '@/components/EmergencyContactCard.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Stethoscope, FileText, AlertCircle } from 'lucide-react';

function EmergencyPage() {
  const emergencyContacts = [
    { name: "Emergency Services", relationship: "911", phone: "911", email: null, address: null },
    { name: "Dr. Anika Bergström", relationship: "Family Doctor", phone: "(555) 345-6789", email: "dr.bergstrom@clinic.com", address: "123 Medical Plaza" },
    { name: "Grandma Rose", relationship: "Grandmother", phone: "(555) 456-7890", email: "rose.chen@email.com", address: "456 Oak Street" },
    { name: "Tom Martinez", relationship: "Neighbor", phone: "(555) 567-8901", email: "tom.m@email.com", address: "Next door" },
  ];

  const doctors = [
    { name: "Dr. Anika Bergström", specialty: "Family Medicine", phone: "(555) 345-6789", address: "City Medical Center" },
    { name: "Dr. Raj Patel", specialty: "Pediatrics", phone: "(555) 678-9012", address: "Children's Health Clinic" },
  ];

  const medications = [
    { name: "Albuterol inhaler", for: "Lucas", dosage: "As needed for asthma", prescriber: "Dr. Patel" },
    { name: "Antihistamine", for: "Emma", dosage: "Daily during allergy season", prescriber: "Dr. Bergström" },
  ];

  const insuranceCards = [
    { type: "Health Insurance", provider: "BlueCross", policyNumber: "BC-123456789", groupNumber: "GRP-987654" },
    { type: "Dental Insurance", provider: "DeltaDental", policyNumber: "DD-987654321", groupNumber: "GRP-123456" },
  ];

  const legalDirectives = [
    { title: "Healthcare proxy - Sarah", status: "Current", lastUpdated: "Jan 2025" },
    { title: "Healthcare proxy - Michael", status: "Current", lastUpdated: "Jan 2025" },
    { title: "Living will - Sarah", status: "Current", lastUpdated: "Jan 2025" },
  ];

  const criticalChecklist = [
    { id: 1, item: "Emergency contact list printed and posted", checked: true },
    { id: 2, item: "First aid kit stocked and accessible", checked: true },
    { id: 3, item: "Fire extinguisher inspected", checked: false },
    { id: 4, item: "Emergency evacuation plan reviewed", checked: true },
    { id: 5, item: "Important documents backed up", checked: true },
    { id: 6, item: "Emergency supplies (water, food) stocked", checked: false },
  ];

  return (
    <>
      <Helmet>
        <title>Emergency Info - FamilyHub</title>
        <meta name="description" content="Critical emergency contacts, medical information, and important documents" />
      </Helmet>
      
      <div className="flex min-h-screen bg-[hsl(var(--emergency-bg))]">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-[hsl(var(--emergency-foreground))]" style={{letterSpacing: '-0.02em'}}>Emergency information</h1>
                  <p className="text-[hsl(var(--emergency-foreground))] opacity-80">Quick access to critical information</p>
                </div>
                <Button className="gap-2 touch-target bg-emergency-accent hover:bg-emergency-accent/90 text-white">
                  <Plus className="h-4 w-4" />
                  Add contact
                </Button>
              </div>

              <Tabs defaultValue="contacts" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
                  <TabsTrigger value="contacts" className="text-xs sm:text-sm">Emergency contacts</TabsTrigger>
                  <TabsTrigger value="doctors" className="text-xs sm:text-sm">Doctors & meds</TabsTrigger>
                  <TabsTrigger value="insurance" className="text-xs sm:text-sm">Insurance cards</TabsTrigger>
                  <TabsTrigger value="legal" className="text-xs sm:text-sm">Legal directives</TabsTrigger>
                  <TabsTrigger value="checklist" className="text-xs sm:text-sm">Critical checklist</TabsTrigger>
                </TabsList>

                <TabsContent value="contacts" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {emergencyContacts.map((contact, index) => (
                      <EmergencyContactCard key={index} contact={contact} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="doctors" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-emergency-accent" />
                      Doctors
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctors.map((doctor, index) => (
                        <Card key={index} className="transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-2">{doctor.name}</h4>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>Specialty: <span className="text-foreground font-medium">{doctor.specialty}</span></p>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span className="text-foreground font-medium">{doctor.phone}</span>
                              </div>
                              <p>{doctor.address}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emergency-accent" />
                      Medications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {medications.map((med, index) => (
                        <Card key={index} className="transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-sm mb-2">{med.name}</h4>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>For: <span className="text-foreground font-medium">{med.for}</span></p>
                              <p>Dosage: <span className="text-foreground font-medium">{med.dosage}</span></p>
                              <p>Prescribed by: {med.prescriber}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="insurance" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insuranceCards.map((card, index) => (
                      <Card key={index} className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-emergency-accent/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-6 w-6 text-emergency-accent" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-base mb-1">{card.type}</h4>
                              <Badge variant="secondary" className="text-xs">{card.provider}</Badge>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Policy #:</span>
                              <span className="font-medium">{card.policyNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Group #:</span>
                              <span className="font-medium">{card.groupNumber}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="legal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {legalDirectives.map((directive, index) => (
                      <Card key={index} className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-2">{directive.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                                  {directive.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">Updated {directive.lastUpdated}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="checklist" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="h-6 w-6 text-emergency-accent" />
                        <h3 className="text-lg font-semibold">Emergency preparedness checklist</h3>
                      </div>
                      <div className="space-y-3">
                        {criticalChecklist.map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                            <Checkbox checked={item.checked} className="mt-0.5" />
                            <span className="text-sm flex-1">{item.item}</span>
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

export default EmergencyPage;
