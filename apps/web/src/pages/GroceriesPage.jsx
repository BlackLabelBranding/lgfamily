import React, { useEffect, useMemo, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    <Dialog open={open} onOpenChange={(next) => !saving && !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item?.id ? 'Edit item' : 'Add grocery item'}</DialogTitle>
          <DialogDescription>
            Add items to your shopping list or pantry.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="Item Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Milk"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="List Type">
              <select
                value={form.list_type}
                onChange={(e) => updateField('list_type', e.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="shopping">Shopping List</option>
                <option value="pantry">Pantry</option>
              </select>
            </Field>

            <Field label="Quantity">
              <input
                type="text"
                value={form.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
                placeholder="2 gallons"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Category">
              <input
                type="text"
                value={form.category}
                onChange={(e) => updateField('category', e.target.value)}
                placeholder="Dairy"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </Field>

            <Field label="Assigned To">
              <select
                value={form.assigned_to || ''}
                onChange={(e) => updateField('assigned_to', e.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Optional details"
              rows={4}
              className="min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()}>
              {saving ? 'Saving...' : item?.id ? 'Save Changes' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  function openDeleteDialog(item) {
    setItemToDelete(item);
    setDeleteOpen(true);
  }

  async function handleDeleteConfirmed() {
    if (!itemToDelete) return;

    try {
      await deleteGroceryItem(itemToDelete.id);
      setDeleteOpen(false);
      setItemToDelete(null);
      await loadData();
    } catch (error) {
      console.error('Failed to delete grocery item:', error);
      setErrorText(error?.message || 'Failed to delete grocery item');
    }
  }

  const shoppingList = useMemo(
    () => items.filter((i) => i.list_type === 'shopping' && i.status !== 'done'),
    [items]
  );

  const pantryItems = useMemo(
    () => items.filter((i) => i.list_type === 'pantry' && i.status !== 'done'),
    [items]
  );

  const lowStock = useMemo(
    () => pantryItems.filter((i) => (i.quantity || '').toLowerCase().includes('low')),
    [pantryItems]
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Groceries & Pantry</h2>
            <p className="text-muted-foreground">Track shopping and household inventory.</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => handleOpenCreate('shopping')} className="gap-2 rounded-xl shadow-sm">
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
          <TabsList className="grid h-auto w-full grid-cols-3">
            <TabsTrigger value="shopping-list">Shopping</TabsTrigger>
            <TabsTrigger value="pantry">Pantry</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="shopping-list" className="space-y-4">
            {loading ? (
              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Loading shopping list...
                </CardContent>
              </Card>
            ) : shoppingList.length === 0 ? (
              <EmptyState text="No shopping items yet." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {shoppingList.map((item) => (
                  <Card key={item.id} className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={false} onCheckedChange={() => handleToggle(item)} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="mb-1 font-medium text-sm">{item.name}</h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                {item.quantity ? <span>{item.quantity}</span> : null}
                                {item.category ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.category}
                                  </Badge>
                                ) : null}
                                {item.assigned_to ? (
                                  <Badge className="text-xs">{item.assigned_to}</Badge>
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
                                onClick={() => openDeleteDialog(item)}
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
              <Button variant="outline" onClick={() => handleOpenCreate('pantry')} className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Add Pantry Item
              </Button>
            </div>

            {loading ? (
              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Loading pantry...
                </CardContent>
              </Card>
            ) : pantryItems.length === 0 ? (
              <EmptyState text="No pantry items yet." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {pantryItems.map((item) => (
                  <Card key={item.id} className="rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="mb-2 font-medium text-sm">{item.name}</h4>
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
                                onClick={() => openDeleteDialog(item)}
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
              <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Loading low stock items...
                </CardContent>
              </Card>
            ) : lowStock.length === 0 ? (
              <EmptyState text="No low stock items." />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {lowStock.map((item) => (
                  <Card key={item.id} className="rounded-2xl border-red-200 shadow-sm transition-all duration-200 hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                        <div className="flex-1">
                          <h4 className="mb-1 font-medium text-sm">{item.name}</h4>
                          <p className="mb-2 text-xs text-muted-foreground">
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
      </div>

      <GroceryModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveItem}
        item={editingItem}
        saving={saving}
        familyMembers={familyMembers}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will delete the selected grocery item.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border bg-muted/40 p-3 text-sm">
            {itemToDelete?.name || 'Selected item'}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteOpen(false);
                setItemToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirmed}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, required = false, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <Card className="rounded-2xl border border-dashed shadow-sm">
      <CardContent className="p-6 text-sm text-muted-foreground">
        {text}
      </CardContent>
    </Card>
  );
}

export default GroceriesPage;
