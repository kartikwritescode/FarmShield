import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const requestedRole = searchParams.get('role');
  const nextParam = searchParams.get('next');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dykjepfsrndzamkkzcxf.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_K8HRl4YEkhw1hcztFjJ7kA_bWfWg-rT',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session?.user) {
      const user = data.session.user;
      let authorizedRole = 'farmer';
      let userStatus = 'active';

      // =========================================================================
      // DATABASE AUTHORIZATION CHECK (Do NOT trust frontend state alone!)
      // =========================================================================
      try {
        const { data: dbUser } = await supabase
          .from('users')
          .select('id, email, role, status')
          .or(`id.eq.${user.id},email.eq.${user.email}`)
          .maybeSingle();

        if (dbUser?.role) {
          // Database record exists: strictly enforce database role and status
          authorizedRole = dbUser.role;
          userStatus = dbUser.status || 'active';
        } else {
          // New Google User: Provision in public.users
          const initialRole = requestedRole || 'farmer';
          authorizedRole = initialRole;

          // Government users default to 'pending' approval
          const isGov = initialRole.toLowerCase().trim() === 'government' || initialRole.toLowerCase().trim() === 'admin';
          userStatus = isGov ? 'pending' : 'active';

          await supabase.from('users').upsert({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            phone: user.phone || user.user_metadata?.phone || null,
            role: initialRole,
            status: userStatus,
          });
        }
      } catch (dbErr) {
        console.warn('Database user lookup error in auth callback:', dbErr);
        authorizedRole = user.user_metadata?.role || requestedRole || 'farmer';
      }

      // Standardize role to 'farmer' | 'vet' | 'government'
      let normalizedRole: 'farmer' | 'vet' | 'government' = 'farmer';
      const cleanRole = authorizedRole.toLowerCase().trim();
      if (cleanRole === 'government' || cleanRole === 'admin' || cleanRole === 'authority' || cleanRole === 'govt') {
        normalizedRole = 'government';
      } else if (cleanRole === 'vet' || cleanRole === 'veterinarian' || cleanRole === 'doctor') {
        normalizedRole = 'vet';
      } else {
        normalizedRole = 'farmer';
      }

      // Keep Supabase user_metadata synchronized with DB authoritative role and status
      if (user.user_metadata?.role !== normalizedRole || user.user_metadata?.status !== userStatus) {
        try {
          await supabase.auth.updateUser({
            data: { role: normalizedRole, status: userStatus },
          });
        } catch {}
      }

      // =========================================================================
      // WORKSPACE AUTHORIZATION & ROLE MATCHING GATEWAY
      // =========================================================================
      if (requestedRole) {
        let normalizedRequested: 'farmer' | 'vet' | 'government' = 'farmer';
        const cleanRequested = requestedRole.toLowerCase().trim();
        if (cleanRequested === 'government' || cleanRequested === 'admin') {
          normalizedRequested = 'government';
        } else if (cleanRequested === 'vet' || cleanRequested === 'veterinarian') {
          normalizedRequested = 'vet';
        }

        // If user selected a workspace on frontend that doesn't match their DB authorized role
        if (normalizedRequested !== normalizedRole) {
          return NextResponse.redirect(
            `${origin}/unauthorized?reason=workspace_unauthorized&requestedRole=${encodeURIComponent(normalizedRequested)}&actualRole=${encodeURIComponent(normalizedRole)}`
          );
        }
      }

      // =========================================================================
      // GOVERNMENT EXTRA AUTHORIZATION GATEWAY
      // =========================================================================
      if (normalizedRole === 'government') {
        const isApproved = userStatus === 'approved' || userStatus === 'active';
        if (!isApproved) {
          // Block unapproved government accounts and show clean authorization message
          return NextResponse.redirect(`${origin}/unauthorized?reason=government_pending`);
        }
      }

      let targetDashboard = nextParam;

      if (!targetDashboard || targetDashboard === '/') {
        if (normalizedRole === 'government') {
          targetDashboard = '/admin/dashboard';
        } else if (normalizedRole === 'vet') {
          targetDashboard = '/vet/dashboard';
        } else {
          targetDashboard = '/farmer/dashboard';
        }
      }

      return NextResponse.redirect(`${origin}${targetDashboard}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
