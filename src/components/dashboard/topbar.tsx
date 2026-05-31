'use client';

import { useState } from 'react';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { RestaurantSwitcher } from './restaurant-switcher';
import { SidebarNavList } from './sidebar';
import { useAuth } from '@/lib/auth/auth-context';

function getInitials(displayName?: string, email?: string): string {
  if (displayName) {
    const parts = displayName.trim().split(' ');
    const first = parts[0]?.[0] ?? '';
    const last = parts[1]?.[0] ?? '';
    return (first + last).toUpperCase();
  }
  return email?.[0]?.toUpperCase() ?? '?';
}

export function Topbar() {
  const { currentUser, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = getInitials(currentUser?.displayName, currentUser?.email);
  const displayName = currentUser?.displayName ?? currentUser?.email ?? 'Usuario';

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-background px-4 gap-3">
      {/* Mobile menu toggle */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <button
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Abrir menú de navegación"
            />
          }
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </SheetTrigger>

        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border px-4 py-3.5">
            <SheetTitle className="flex items-baseline gap-1.5">
              <span>Mesa</span>
              <span className="text-xs font-normal text-muted-foreground">Admin</span>
            </SheetTitle>
          </SheetHeader>

          <div className="px-3 py-4">
            <SidebarNavList onNavigate={() => setMobileOpen(false)} />
          </div>

          <div className="mt-auto px-4 py-4 border-t border-border">
            <RestaurantSwitcher />
          </div>
        </SheetContent>
      </Sheet>

      {/* Restaurant switcher (desktop) */}
      <div className="hidden lg:flex">
        <RestaurantSwitcher />
      </div>

      {/* Spacer */}
      <div className="flex-1" role="none" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              className="inline-flex h-9 items-center gap-2 rounded-full pl-1 pr-2.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              aria-label="Menú de usuario"
            />
          }
        >
          <Avatar size="sm">
            {currentUser?.photoUrl && (
              <AvatarImage
                src={currentUser.photoUrl}
                alt={displayName}
              />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block text-sm font-medium max-w-[120px] truncate">
            {displayName}
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              {currentUser?.displayName && (
                <span className="text-sm font-medium">{currentUser.displayName}</span>
              )}
              {currentUser?.email && (
                <span className="text-xs text-muted-foreground truncate">
                  {currentUser.email}
                </span>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => {}}>
            <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            variant="destructive"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
