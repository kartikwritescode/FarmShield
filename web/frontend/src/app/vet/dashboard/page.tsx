'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { GovHeader } from '../../../components/ui/GovHeader';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from '../../../components/layout/MobileNav';
import { VetDashboardView } from '../../../components/dashboards/VetDashboardView';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function VetDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/vet/dashboard');
        return;
      }

      const rawRole = (user?.role || '').toLowerCase().trim();
      const isVetOrAdmin =
        rawRole === 'veterinarian' ||
        rawRole === 'vet' ||
        rawRole === 'doctor' ||
        rawRole === 'admin' ||
        rawRole === 'authority' ||
        rawRole === 'government';

      if (!isVetOrAdmin) {
        setAccessDenied(true);
        const timer = setTimeout(() => {
          router.replace('/farmer/dashboard');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans text-xs font-bold text-blue-800">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
        <span>Loading Veterinary Clinical Portal...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-slate-900 mb-1">Restricted Access</h2>
        <p className="text-sm text-slate-500 max-w-md mb-4">
          Your account is registered as a Farmer. Only licensed Veterinarians and Administrators have clinical workspace privileges. Redirecting to your Farmer dashboard...
        </p>
        <Loader2 className="w-5 h-5 animate-spin text-teal-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      <GovHeader />
      <Navbar currentRole={user?.role || 'veterinarian'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          <VetDashboardView />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
