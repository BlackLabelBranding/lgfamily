import React, { useEffect, useState } from 'react';
import { getFamilyMembers, addFamilyMember } from '@/lib/family.js';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users } from 'lucide-react';

function formatBirthDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString();
}

function FamilyModal({ open, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    display_name: '',
    relationship: 'family',
    birth_date: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        first_name: '',
        last_name: '',
        display_name: '',
        relationship: 'family',
        birth_date: '',
        notes: '',
      });
    }
  }, [open]);

  if (!open) return null;

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.first_name.trim()) return;

    await onSave({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim() || null,
      display_name: form.display_name.trim() || form.first_name.trim(),
      relationship: form.relationship || 'family',
      birth_date: form.birth_date || null,
      notes: form.notes.trim() || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Add Family Member</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add someone to your household directory.
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                placeholder="Jacey"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                placeholder="Garza"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Display Name</label>
              <input
                type="text"
                value={form.display_name}
                onChange={(e) => updateField('display_name', e.target.value)}
                placeholder="Jacey"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Relationship</label>
              <select
                value={form.relationship}
                onChange={(e) => updateField('relationship', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                <option value="family">Family</option>
                <option value="parent">Parent</option>
                <option value="mom">Mom</option>
                <option value="dad">Dad</option>
                <option value="spouse">Spouse</option>
                <option value="fiance">Fiance</option>
                <option value="partner">Partner</option>
                <option value="daughter">Daughter</option>
                <option value="son">Son</option>
                <option value="step son">Step Son</option>
                <option value="step daughter">Step Daughter</option>
                <option value="sister">Sister</option>
                <option value="brother">Brother</option>
                <option value="grandparent">Grandparent</option>
                <option value="grandmother">Grandmother</option>
                <option value="grandfather">Grandfather</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Birth Date</label>
              <input
                type="date"
                value={form.birth_date}
                onChange={(e) => updateField('birth_date', e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Optional notes"
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
              disabled={saving || !form.first_name.trim()}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FamilyPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadMembers() {
    setLoading(true);
    setErrorText('');

    try {
      const data = await getFamilyMembers();
      setMembers(data || []);
    } catch (error) {
      console.error('Failed to load family members:', error);
      setErrorText(error?.message || 'Failed to load family members');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function handleSaveMember(formData) {
    setSaving(true);
    setErrorText('');

    try {
      await addFamilyMember(formData);
      setModalOpen(false);
      await loadMembers();
    } catch (error) {
      console.error('Failed to save family member:', error);
      setErrorText(error?.message || 'Failed to save family member');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
            Family
          </h1>
          <p className="text-muted-foreground">Manage your household members</p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {errorText ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorText}
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading family members...</div>
      ) : members.length === 0 ? (
        <div className="text-sm text-muted-foreground">No family members yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base text-slate-900">
                        {member.display_name || member.first_name}
                      </h3>

                      {member.relationship ? (
                        <Badge variant="secondary" className="text-xs">
                          {member.relationship}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      {member.first_name || member.last_name ? (
                        <p>
                          Name: {[member.first_name, member.last_name].filter(Boolean).join(' ')}
                        </p>
                      ) : null}

                      {member.birth_date ? (
                        <p>Birthday: {formatBirthDate(member.birth_date)}</p>
                      ) : null}

                      {member.notes ? (
                        <p className="pt-1">{member.notes}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FamilyModal
        open={modalOpen}
        onClose={() => {
          if (!saving) setModalOpen(false);
        }}
        onSave={handleSaveMember}
        saving={saving}
      />
    </div>
  );
}

export default FamilyPage;
