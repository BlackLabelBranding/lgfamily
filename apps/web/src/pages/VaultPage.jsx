
import React from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import DocumentCard from '@/components/DocumentCard.jsx';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

function VaultPage() {
  const ids = [
    { id: 1, title: "Sarah's passport", expirationDate: "Mar 15, 2028", permission: "Admin Only", category: "Passport" },
    { id: 2, title: "Michael's passport", expirationDate: "Jul 22, 2027", permission: "Admin Only", category: "Passport" },
    { id: 3, title: "Emma's passport", expirationDate: "Jun 15, 2026", permission: "Admin Only", category: "Passport", expirationWarning: true },
    { id: 4, title: "Lucas's passport", expirationDate: "Jan 12, 2029", permission: "Admin Only", category: "Passport" },
    { id: 5, title: "Driver's license - Sarah", expirationDate: "Mar 15, 2027", permission: "View Only", category: "License" },
  ];

  const insurance = [
    { id: 1, title: "Health insurance card", expirationDate: "Dec 31, 2026", permission: "View Only", category: "Health" },
    { id: 2, title: "Auto insurance policy", expirationDate: "Aug 1, 2026", permission: "View Only", category: "Auto" },
    { id: 3, title: "Home insurance policy", expirationDate: "Nov 15, 2026", permission: "Admin Only", category: "Home" },
  ];

  const legal = [
    { id: 1, title: "Will - Sarah", expirationDate: null, permission: "Admin Only", category: "Estate" },
    { id: 2, title: "Will - Michael", expirationDate: null, permission: "Admin Only", category: "Estate" },
    { id: 3, title: "Power of attorney", expirationDate: null, permission: "Admin Only", category: "Legal" },
  ];

  const medical = [
    { id: 1, title: "Vaccination records - Emma", expirationDate: null, permission: "View Only", category: "Medical" },
    { id: 2, title: "Vaccination records - Lucas", expirationDate: null, permission: "View Only", category: "Medical" },
    { id: 3, title: "Medical history - Family", expirationDate: null, permission: "Admin Only", category: "Medical" },
  ];

  const property = [
    { id: 1, title: "House deed", expirationDate: null, permission: "Admin Only", category: "Real Estate" },
    { id: 2, title: "Property tax records", expirationDate: null, permission: "Admin Only", category: "Tax" },
  ];

  const vehicles = [
    { id: 1, title: "Car registration - Honda", expirationDate: "May 1, 2026", permission: "View Only", category: "Registration" },
    { id: 2, title: "Car title - Honda", expirationDate: null, permission: "Admin Only", category: "Title" },
  ];

  const financial = [
    { id: 1, title: "Bank account info", expirationDate: null, permission: "Admin Only", category: "Banking" },
    { id: 2, title: "Investment accounts", expirationDate: null, permission: "Admin Only", category: "Investments" },
    { id: 3, title: "Credit card info", expirationDate: null, permission: "Admin Only", category: "Credit" },
  ];

  return (
    <>
      <Helmet>
        <title>Family Vault - FamilyHub</title>
        <meta name="description" content="Secure storage for important family documents and records" />
      </Helmet>
      
      <div className="flex min-h-screen bg-[hsl(var(--vault-bg))]">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2 text-[hsl(var(--vault-foreground))]" style={{letterSpacing: '-0.02em'}}>Family vault</h1>
                  <p className="text-[hsl(var(--vault-muted))]">Secure document storage</p>
                </div>
                <Button className="gap-2 touch-target">
                  <Plus className="h-4 w-4" />
                  Add document
                </Button>
              </div>

              <Tabs defaultValue="ids" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 h-auto bg-[hsl(var(--vault-surface))]">
                  <TabsTrigger value="ids" className="text-xs sm:text-sm">IDs</TabsTrigger>
                  <TabsTrigger value="insurance" className="text-xs sm:text-sm">Insurance</TabsTrigger>
                  <TabsTrigger value="legal" className="text-xs sm:text-sm">Legal</TabsTrigger>
                  <TabsTrigger value="medical" className="text-xs sm:text-sm">Medical</TabsTrigger>
                  <TabsTrigger value="property" className="text-xs sm:text-sm">Property</TabsTrigger>
                  <TabsTrigger value="vehicles" className="text-xs sm:text-sm">Vehicles</TabsTrigger>
                  <TabsTrigger value="financial" className="text-xs sm:text-sm">Financial</TabsTrigger>
                </TabsList>

                <TabsContent value="ids" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ids.map(doc => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="insurance" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insurance.map(doc => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="legal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {legal.map(doc => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {medical.map(doc => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="property" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.map(doc => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="vehicles" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map(doc => (
                      <DocumentCard key={doc.id} document={doc} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {financial.map(doc => (
                      <DocumentCard key={doc.id} document={doc} />
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

export default VaultPage;
