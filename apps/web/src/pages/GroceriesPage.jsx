import React, { useEffect, useState } from 'react';
import {
  getGroceryItems,
  addGroceryItem,
  updateGroceryItem,
  toggleGroceryItemStatus,
  deleteGroceryItem,
} from '@/lib/groceries.js';
import { getFamilyMembers } from '@/lib/family.js';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

import { Plus, AlertCircle, Package } from 'lucide-react';

function getMemberDisplayName(member) {
  return member.display_name || member.first_name || 'Unnamed';
}

function GroceryModal({ open, onClose, onSave, item, saving, familyMembers = [] }) {
  const [form, setForm] = useState({
    name: '',
    notes: '',
    category: '',
    quantity: '',
    list_type: 'shopping',
    assigned_to: '',
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        notes: item.notes || '',
        category: item.category || '',
        quantity: item.quantity || '',
        list_type: item.list_type || 'shopping',
        assigned_to: item.assigned_to || '',
      });
    } else {
      setForm({
        name: '',
        notes: '',
        category: '',
        quantity: '',
        list_type: 'shopping',
        assigned_to: '',
      });
    }
  }, [item, open]);

  if (!open) return null;

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    await onSave({
      name: form.name.trim(),
      notes: form.notes.trim() || null,
      category: form.category.trim() || null,
      quantity: form.quantity.trim() || null,
      list_type: form.list_type || 'shopping',
      assigned_to: form.assigned_to || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {item?.id ? 'Edit Item' : 'Add Grocery Item'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Add items to your shopping list or pantry.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Item Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Milk"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">List Type</label>
              <select
                value={form.list_type}
                onChange={(e) => updateField('list_type', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                <option value="shopping">Shopping List</option>
                <option value="pantry">Pantry</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Quantity</label>
              <input
                type="text"
                value={form.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
                placeholder="2 gallons"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="Dairy"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Assigned To</label>
              <select
                value={form.assigned_to || ''}
                onChange={(e) => updateField('assigned_to', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                <option value="">Unassigned</option>
                {familyMembers.map((member) => {
                  const name = getMemberDisplayName(member);
                  return (
                    <option key={member.id} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Optional details"
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : item?.id ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GroceriesPage() {
  const [items, setItems] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    setErrorText('');

    try {
      const [itemData, familyData] = await Promise.all([
        getGroceryItems(),
        getFamilyMembers(),
      ]);

      setItems(itemData || []);
      setFamilyMembers(familyData || []);
    } catch (error) {
      console.error('Failed to load grocery data:', error);
      setErrorText(error?.message || 'Failed to load grocery data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleOpenCreate(listType = 'shopping') {
    setEditingItem({
      name: '',
      notes: '',
      category: '',
      quantity: '',
      list_type: listType,
      assigned_to: '',
    });
    setModalOpen(true);
  }

  function handleOpenEdit(item) {
    setEditingItem(item);
    setModalOpen(true);
  }

  function handleCloseModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingItem(null);
  }

  async function handleSaveItem(formData) {
    setSaving(true);
    setErrorText('');

    try {
      if (editingItem?.id) {
        await updateGroceryItem(editingItem.id, formData);
      } else {
        await addGroceryItem(formData);
      }

      setModalOpen(false);
      setEditingItem(null);
      await loadData();
    } catch (error) {
      console.error('Failed to save grocery item:', error);
      setErrorText(error?.message || 'Failed to save grocery item');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item) {
    try {
      await toggleGroceryItemStatus(item);
      await loadData();
    } catch (error) {
      console.error('Failed to update grocery item:', error);
      setErrorText(error?.message || 'Failed to update grocery item');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return;

    try {
      await deleteGroceryItem(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete grocery item:', error);
      setErrorText(error?.message || 'Failed to delete grocery item');
    }
  }

  const shoppingList = items.filter((i) => i.list_type === 'shopping' && i.status !== 'done');
  const pantryItems = items.filter((i) => i.list_type === 'pantry' && i.status !== 'done');
  const lowStock = pantryItems.filter((i) => (i.quantity || '').toLowerCase().includes('low'));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
            Groceries & Pantry
          </h1>
          <p className="text-muted-foreground">Track shopping and inventory</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => handleOpenCreate('shopping')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {errorText ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorText}
        </div>
      ) : null}

      <Tabs defaultValue="shopping-list" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="shopping-list">Shopping</TabsTrigger>
          <TabsTrigger value="pantry">Pantry</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="shopping-list" className="space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading shopping list...</div>
          ) : shoppingList.length === 0 ? (
            <div className="text-sm text-muted-foreground">No shopping items yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shoppingList.map((item) => (
                <Card key={item.id} className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={false} onCheckedChange={() => handleToggle(item)} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {item.quantity ? <span>{item.quantity}</span> : null}
                              {item.category ? (
                                <Badge variant="secondary" className="text-xs">
                                  {item.category}
                                </Badge>
                              ) : null}
                              {item.assigned_to ? (
                                <Badge className="text-xs">
                                  {item.assigned_to}
                                </Badge>
                              ) : null}
                            </div>
                            {item.notes ? (
                              <p className="mt-2 text-xs text-muted-foreground">{item.notes}</p>
                            ) : null}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="text-xs text-slate-600 hover:text-slate-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pantry" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => handleOpenCreate('pantry')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Pantry Item
            </Button>
          </div>

          {loading ? (
            <div className="text-sm text-muted-foreground">Loading pantry...</div>
          ) : pantryItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pantry items yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pantryItems.map((item) => (
                <Card key={item.id} className="transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-medium text-sm mb-2">{item.name}</h4>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              {item.quantity ? <p>Quantity: {item.quantity}</p> : null}
                              {item.category ? <p>Category: {item.category}</p> : null}
                              {item.assigned_to ? <p>Assigned: {item.assigned_to}</p> : null}
                              {item.notes ? <p>{item.notes}</p> : null}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="text-xs text-slate-600 hover:text-slate-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading low stock items...</div>
          ) : lowStock.length === 0 ? (
            <div className="text-sm text-muted-foreground">No low stock items.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStock.map((item) => (
                <Card key={item.id} className="border-red-200 transition-all duration-200 hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {item.quantity || 'Low stock'}
                        </p>
                        <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                          Low Stock
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <GroceryModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        item={editingItem}
        saving={saving}
        familyMembers={familyMembers}
      />
    </div>
  );
}

export default GroceriesPage;
