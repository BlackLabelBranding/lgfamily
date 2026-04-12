import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, User, Calendar, ArrowRight, Loader2 } from 'lucide-react';

const LOGO_URL = "https://ttjdhzwowqaecnhycyfb.supabase.co/storage/v1/object/public/website%20photos/garzalogo.png";
const HOUSEHOLD_ID = 'd2b8464e-a258-46a0-89de-a1b921062943';

function FamilyPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('household_id', HOUSEHOLD_ID)
      .order('created_at', { ascending: true });

    if (!error) setMembers(data || []);
    setLoading(false);
  }

  return (
    <>
      <Helmet>
        <title>Family - GarzaHub</title>
      </Helmet>

      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">Family</h1>
            <p className="text-muted-foreground">Manage your household members and their profiles.</p>
          </div>
          <Button className="rounded-2xl shadow-lg shadow-blue-600/20 bg-blue-600 hover:bg-blue-700 gap-2 h-11 px-6">
            <Plus className="h-4 w-4" />
            <span>Add Member</span>
          </Button>
        </div>

        {/* Members Grid */}
        {loading ? (
          <div className="flex flex-col items-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
            <p className="font-medium">Loading the Garza family...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((member) => (
              <Link 
                key={member.id} 
                to={`/family/${member.id}`}
                className="group block transition-all duration-200 active:scale-95"
              >
                <Card className="relative overflow-hidden rounded-[2rem] border-muted/50 bg-card transition-all group-hover:border-blue-500/50 group-hover:shadow-xl group-hover:shadow-blue-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Branded Avatar Placeholder */}
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-muted p-3 transition-transform group-hover:rotate-3">
                        <img 
                          src={LOGO_URL} 
                          alt="GarzaHub" 
                          className="h-full w-full object-contain opacity-80" 
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="truncate text-lg font-black tracking-tight">
                            {member.first_name}
                          </h2>
                          <Badge variant="secondary" className="rounded-lg bg-blue-50 text-[10px] font-bold uppercase text-blue-600 border-none px-2 py-0">
                            {member.id === '00000000-0000-0000-0000-000000000000' ? 'Self' : 'Member'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            {member.first_name} {member.last_name}
                          </p>
                          {member.birth_date && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(member.birth_date).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-full p-2 text-muted-foreground/30 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Empty Add Member Slot */}
            <button className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-muted p-8 text-muted-foreground transition-all hover:border-blue-500/50 hover:bg-blue-50/50 hover:text-blue-600">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted group-hover:bg-blue-100">
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold uppercase tracking-widest">New Slot</p>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default FamilyPage;
