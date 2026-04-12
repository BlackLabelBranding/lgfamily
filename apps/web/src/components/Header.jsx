import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
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
import { useNotifications } from '@/hooks/useNotifications';

function Header() {
  const { notifications, unreadCount } = useNotifications();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        
        {/* Search Bar - Hidden on mobile, visible on small screens up */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search FamilyHub..."
              className="h-10 rounded-xl border-0 bg-muted pl-10 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Mobile Logo/Title Placeholder (Visible only on mobile) */}
        <div className="md:hidden font-bold text-primary">FamilyHub</div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] font-bold"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[calc(100vw-32px)] sm:w-80 rounded-2xl mt-2">
              <DropdownMenuLabel className="font-bold">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[60vh] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-3 focus:bg-muted cursor-pointer border-b last:border-0">
                      <p className={`text-sm font-semibold ${!n.read ? 'text-blue-600' : 'text-foreground'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.message}
                      </p>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    All caught up!
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
                  <User className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl mt-2">
              <DropdownMenuLabel className="flex flex-col">
                <span className="font-bold">Lance Garza</span>
                <span className="text-[10px] text-muted-foreground font-normal">Household Admin</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg">Profile Settings</DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg">Household Members</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg text-red-500 focus:bg-red-50 focus:text-red-600">
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
