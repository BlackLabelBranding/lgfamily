import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabaseClient.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Gift, 
  CheckCircle2, 
  Calendar, 
  Edit3, 
  Heart, 
  ShoppingBag,
  Loader2,
  ExternalLink,
  Info,
  Utensils,
  Palette,
  Ruler
} from 'lucide-react';

const LOGO_URL = "https://ttjdhzwowqaecnhycyfb.supabase.co/storage/v1/object/public/website%20photos/garzalogo.png";

function FamilyProfile() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, [memberId]);

  async function fetchProfileData() {
    setLoading(true);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', memberId)
        .single();

      if (memberError) throw memberError;
      setMember(memberData);
      setEditData(memberData);

      const { data: wishlistData } = await supabase
        .from('family_wishlists')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      setWishlist(wishlistData || []);
    } catch (err) {
      console.error("Error loading profile:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    const { error } = await supabase
      .from('family_members')
      .update({
        height: editData.height,
        weight: editData.weight,
        shoe_size: editData.shoe_size,
        clothes_size_top: editData.clothes_size_top,
        clothes_size_bottom: editData.clothes_size_bottom,
        favorite_color: editData.favorite_color,
        favorite_foods: editData.favorite_foods,
        favorite_restaurants: editData.favorite_restaurants
      })
      .eq('id', memberId);

    if (!error) {
      setMember(editData);
      setIsEditing(false);
    } else {
      alert("Error saving: " + error.message);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{member?.first_name}'s Profile - GarzaHub</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6 pb-24 px-2 sm:px-0">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/family')} 
          className="group rounded-xl hover:bg-blue-50 hover:text-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>

        {/* Identity Hero Card */}
        <Card className="overflow-hidden rounded-[2.5rem] border-none bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row text-center sm:text-left">
              <div className="h-24 w-24 shrink-0 rounded-[2rem] bg-white/10 p-4 backdrop-blur-xl border border-white/20">
                <img src={LOGO_URL} alt="GarzaHub" className="h-full w-full object-contain brightness-0 invert opacity-90" />
              </div>
              <div className="flex-1 space-y-2">
                <Badge className="bg-white/20 text-white border-none uppercase text-[10px] font-black tracking-widest px-3">
                  Family Member
                </Badge>
                <h1 className="text-4xl font-black tracking-tighter">
                  {member.first_name} <span className="text-blue-200">{member.last_name}</span>
                </h1>
                <p className="flex items-center justify-center sm:justify-start gap-2 text-blue-100 text-sm font-bold">
                  <Calendar className="h-4 w-4" /> 
                  {new Date(member.birth_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl bg-white text-blue-600 hover:bg-blue-50 shadow-lg font-bold px-6">
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Info
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tighter">Manage Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase ml-1">Height</Label>
                        <Input value={editData.height || ''} onChange={e => setEditData({...editData, height: e.target.value})} placeholder="5'11\"" className="rounded-xl bg-muted/50 border-0" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase ml-1">Weight</Label>
                        <Input value={editData.weight || ''} onChange={e => setEditData({...editData, weight: e.target.value})} placeholder="180 lbs" className="rounded-xl bg-muted/50 border-0" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase ml-1">Shoe</Label>
                        <Input value={editData.shoe_size || ''} onChange={e => setEditData({...editData, shoe_size: e.target.value})} placeholder="10.5" className="rounded-xl bg-muted/50 border-0" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase ml-1">Top</Label>
                        <Input value={editData.clothes_size_top || ''} onChange={e => setEditData({...editData, clothes_size_top: e.target.value})} placeholder="Large" className="rounded-xl bg-muted/50 border-0" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase ml-1">Bottom</Label>
                        <Input value={editData.clothes_size_bottom || ''} onChange={e => setEditData({...editData, clothes_size_bottom: e.target.value})} placeholder="34/32" className="rounded-xl bg-muted/50 border-0" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase ml-1">Favorite Color</Label>
                      <Input value={editData.favorite_color || ''} onChange={e => setEditData({...editData, favorite_color: e.target.value})} className="rounded-xl bg-muted/50 border-0" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase ml-1">Favorite Foods</Label>
                      <Input value={editData.favorite_foods || ''} onChange={e => setEditData({...editData, favorite_foods: e.target.value})} className="rounded-xl bg-muted/50 border-0" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase ml-1">Favorite Restaurants</Label>
                      <Input value={editData.favorite_restaurants || ''} onChange={e => setEditData({...editData, favorite_restaurants: e.target.value})} className="rounded-xl bg-muted/50 border-0" />
                    </div>
                    <Button onClick={handleSaveProfile} className="w-full bg-blue-600 hover:bg-blue-700 rounded-2xl h-12 font-bold shadow-lg shadow-blue-600/20 mt-2">
                      Save GarzaHub Profile
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Sizes & Measurements Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Shoe Size', value: member.shoe_size, icon: ShoppingBag },
            { label: 'Top Size', value: member.clothes_size_top, icon: Ruler },
            { label: 'Bottom', value: member.clothes_size_bottom, icon: Ruler },
            { label: 'Height', value: member.height, icon: Info },
          ].map((item, i) => (
            <Card key={i} className="rounded-3xl border-muted/50 shadow-sm overflow-hidden">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                <item.icon className="h-4 w-4 text-blue-500 mb-1" />
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                <p className="text-lg font-black text-foreground">{item.value || '—'}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Deep Details Section */}
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Favorites Card */}
          <Card className="rounded-[2.5rem] border-muted/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Palette className="h-4 w-4 text-blue-600" /> Favorites
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Palette className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Color</p>
                  <p className="text-sm font-bold capitalize">{member.favorite_color || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Utensils className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Foods & Cuisines</p>
                  <p className="text-sm font-bold">{member.favorite_foods || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Restaurants</p>
                  <p className="text-sm font-bold">{member.favorite_restaurants || 'Not set'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wishlist Card */}
          <Card className="rounded-[2.5rem] border-muted/50 shadow-sm overflow-hidden border-pink-100 bg-gradient-to-b from-white to-pink-50/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-pink-600 flex items-center gap-2">
                <Gift className="h-4 w-4" /> Gift Wishlist
              </CardTitle>
              <Button size="sm" variant="ghost" className="h-8 rounded-xl text-[10px] font-black text-pink-600">Add Item</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wishlist.length > 0 ? (
                  wishlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-pink-100 shadow-sm group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-500">
                          <Heart className="h-4 w-4 fill-current" />
                        </div>
                        <span className="text-sm font-bold text-foreground">{item.item_name}</span>
                      </div>
                      {item.item_url && (
                        <a href={item.item_url} target="_blank" rel="noreferrer" className="text-pink-400 hover:text-pink-600">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No items found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}

export default FamilyProfile;
