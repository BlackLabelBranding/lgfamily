import React, { useEffect, useMemo, useState } from 'react';
import {
  getGroceryItems,
  addGroceryItem,
  updateGroceryItem,
  toggleGroceryItemStatus,
  deleteGroceryItem,
} from '@/lib/groceries.js';
import { getFamilyMembers } from '@/lib/family.js';

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
                {item ? 'Edit Item' : 'Add Grocery Item'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage shopping list items and pantry stock.
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
              {saving ? 'Saving...' : item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GroceryCard({ item, onToggle, onEdit, onDelete }) {
  const done = item.status === 'done';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-base font-semibold ${
                done ? 'text-slate-400 line-through' : 'text-slate-900'
              }`}
            >
              {item.name}
            </h3>

            {item.category ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {item.category}
              </span>
            ) : null}

            {item.quantity ? (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                {item.quantity}
              </span>
            ) : null}

            {item.assigned_to ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                {item.assigned_to}
              </span>
            ) : null}
          </div>

          {item.notes ? (
            <p className={`text-sm ${done ? 'text-slate-400' : 'text-slate-600'}`}>
              {item.notes}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onToggle(item)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {done ? 'Reopen' : 'Done'}
          </button>

          <button
            onClick={() => onEdit(item)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(item.id)}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function GrocerySection({ title, items, emptyText, onToggle, onEdit, onDelete }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <GroceryCard
              key={item.id}
              item={item}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
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

  async function loadGroceriesAndFamily() {
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
    loadGroceriesAndFamily();
  }, []);

  function handleOpenCreate(listType = 'shopping') {
    setEditingItem({ list_type: listType });
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
      if (editingItem && editingItem.id) {
        await updateGroceryItem(editingItem.id, formData);
      } else {
        await addGroceryItem(formData);
      }

      setModalOpen(false);
      setEditingItem(null);
      await loadGroceriesAndFamily();
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
      await loadGroceriesAndFamily();
    } catch (error) {
      console.error('Failed to update grocery item:', error);
      setErrorText(error?.message || 'Failed to update grocery item');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this item?')) return;

    try {
      await deleteGroceryItem(id);
      await loadGroceriesAndFamily();
    } catch (error) {
      console.error('Failed to delete grocery item:', error);
      setErrorText(error?.message || 'Failed to delete grocery item');
    }
  }

  const grouped = useMemo(() => {
    const shoppingActive = [];
    const shoppingDone = [];
    const pantryActive = [];
    const pantryDone = [];

    for (const item of items) {
      if (item.list_type === 'pantry') {
        if (item.status === 'done') pantryDone.push(item);
        else pantryActive.push(item);
      } else {
        if (item.status === 'done') shoppingDone.push(item);
        else shoppingActive.push(item);
      }
    }

    return {
      shoppingActive,
      shoppingDone,
      pantryActive,
      pantryDone,
    };
  }, [items]);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Groceries & Pantry
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage shopping lists and pantry stock for the whole household.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleOpenCreate('shopping')}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Add Grocery
              </button>

              <button
                onClick={() => handleOpenCreate('pantry')}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Add Pantry Item
              </button>
            </div>
          </div>
        </div>

        {errorText ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorText}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Loading grocery data...
          </div>
        ) : (
          <div className="grid gap-8">
            <GrocerySection
              title="Shopping List"
              items={grouped.shoppingActive}
              emptyText="No active shopping items."
              onToggle={handleToggle}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />

            <GrocerySection
              title="Pantry"
              items={grouped.pantryActive}
              emptyText="No pantry items yet."
              onToggle={handleToggle}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />

            <GrocerySection
              title="Bought / Completed"
              items={[...grouped.shoppingDone, ...grouped.pantryDone]}
              emptyText="No completed items yet."
              onToggle={handleToggle}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

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
