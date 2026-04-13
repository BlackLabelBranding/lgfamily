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
  DialogDescription,
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
  Ruler,
  Plus
} from 'lucide-react';

const LOGO_URL = "https://ttjdhzwowqaecnhycyfb.supabase.co/storage/v1/object/public/website%20photos/garzalogo.png";

function FamilyProfile() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishSaving, setWishSaving] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isAddingWish, setIsAddingWish] = useState(false);
  const [newWish, setNewWish] = useState({ item_name: '', item_url: '' });

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
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    const { error } = await supabase
      .from('family_members')
      .update({
        birth_date: editData.birth_date,
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
      fetchProfileData();
    }
  }

  async function handleAddWishlist() {
    if (!newWish.item_name.trim()) return;
    setWishSaving(true);
    const { error } = await supabase
      .from('family_wishlists')
      .insert([{ 
        member_id: memberId, 
        item_name: newWish.item_name.trim(), 
        item_url: newWish.item_url.trim() 
      }]);

    if (!error) {
      setNewWish({ item_name: '', item_url: '' });
      setIsAddingWish(false);
      const { data } = await supabase
        .from('family_wishlists')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });
      setWishlist(data || []);
    }
    setWishSaving(false);
  }

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>;

  return (
    <>
      <Helmet><title>{member?.first_name}'s Profile - GarzaHub</title></Helmet>

      <div className="max-w-4xl mx-auto space-y-6 pb-24 px-2 sm:px-0">
        <Button variant="ghost" onClick={() => navigate('/family')} className="group rounded-xl hover:bg-white/50 text-slate-600">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Family
        </Button>

        {/* Hero Card */}
        <Card className="overflow-hidden rounded-[2.5rem] border-none bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl">
          <CardContent className="p-8 text-center sm:text-left">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="h-24 w-24 shrink-0 rounded-[2rem] bg-white/10 p-4 backdrop-blur-xl border border-white/10">
                <img src={LOGO_URL} alt="Logo" className="h-full w-full object-contain brightness-0 invert opacity-90" />
              </div>
              <div className="flex-1 space-y-2">
                <Badge className="bg-blue-600 text-white border-none uppercase text-[10px] font-black tracking-widest px-3">Garza Member</Badge>
                <h1 className="text-4xl font-black tracking-tighter">{member.first_name} {member.last_name}</h1>
                <p className="flex items-center justify-center sm:justify-start gap-2 text-slate-300 text-sm font-bold">
                  <Calendar className="h-4 w-4 text-blue-400" /> {new Date(member.birth_date).toLocaleDateString()}
                </p>
              </div>
              
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-lg font-bold"><Edit3 className="mr-2 h-4 w-4" /> Edit Info</Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] sm:max-w-[450px] border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tighter">Manage Details</DialogTitle>
                    <DialogDescription>Correct birthday, sizing, and preferences.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase ml-1 text-slate-500">Birthday</Label>
                      <Input 
                        type="date" 
                        value={editData.birth_date || ''} 
                        onChange={e => setEditData({...editData, birth_date: e.target.value})} 
                        className="rounded-xl border-0 bg-slate-100 h-12" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500">Height</Label><Input value={editData.height || ''} onChange={e => setEditData({...editData, height: e.target.value})} placeholder="5ft 11in" className="rounded-xl border-0 bg-slate-100 h-11" /></div>
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500">Weight</Label><Input value={editData.weight || ''} onChange={e => setEditData({...editData, weight: e.target.value})} placeholder="180 lbs" className="rounded-xl border-0 bg-slate-100 h-11" /></div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500">Shoe</Label><Input value={editData.shoe_size || ''} onChange={e => setEditData({...editData, shoe_size: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-11" /></div>
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500">Top</Label><Input value={editData.clothes_size_top || ''} onChange={e => setEditData({...editData, clothes_size_top: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-11" /></div>
                      <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500">Bottom</Label><Input value={editData.clothes_size_bottom || ''} onChange={e => setEditData({...editData, clothes_size_bottom: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-11" /></div>
                    </div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500">Favorite Color</Label><Input value={editData.favorite_color || ''} onChange={e => setEditData({...editData, favorite_color: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-11" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500">Favorite Foods</Label><Input value={editData.favorite_foods || ''} onChange={e => setEditData({...editData, favorite_foods: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-11" /></div>
                    <div className="space-y-1"><Label className="text-[10px] font-black uppercase text-slate-500">Restaurants</Label><Input value={editData.favorite_restaurants || ''} onChange={e => setEditData({...editData, favorite_restaurants: e.target.value})} className="rounded-xl border-0 bg-slate-100 h-11" /></div>
                    
                    <div className="pt-2">
                      <Button onClick={handleSaveProfile} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-blue-600/20">Save Garza Profile</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Quick Sizes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Shoe Size', value: member.shoe_size, icon: ShoppingBag },
            { label: 'Top Size', value: member.clothes_size_top, icon: Ruler },
            { label: 'Bottom', value: member.clothes_size_bottom, icon: Ruler },
            { label: 'Height', value: member.height, icon: Info },
          ].map((item, i) => (
            <Card key={i} className="rounded-3xl border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md">
              <CardContent className="p-5 text-center">
                <item.icon className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                <p className="text-xl font-black text-slate-900">{item.value || '—'}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Favorites */}
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-md overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2"><Palette className="h-4 w-4 text-blue-600" /> Personal Favorites</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-blue-600 shadow-inner"><Palette className="h-5 w-5" /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-400">Favorite Color</p><p className="text-sm font-bold text-slate-900">{member.favorite_color || 'Not set'}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 text-orange-600 shadow-inner"><Utensils className="h-5 w-5" /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-400">Foods & Snacks</p><p className="text-sm font-bold text-slate-900">{member.favorite_foods || 'Not set'}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 text-emerald-600 shadow-inner"><ShoppingBag className="h-5 w-5" /></div>
                <div><p className="text-[10px] font-black uppercase text-slate-400">Go-to Restaurants</p><p className="text-sm font-bold text-slate-900">{member.favorite_restaurants || 'Not set'}</p></div>
              </div>
            </CardContent>
          </Card>

          {/* Wishlist */}
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-pink-200/20 bg-white/90 backdrop-blur-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-pink-50 pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-pink-600 flex items-center gap-2"><Gift className="h-4 w-4" /> Gift Wishlist</CardTitle>
              <Dialog open={isAddingWish} onOpenChange={setIsAddingWish}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 rounded-xl text-[10px] font-black text-pink-600 hover:bg-pink-50"><Plus className="h-3 w-3 mr-1" /> Add Item</Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-black text-2xl tracking-tighter">Add Gift Idea</DialogTitle>
                    <DialogDescription>Save items for birthdays or holidays.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Item Name</Label>
                      <Input value={newWish.item_name} onChange={e => setNewWish({...newWish, item_name: e.target.value})} placeholder="e.g. Golf Clubs" className="rounded-xl border-0 bg-slate-100 h-12" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Store Link</Label>
                      <Input value={newWish.item_url} onChange={e => setNewWish({...newWish, item_url: e.target.value})} placeholder="https://..." className="rounded-xl border-0 bg-slate-100 h-12" />
                    </div>
                    <Button onClick={handleAddWishlist} disabled={wishSaving} className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-2xl h-12 font-bold shadow-lg shadow-pink-600/20">
                      {wishSaving ? "Adding..." : "Add to Wishlist"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {wishlist.length > 0 ? (
                  wishlist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-500"><Heart className="h-4 w-4 fill-current" /></div>
                        <span className="text-sm font-bold text-slate-900">{item.item_name}</span>
                      </div>
                      {item.item_url && (
                        <a href={item.item_url} target="_blank" rel="noreferrer" className="text-pink-400 hover:text-pink-600 transition-transform hover:scale-110"><ExternalLink className="h-4 w-4" /></a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 italic text-xs font-bold uppercase tracking-widest">No items found</div>
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
