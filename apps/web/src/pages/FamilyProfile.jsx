import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Gift, 
  CheckCircle2, 
  Calendar, 
  Edit3, 
  Heart, 
  ShoppingBag,
  Loader2,
  ExternalLink
} from 'lucide-react';

const LOGO_URL = "https://ttjdhzwowqaecnhycyfb.supabase.co/storage/v1/object/public/website%20photos/garzalogo.png";

function FamilyProfile() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [memberId]);

  async function fetchProfileData() {
    setLoading(true);
    try {
      // 1. Fetch Member Details
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (memberError) throw memberError;
      setMember(memberData);

      // 2. Fetch Wishlist Items
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('family_wishlists')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (!wishlistError) setWishlist(wishlistData || []);
    } catch (err) {
      console.error("Error loading profile:", err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Member not found</h2>
        <Button onClick={() => navigate('/family')} className="mt-4 rounded-xl">Back to Family</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{member.first_name}'s Profile - GarzaHub</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/family')} 
          className="group rounded-xl hover:bg-blue-50 hover:text-blue-600 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Family
        </Button>

        {/* Identity Hero Card */}
        <Card className="overflow-hidden rounded-[2.5rem] border-none bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-2xl shadow-blue-500/20">
          <CardContent className="p-8 sm:p-10">
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:text-left text-center">
              {/* Profile Avatar Container */}
              <div className="relative h-32 w-32 shrink-0 rounded-[2rem] bg-white/10 p-4 backdrop-blur-xl border border-white/20 shadow-inner">
                <img src={LOGO_URL} alt="GarzaHub" className="h-full w-full object-contain brightness-0 invert opacity-90" />
              </div>

              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <Badge className="bg-white/20 text-white hover:bg-white/30 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Household Member
                  </Badge>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">
                    {member.first_name} <span className="text-blue-200">{member.last_name}</span>
                  </h1>
                </div>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-blue-100 font-medium text-sm">
                  <span className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-xl">
                    <Calendar className="h-4 w-4" /> 
                    {new Date(member.birth_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <Button className="h-12 w-12 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 transition-all hover:scale-105 shadow-lg">
                <Edit3 className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Stats Card */}
          <Card className="rounded-[2rem] border-muted/50 shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 p-5 rounded-3xl text-center border border-transparent hover:border-muted transition-colors">
                <p className="text-3xl font-black text-foreground">0</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Tasks Done</p>
              </div>
              <div className="bg-muted/30 p-5 rounded-3xl text-center border border-transparent hover:border-muted transition-colors">
                <p className="text-3xl font-black text-foreground">0</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Events</p>
              </div>
            </CardContent>
          </Card>

          {/* Wishlist Card */}
          <Card className="rounded-[2rem] border-muted/50 shadow-sm bg-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-pink-50/30 border-b border-pink-100/50 pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-pink-600 flex items-center gap-2">
                <Gift className="h-4 w-4" /> Wishlist
              </CardTitle>
              <Button size="sm" variant="ghost" className="h-8 rounded-xl text-[10px] font-black uppercase text-pink-600 hover:bg-pink-100 hover:text-pink-700">
                Manage
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {wishlist.length > 0 ? (
                  wishlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-muted transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-500">
                          <Heart className="h-4 w-4 fill-current" />
                        </div>
                        <span className="text-sm font-bold text-foreground">{item.item_name}</span>
                      </div>
                      {item.item_url && (
                        <a href={item.item_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-blue-600">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <div className="h-12 w-12 bg-pink-50 text-pink-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">List is empty</p>
                  </div>
                )}
                
                <p className="text-[10px] text-center text-muted-foreground/60 italic px-4">
                  Add items for Christmas or Birthdays. Family members can see this list to help with gift ideas!
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}

export default FamilyProfile;
