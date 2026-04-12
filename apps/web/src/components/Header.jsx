import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications.js';

const LOGO_URL = "https://ttjdhzwowqaecnhycyfb.supabase.co/storage/v1/object/public/website%20photos/garzalogo.png";

function Header() {
  const { notifications, unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        
        {/* Search Bar - Hidden on mobile, visible on medium screens+ */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search GarzaHub..."
              className="h-10 rounded-xl border-0 bg-muted pl-10 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Mobile Branding - Centered on mobile since Sidebar button is on the left */}
        <div className="md:hidden flex items-center gap-2 ml-12">
          <img 
            src={LOGO_URL} 
            alt="Logo" 
            className="h-7 w-7 object-contain"
          />
          <span className="font-black tracking-tighter text-blue-600">GarzaHub</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] font-bold shadow-sm"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[calc(100vw-32px)] sm:w-80 rounded-2xl mt-2 shadow-xl border-border/50">
              <DropdownMenuLabel className="font-bold px-4 py-3">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[60vh] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-4 px-4 focus:bg-muted cursor-pointer border-b last:border-0">
                      <p className={`text-sm font-bold ${!n.read ? 'text-blue-600' : 'text-foreground'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.message}
                      </p>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                       <Bell className="h-5 w-5 opacity-20" />
                    </div>
                    All caught up!
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile - Branded with Garza Logo as fallback/avatar base */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl overflow-hidden border border-transparent hover:border-muted">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted p-1">
                  <img src={LOGO_URL} alt="User" className="h-full w-full object-contain" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-60 rounded-2xl mt-2 shadow-xl">
              <DropdownMenuLabel className="flex flex-col px-4 py-3">
                <span className="font-black text-foreground">Lance Garza</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Admin • Household</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg m-1 py-2 cursor-pointer">Profile Settings</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg m-1 py-2 cursor-pointer">Household Members</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg m-1 py-2 text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
