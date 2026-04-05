import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '@/components/Sidebar.jsx';
import Header from '@/components/Header.jsx';
import FamilyMemberCard from '@/components/FamilyMemberCard.jsx';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { addFamilyMember, getFamilyMembers } from '@/lib/family.js';

function FamilyPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  async function handleAddMember() {
    const firstName = window.prompt('First name');
    if (!firstName) return;

    const lastName = window.prompt('Last name (optional)') || '';
    const relationship = window.prompt('Relationship (self, partner, child, mother, father, etc.)') || 'family';
    const birthDate = window.prompt('Birth date (YYYY-MM-DD, optional)') || '';

    try {
      setSaving(true);

      const displayName = [firstName, lastName].filter(Boolean).join(' ').trim();

      await addFamilyMember({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: displayName || firstName.trim(),
        relationship: relationship.trim(),
        birth_date: birthDate.trim() || null,
      });

      await loadMembers();
    } catch (err) {
      console.error('Error adding family member:', err);
      alert(err.message || 'Failed to add family member.');
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
                  <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Family
                  </h1>
                  <p className="text-muted-foreground">
                    Real household members from Supabase
                  </p>
                </div>

                <Button
                  className="gap-2 touch-target"
                  onClick={handleAddMember}
                  disabled={saving}
                >
                  <Plus className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Add member'}
                </Button>
              </div>

              {loading && (
                <p className="text-muted-foreground">Loading family...</p>
              )}

              {error && (
                <p className="text-sm text-red-500 mb-4">{error}</p>
              )}

              {!loading && !error && members.length === 0 && (
                <p className="text-muted-foreground">No family members yet.</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => {
                  const fullName =
                    member.display_name ||
                    [member.first_name, member.last_name].filter(Boolean).join(' ').trim();

                  const initials = `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}` || '?';

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
    </>
  );
}

export default FamilyPage;
