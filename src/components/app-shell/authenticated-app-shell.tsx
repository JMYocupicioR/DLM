'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import DeepLuxLogo from '@/components/deeplux-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { getAppNavItems } from '@/lib/app-nav';
import type { DashboardRole } from '@/lib/user-role';
import { getDashboardRoute } from '@/lib/user-role';
import { createClient } from '@/lib/supabase/client';
import { NotificationsMenu } from '@/components/app-shell/notifications-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import dynamic from 'next/dynamic';

const AiAssistant = dynamic(() => import('@/components/ai-assistant'), { ssr: false });

export function AuthenticatedAppShell({
  children,
  role,
  userEmail,
  publicProfileSlug,
  initials,
}: {
  children: React.ReactNode;
  role: DashboardRole;
  userEmail: string | undefined;
  publicProfileSlug: string | null;
  initials: string;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const nav = getAppNavItems(role);
  const home = getDashboardRoute(role);

  async function signOut() {
    const sb = createClient();
    await sb.auth.signOut();
    window.location.href = '/login';
  }

  function linkActive(href: string) {
    if (href === home) return pathname === home;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1 py-2 px-2">
      {nav.map((item) => {
        const Icon = item.icon;
        const active = linkActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="hidden md:flex w-56 flex-col border-r border-border bg-sidebar text-sidebar-foreground shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border">
          <Link href={home} className="flex items-center gap-2 cursor-pointer">
            <DeepLuxLogo size="sm" />
          </Link>
        </div>
        <NavLinks />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/95 backdrop-blur flex items-center justify-between px-3 md:px-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0 cursor-pointer"
                  aria-label="Menú"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-60 p-0 flex flex-col bg-sidebar text-sidebar-foreground">
                <div className="p-4 border-b border-sidebar-border">
                  <Link href={home} className="flex items-center gap-2 cursor-pointer">
                    <DeepLuxLogo size="sm" />
                  </Link>
                </div>
                <NavLinks onNavigate={() => setMobileNavOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="text-sm text-muted-foreground truncate hidden sm:block font-medium">
              {pathname === home ? 'Inicio' : pathname.replace(/^\//, '').split('/').slice(0, 2).join(' / ')}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <NotificationsMenu />
            <ThemeToggle className="cursor-pointer shrink-0" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="rounded-full cursor-pointer shrink-0"
                  aria-label="Cuenta"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{userEmail}</div>
                <DropdownMenuSeparator />
                {publicProfileSlug ? (
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/dr/${publicProfileSlug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                    >
                      Ver perfil público
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                  <Link href="/perfil" className="cursor-pointer">
                    Editar perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void signOut()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <AiAssistant />
      </div>
    </div>
  );
}
