'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  HeartPulse,
  Plus,
  RefreshCw,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Sparkles,
  QrCode,
  FileSpreadsheet,
  Building2,
} from 'lucide-react';

import { useAuthStore } from '../../stores/authStore';
import { useLivestockStore } from '../../stores/livestockStore';
import { Animal } from '../../types/database';

import { GovHeader } from '../../components/ui/GovHeader';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileNav } from '../../components/layout/MobileNav';
import { PageHeader } from '../../components/ui/PageHeader';
import { LivestockFilterBar } from '../../components/livestock/LivestockFilterBar';
import { AnimalCard } from '../../components/livestock/AnimalCard';
import { AnimalTableView } from '../../components/livestock/AnimalTableView';
import { RegisterAnimalModal } from '../../components/livestock/RegisterAnimalModal';
import { EditAnimalModal } from '../../components/livestock/EditAnimalModal';

export default function LivestockPage() {
  const { user, profile, role } = useAuthStore();
  const {
    animals,
    isLoading,
    speciesFilter,
    statusFilter,
    searchQuery,
    viewMode,
    fetchAnimals,
    updateAnimal,
  } = useLivestockStore();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  // Initial load
  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  // Client-side filtering for instant responsiveness
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      // 1. Species filter
      if (speciesFilter !== 'all') {
        if (speciesFilter === 'other') {
          const known = ['cow', 'buffalo', 'goat', 'sheep', 'fishery'];
          if (animal.species && known.includes(animal.species.toLowerCase().trim())) {
            return false;
          }
        } else if (animal.species?.toLowerCase().trim() !== speciesFilter) {
          return false;
        }
      }

      // 2. Health status filter
      if (statusFilter !== 'all' && animal.health_status !== statusFilter) {
        return false;
      }

      // 3. Search query
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = (animal.animal_code || '').toLowerCase().includes(q);
        const breedMatch = (animal.breed || '').toLowerCase().includes(q);
        const qrMatch = (animal.qr_token || '').toLowerCase().includes(q);
        const purposeMatch = (animal.purpose || '').toLowerCase().includes(q);
        if (!codeMatch && !breedMatch && !qrMatch && !purposeMatch) {
          return false;
        }
      }

      return true;
    });
  }, [animals, speciesFilter, statusFilter, searchQuery]);

  // Aggregate Metrics
  const totalCount = animals.length;
  const healthyCount = animals.filter((a) => a.health_status === 'healthy').length;
  const underTreatmentCount = animals.filter(
    (a) => a.health_status === 'under_treatment' || a.health_status === 'sick' || a.health_status === 'quarantine'
  ).length;
  const activeWithholdingCount = animals.filter((a) =>
    a.withdrawals?.some((w) => w.status === 'active' && new Date(w.end_date) > new Date())
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-teal-500 selection:text-white">
      <GovHeader />
      {/* Top Navbar */}
      <Navbar currentRole={role || 'farmer'} />

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 lg:pb-12 space-y-6">
          {/* HEADER: Unified PageHeader */}
          <PageHeader
            badge={
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  National Livestock Registry
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                  DAHD / FSSAI Integrated
                </span>
              </div>
            }
            title={
              <div className="flex items-center gap-2 flex-wrap">
                <span>Livestock & Aquaculture Registry</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                  {profile?.farmId || 'DL-FARM-048'}
                </span>
              </div>
            }
            description={
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-700" />
                <span>
                  {profile?.farmType || 'Dairy & Livestock'} Management • {profile?.district || 'Ludhiana'}, {profile?.state || 'Punjab'}
                </span>
              </span>
            }
            actions={
              <>
                <button
                  type="button"
                  onClick={() => fetchAnimals()}
                  disabled={isLoading}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  title="Refresh herd inventory from backend"
                >
                  <RefreshCw className={`w-4 h-4 text-teal-700 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black transition flex items-center gap-2 shadow-xs active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Animal / Pond</span>
                </button>
              </>
            }
          />

          {/* KPI STAT CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Total Census */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Total Inventory
                </span>
                <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                {totalCount}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Head of Stock</span>
            </div>

            {/* Healthy Stock */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Healthy Herds
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <HeartPulse className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-800 tracking-tight">
                {healthyCount}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Safe for Procurement</span>
            </div>

            {/* Under Treatment */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Under Care
                </span>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-amber-700 tracking-tight">
                {underTreatmentCount}
              </div>
              <span className="text-[11px] text-amber-700 font-medium">Monitored Protocol</span>
            </div>

            {/* Active Withholdings */}
            <div
              className={`rounded-2xl border p-4 shadow-2xs ${
                activeWithholdingCount > 0
                  ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                  : 'bg-white border-slate-200/80 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider ${
                    activeWithholdingCount > 0 ? 'text-rose-700' : 'text-slate-400'
                  }`}
                >
                  Statutory Withholding
                </span>
                <div className={`p-1.5 rounded-lg ${activeWithholdingCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-teal-50 text-teal-700'}`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className={`mt-2 text-2xl font-black tracking-tight ${activeWithholdingCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                {activeWithholdingCount}
              </div>
              <span
                className={`text-[11px] font-bold ${
                  activeWithholdingCount > 0 ? 'text-rose-700' : 'text-teal-700'
                }`}
              >
                {activeWithholdingCount > 0 ? 'Strict MRL Hold' : '100% Cleared'}
              </span>
            </div>
          </div>

          {/* FILTER BAR & VIEW MODE SWITCHER */}
          <LivestockFilterBar />

          {/* ANIMAL COLLECTION DISPLAY (Grid / Table) */}
          {isLoading && animals.length === 0 ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-white border border-slate-200 p-4 shadow-xs animate-pulse space-y-4"
                >
                  <div className="h-44 bg-slate-200 rounded-2xl w-full" />
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredAnimals.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-teal-100 p-12 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mx-auto text-2xl">
                🌾
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-extrabold text-slate-800">No Animals Match Selected Criteria</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust species filter, clear search query, or register a new animal to the national digital registry.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black transition shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register Animal Now</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAnimals.map((animal) => (
                <AnimalCard
                  key={animal.id}
                  animal={animal}
                  onEdit={(a) => setEditingAnimal(a)}
                />
              ))}
            </div>
          ) : (
            /* Table View */
            <AnimalTableView
              animals={filteredAnimals}
              onEdit={(a) => setEditingAnimal(a)}
            />
          )}
        </main>
      </div>

      {/* Register Animal Modal */}
      <RegisterAnimalModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => fetchAnimals()}
      />

      {/* Edit Animal Modal */}
      {editingAnimal && (
        <EditAnimalModal
          animal={editingAnimal}
          onClose={() => setEditingAnimal(null)}
          onSave={async (updated) => {
            await updateAnimal(updated.id, updated);
            setEditingAnimal(null);
          }}
        />
      )}

      {/* Mobile Nav */}
      <MobileNav />
    </div>
  );
}
