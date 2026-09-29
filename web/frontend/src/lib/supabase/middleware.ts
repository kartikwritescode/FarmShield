import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dykjepfsrndzamkkzcxf.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_K8HRl4YEkhw1hcztFjJ7kA_bWfWg-rT';

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Direct Supabase session lookup
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes that anyone can access without authentication
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/unauthorized') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/qr/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.includes('favicon.ico');

  // Extract active role from Supabase user metadata or persistent session cookie
  let activeRole = user?.user_metadata?.role as string | undefined;

  const mockAuthCookie = request.cookies.get('farmshield_mock_auth')?.value;
  let parsedMockUser: any = null;
  if (mockAuthCookie) {
    try {
      parsedMockUser = JSON.parse(decodeURIComponent(mockAuthCookie));
      if (!activeRole && parsedMockUser?.role) {
        activeRole = parsedMockUser.role;
      }
    } catch {}
  }

  const isAuthenticated = Boolean(user || parsedMockUser);
  const normalizedRole = (activeRole || '').toLowerCase().trim();

  // Authentication check for protected routes
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/vet') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/treatments') ||
    pathname.startsWith('/lab-results') ||
    pathname.startsWith('/reports') ||
    (!isPublicRoute && pathname !== '/');

  if (isProtectedPath && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // RBAC route protection
  // 1. Admin-only routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (normalizedRole !== 'admin' && normalizedRole !== 'authority' && normalizedRole !== 'administrator') {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      url.searchParams.set('required', 'admin');
      return NextResponse.redirect(url);
    }
  }

  // 2. Veterinarian-restricted routes (/vet/*)
  if (pathname.startsWith('/vet')) {
    const isVetOrAdmin =
      normalizedRole === 'veterinarian' ||
      normalizedRole === 'vet' ||
      normalizedRole === 'doctor' ||
      normalizedRole === 'admin' ||
      normalizedRole === 'authority';

    if (!isVetOrAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      url.searchParams.set('required', 'veterinarian');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
