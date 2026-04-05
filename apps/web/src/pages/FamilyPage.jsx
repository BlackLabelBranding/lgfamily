import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import FamilyMemberCard from '@/components/FamilyMemberCard.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { addFamilyMember, getFamilyMembers } from '@/lib/family.js';

function FamilyPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    relationship: '',
    birth_date: '',
    notes: '',
  });

  async function loadMembers() {
    try {
      const data = await getFamilyMembers();
      setMembers(data);
      setError('');
    } catch (err) {
      console.error('Error loading family members:', err);
      setError(err.message || 'Failed to load family members.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm({
      first_name: '',
      last_name: '',
      relationship: '',
      birth_date: '',
      notes: '',
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.first_name.trim()) {
      setError('First name is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const displayName = [form.first_name, form.last_name]
        .filter(Boolean)
        .join(' ')
        .trim();

      await addFamilyMember({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        display_name: displayName || form.first_name.trim(),
        relationship: form.relationship.trim() || 'family',
        birth_date: form.birth_date || null,
        notes: form.notes.trim() || null,
      });

      resetForm();
      setOpen(false);
      await loadMembers();
    } catch (err) {
      console.error('Error adding family member:', err);
      setError(err.message || 'Failed to add family member.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Family - FamilyHub</title>
        <meta name="description" content="Manage family members and contacts" />
      </Helmet>

      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    Family
                  </h1>
                  <p className="text-muted-foreground">
                    Real household members from Supabase
                  </p>
                </div>

                <Button
                  className="gap-2 touch-target"
                  onClick={() => setOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add member
                </Button>
              </div>

              {loading && (
                <p className="text-muted-foreground">Loading family...</p>
              )}

              {error && !open && (
                <p className="text-sm text-red-500 mb-4">{error}</p>
              )}

              {!loading && !error && members.length === 0 && (
                <p className="text-muted-foreground">No family members yet.</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => {
                  const fullName =
                    member.display_name ||
                    [member.first_name, member.last_name]
                      .filter(Boolean)
                      .join(' ')
                      .trim();

                  const initials =
                    `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}` ||
                    '?';

                  return (
                    <FamilyMemberCard
                      key={member.id}
                      member={{
                        name: fullName,
                        initials,
                        role: member.relationship || 'family',
                        email: null,
                        phone: null,
                        birthday: member.birth_date || null,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add family member</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && open && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  value={form.first_name}
                  onChange={(e) => updateField('first_name', e.target.value)}
                  placeholder="Lance"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  value={form.last_name}
                  onChange={(e) => updateField('last_name', e.target.value)}
                  placeholder="Garza"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={form.relationship}
                onChange={(e) => updateField('relationship', e.target.value)}
                placeholder="self, partner, child, mother, father"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Birth date</Label>
              <Input
                id="birth_date"
                type="date"
                value={form.birth_date}
                onChange={(e) => updateField('birth_date', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Optional notes"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FamilyPage;
