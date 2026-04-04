
import React from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertCircle, Package } from 'lucide-react';

function GroceriesPage() {
  const shoppingList = [
    { id: 1, item: "Milk", quantity: "2 gallons", checked: false, category: "Dairy" },
    { id: 2, item: "Bread", quantity: "2 loaves", checked: false, category: "Bakery" },
    { id: 3, item: "Eggs", quantity: "1 dozen", checked: false, category: "Dairy" },
    { id: 4, item: "Apples", quantity: "6 pieces", checked: false, category: "Produce" },
    { id: 5, item: "Chicken breast", quantity: "2 lbs", checked: false, category: "Meat" },
  ];

  const pantryItems = [
    { id: 1, item: "Rice", quantity: "5 lbs", location: "Pantry shelf 2", expiry: "Dec 2026" },
    { id: 2, item: "Pasta", quantity: "3 boxes", location: "Pantry shelf 1", expiry: "Aug 2026" },
    { id: 3, item: "Olive oil", quantity: "1 bottle", location: "Pantry shelf 3", expiry: "Nov 2026" },
    { id: 4, item: "Canned tomatoes", quantity: "4 cans", location: "Pantry shelf 1", expiry: "Jan 2027" },
  ];

  const lowStock = [
    { id: 1, item: "Coffee", quantity: "1/4 bag remaining", status: "Low" },
    { id: 2, item: "Sugar", quantity: "1 cup remaining", status: "Low" },
  ];

  const expiringSoon = [
    { id: 1, item: "Yogurt", expiry: "Apr 6, 2026", daysLeft: 2 },
    { id: 2, item: "Cheese", expiry: "Apr 8, 2026", daysLeft: 4 },
  ];

  return (
    <>
      <Helmet>
        <title>Groceries & Pantry - FamilyHub</title>
        <meta name="description" content="Manage shopping lists and pantry inventory" />
      </Helmet>
      
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{letterSpacing: '-0.02em'}}>Groceries & pantry</h1>
                  <p className="text-muted-foreground">Track shopping and inventory</p>
                </div>
                <Button className="gap-2 touch-target">
                  <Plus className="h-4 w-4" />
                  Add item
                </Button>
              </div>

              <Tabs defaultValue="shopping-list" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                  <TabsTrigger value="shopping-list" className="text-xs sm:text-sm">Shopping list</TabsTrigger>
                  <TabsTrigger value="pantry" className="text-xs sm:text-sm">Pantry inventory</TabsTrigger>
                  <TabsTrigger value="low-stock" className="text-xs sm:text-sm">Low stock</TabsTrigger>
                  <TabsTrigger value="expiring" className="text-xs sm:text-sm">Expiring soon</TabsTrigger>
                </TabsList>

                <TabsContent value="shopping-list" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shoppingList.map(item => (
                      <Card key={item.id} className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox className="mt-1" />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">{item.item}</h4>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{item.quantity}</span>
                                <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="pantry" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pantryItems.map(item => (
                      <Card key={item.id} className="transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-2">{item.item}</h4>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <p>Quantity: {item.quantity}</p>
                                <p>Location: {item.location}</p>
                                <p>Expires: {item.expiry}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="low-stock" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lowStock.map(item => (
                      <Card key={item.id} className="border-accent transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">{item.item}</h4>
                              <p className="text-xs text-muted-foreground mb-2">{item.quantity}</p>
                              <Badge variant="secondary" className="bg-accent text-accent-foreground text-xs">
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="expiring" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expiringSoon.map(item => (
                      <Card key={item.id} className="border-accent transition-all duration-200 hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm mb-1">{item.item}</h4>
                              <p className="text-xs text-accent font-medium mb-2">
                                Expires {item.expiry} ({item.daysLeft} days)
                              </p>
                              <Button size="sm" variant="outline" className="h-8 text-xs">
                                Add to shopping list
                              </Button>
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

export default GroceriesPage;
