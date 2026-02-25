import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getUserRole, getDashboardRoute, type DashboardRole } from '@/lib/user-role';

const PROTECTED_ROUTES = ['/dashboard', '/perfil', '/suscripcion', '/facturacion', '/clinica', '/admin'];
const AUTH_ROUTES = ['/login', '/registro'];

const DASHBOARD_ROLE_PATHS: Record<DashboardRole, string> = {
  super_admin: '/dashboard/super-admin',
  clinic_admin: '/dashboard/clinica',
  empresa_admin: '/dashboard/empresa',
  doctor: '/dashboard/doctor',
};

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip auth when Supabase is not configured (e.g. missing .env.local)
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch {
    // Auth check failed; allow request through without user
  }

  const pathname = request.nextUrl.pathname;

  // Redirect authenticated users away from auth routes → role-specific dashboard
  if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    try {
      const role = await getUserRole(supabase, user.id, user);
      const dashboardPath = getDashboardRoute(role);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    } catch {
      return NextResponse.redirect(new URL('/dashboard/doctor', request.url));
    }
  }

  // Redirect unauthenticated users from protected routes
  if (!user && PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based dashboard routing: /dashboard or /dashboard/ → redirect to role-specific
  if (user && (pathname === '/dashboard' || pathname === '/dashboard/')) {
    try {
      const role = await getUserRole(supabase, user.id, user);
      const dashboardPath = getDashboardRoute(role);
      return NextResponse.redirect(new URL(dashboardPath, request.url));
    } catch {
      return NextResponse.redirect(new URL('/dashboard/doctor', request.url));
    }
  }

  // Guard: user accessing wrong dashboard route → redirect to their correct one
  if (user && pathname.startsWith('/dashboard/')) {
    try {
      const role = await getUserRole(supabase, user.id, user);
      const allowedPath = DASHBOARD_ROLE_PATHS[role];
      if (!pathname.startsWith(allowedPath)) {
        return NextResponse.redirect(new URL(allowedPath, request.url));
      }
    } catch {
      // Fallback: allow request through to let the page handle it
    }
  }

  // Admin route: only super_admin or ADMIN_EMAILS can access
  if (user && pathname.startsWith('/admin')) {
    try {
      const role = await getUserRole(supabase, user.id, user);
      const adminEmails = (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      const isAdminByEmail = adminEmails.includes((user.email ?? '').toLowerCase());
      const isAdmin = role === 'super_admin' || isAdminByEmail;
      if (!isAdmin) {
        const dashboardPath = getDashboardRoute(role);
        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/dashboard/doctor', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
