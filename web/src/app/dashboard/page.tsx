'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { GovHeader } from '../../components/ui/GovHeader';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileNav } from '../../components/layout/MobileNav';
import { FarmerDashboardView } from '../../components/dashboards/FarmerDashboardView';
import { VetDashboardView } from '../../components/dashboards/VetDashboardView';
import { GovernmentDashboardView } from '../../components/dashboards/GovernmentDashboardView';
import { Loader2 } from 'lucide-react';

export default function WebDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/dashboard');
      } else {
        const rawRole = (user?.role || '').toLowerCase().trim();
        if (rawRole === 'admin' || rawRole === 'authority' || rawRole === 'government') {
          router.replace('/admin/dashboard');
        } else if (rawRole === 'veterinarian' || rawRole === 'vet' || rawRole === 'doctor') {
          router.replace('/vet/dashboard');
        } else {
          router.replace('/farmer/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans text-xs font-bold text-teal-800">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-teal-700" />
        <span>Loading Authenticated Workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const rawRole = (user?.role || '').toLowerCase().trim();
  const isVet = rawRole === 'veterinarian' || rawRole === 'vet' || rawRole === 'doctor';
  const isAdmin = rawRole === 'admin' || rawRole === 'authority' || rawRole === 'government';

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          {isAdmin ? (
            <GovernmentDashboardView />
          ) : isVet ? (
            <VetDashboardView />
          ) : (
            <FarmerDashboardView />
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
