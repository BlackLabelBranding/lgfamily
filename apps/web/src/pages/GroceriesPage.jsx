import React, { useEffect, useState } from 'react';
import { getGroceryItems, addGroceryItem, toggleGroceryItemStatus } from '@/lib/groceries.js';
import { getFamilyMembers } from '@/lib/family.js';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

import { Plus, AlertCircle, Package } from 'lucide-react';

function GroceriesPage() {
  const [items, setItems] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);

  async function loadData() {
    const [itemData, familyData] = await Promise.all([
      getGroceryItems(),
      getFamilyMembers(),
    ]);

    setItems(itemData || []);
    setFamilyMembers(familyData || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd() {
    const name = window.prompt('Item name');
    if (!name) return;

    await addGroceryItem({
      name,
      list_type: 'shopping',
    });

    loadData();
  }

  async function handleToggle(item) {
    await toggleGroceryItemStatus(item);
    loadData();
  }

  const shoppingList = items.filter(i => i.list_type === 'shopping' && i.status !== 'done');
  const pantryItems = items.filter(i => i.list_type === 'pantry' && i.status !== 'done');
  const lowStock = pantryItems.filter(i => (i.quantity || '').toLowerCase().includes('low'));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Groceries & Pantry</h1>
          <p className="text-muted-foreground">Track shopping and inventory</p>
        </div>

        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* TABS */}
      <Tabs defaultValue="shopping-list" className="space-y-6">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="shopping-list">Shopping</TabsTrigger>
          <TabsTrigger value="pantry">Pantry</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>

        {/* SHOPPING LIST */}
        <TabsContent value="shopping-list">
          <div className="grid md:grid-cols-2 gap-4">
            {shoppingList.map(item => (
              <Card key={item.id} className="hover:shadow-md transition">
                <CardContent className="p-4 flex gap-3">
                  <Checkbox onCheckedChange={() => handleToggle(item)} />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                      {item.quantity && <span>{item.quantity}</span>}
                      {item.category && (
                        <Badge variant="secondary">{item.category}</Badge>
                      )}
                      {item.assigned_to && (
                        <Badge>{item.assigned_to}</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* PANTRY */}
        <TabsContent value="pantry">
          <div className="grid md:grid-cols-2 gap-4">
            {pantryItems.map(item => (
              <Card key={item.id} className="hover:shadow-md transition">
                <CardContent className="p-4 flex gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="text-xs text-muted-foreground mt-1 space-y-1">
                      {item.quantity && <p>Qty: {item.quantity}</p>}
                      {item.category && <p>{item.category}</p>}
                      {item.notes && <p>{item.notes}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LOW STOCK */}
        <TabsContent value="low-stock">
          <div className="grid md:grid-cols-2 gap-4">
            {lowStock.map(item => (
              <Card key={item.id} className="border-red-200 hover:shadow-md transition">
                <CardContent className="p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-1" />

                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity || 'Low'}
                    </p>
                    <Badge className="mt-2 bg-red-100 text-red-700">
                      Low Stock
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}

export default GroceriesPage;
