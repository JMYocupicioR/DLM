import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  User,
  CreditCard,
  Receipt,
  BarChart3,
  LifeBuoy,
  Shield,
} from 'lucide-react';
import type { DashboardRole } from '@/lib/user-role';
import { getDashboardRoute } from '@/lib/user-role';

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function getAppNavItems(role: DashboardRole): AppNavItem[] {
  const home = getDashboardRoute(role);
  const items: AppNavItem[] = [
    { href: home, label: 'Inicio', icon: LayoutDashboard },
  ];

  if (role === 'super_admin') {
    items.push({ href: '/admin', label: 'Administración', icon: Shield });
  }

  items.push(
    { href: '/perfil', label: 'Perfil', icon: User },
    { href: '/suscripcion', label: 'Suscripción', icon: CreditCard },
    { href: '/facturacion', label: 'Facturación', icon: Receipt },
    { href: '/uso', label: 'Uso', icon: BarChart3 },
    { href: '/soporte', label: 'Soporte', icon: LifeBuoy }
  );

  return items;
}
