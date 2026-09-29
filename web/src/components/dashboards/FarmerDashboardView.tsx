'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderHeart,
  PlusCircle,
  QrCode,
  Pill,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Calendar,
  Sparkles,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  HeartPulse,
  Syringe,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import { AnimalRepository } from '../../lib/repositories/animal.repository';
import { TreatmentRepository } from '../../lib/repositories/treatment.repository';
import { SyndromicRepository } from '../../lib/repositories/syndromic.repository';
import { Animal, Withdrawal, DiseaseAlert } from '../../types/database';
import { WithdrawalCountdownCard, ActiveWithdrawalItem } from '../dashboard/WithdrawalCountdownCard';
import { WeatherRiskCard } from '../dashboard/WeatherRiskCard';
import { DiseaseTrendChart } from '../dashboard/DiseaseTrendChart';
import { RegisterAnimalModal } from '../livestock/RegisterAnimalModal';

export const FarmerDashboardView: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [alerts, setAlerts] = useState<DiseaseAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [aList, wList, altList] = await Promise.all([
          AnimalRepository.getAnimals(),
          TreatmentRepository.getActiveWithdrawals(),
          SyndromicRepository.getActiveAlerts(),
        ]);
        setAnimals(aList);
        setWithdrawals(wList);
        setAlerts(altList);
      } catch (err) {
        console.error('Failed to load farmer dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalAnimals = animals.length;
  const healthyCount = animals.filter((a) => a.health_status === 'healthy').length;
  const underTreatmentCount = animals.filter((a) => a.health_status === 'under_treatment').length;
  const activeWithdrawalCount = withdrawals.length;

  const activeWithdrawalItems: ActiveWithdrawalItem[] = withdrawals.map((w) => ({
    id: w.id,
    animal_code: w.animal?.animal_code || 'ANIMAL',
    product: w.product,
    medicine_name: w.treatment?.medicine?.name || 'Veterinary Antibiotic',
    end_date: w.end_date,
  }));

  return (
    <div className="space-y-6">
      {/* 1. Farmer Welcome & Facility Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Farmer Workspace
              </span>
              <span className="text-xs text-teal-200 font-bold">
                {user?.farmId || 'Punjab Dairy Unit #1'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {language === 'en' ? `Welcome back, ${user?.name || 'Dairy Producer'}` : `नमस्ते, ${user?.name || 'पशुपालक'}`}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              {user?.district || 'Ludhiana'}, {user?.state || 'Punjab'} • Daily livestock health registry, milk safety verification, and statutory withdrawal monitoring.
            </p>
          </div>

          {/* Primary Quick Actions in Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="py-2.5 px-4 bg-white hover:bg-teal-50 text-teal-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-teal-700" />
              <span>Register Animal</span>
            </button>
            <Link
              href="/treatments/new"
              className="py-2.5 px-4 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Syringe className="w-4 h-4" />
              <span>Log Treatment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Herd Census KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Herd */}
        <Link
          href="/livestock"
          className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Livestock</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderHeart className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{loading ? '—' : totalAnimals}</span>
            <span className="text-xs font-bold text-gray-500">Heads</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">Digital ear-tag tracked</p>
        </Link>

        {/* Healthy Herd */}
        <Link
          href="/livestock?status=healthy"
          className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cleared & Healthy</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">{loading ? '—' : healthyCount}</span>
            <span className="text-xs font-bold text-emerald-600">Milk Safe</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">100% MRL compliant</p>
        </Link>

        {/* Under Clinical Treatment */}
        <Link
          href="/livestock?status=under_treatment"
          className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Under Treatment</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{loading ? '—' : underTreatmentCount}</span>
            <span className="text-xs font-bold text-amber-700">Active</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium">Under veterinary care</p>
        </Link>

        {/* Active Statutory Withholding */}
        <Link
          href="/calendar"
          className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Withholding Embargo</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-600">{loading ? '—' : activeWithdrawalCount}</span>
            <span className="text-xs font-bold text-red-700">Zero-Sale</span>
          </div>
          <p className="text-[11px] text-red-600 font-medium">Do not supply milk/meat</p>
        </Link>
      </div>

      {/* 3. Fast Operations Grid for Farmers */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <span>⚡</span> Quick Farm Tools
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="p-4 rounded-2xl bg-teal-50/60 hover:bg-teal-100/80 border border-teal-200/80 text-teal-900 flex flex-col items-center justify-center gap-2 transition cursor-pointer text-center"
          >
            <PlusCircle className="w-6 h-6 text-teal-700" />
            <span>Register New Animal</span>
          </button>

          <Link
            href="/scan"
            className="p-4 rounded-2xl bg-blue-50/60 hover:bg-blue-100/80 border border-blue-200/80 text-blue-900 flex flex-col items-center justify-center gap-2 transition cursor-pointer text-center"
          >
            <QrCode className="w-6 h-6 text-blue-700" />
            <span>Scan Ear-Tag QR</span>
          </Link>

          <Link
            href="/calendar"
            className="p-4 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 flex flex-col items-center justify-center gap-2 transition cursor-pointer text-center"
          >
            <Calendar className="w-6 h-6 text-emerald-700" />
            <span>Withdrawal Calendar</span>
          </Link>

          <Link
            href="/medicines"
            className="p-4 rounded-2xl bg-purple-50/60 hover:bg-purple-100/80 border border-purple-200/80 text-purple-900 flex flex-col items-center justify-center gap-2 transition cursor-pointer text-center"
          >
            <Pill className="w-6 h-6 text-purple-700" />
            <span>Approved Medicines & MRL</span>
          </Link>
        </div>
      </div>

      {/* 4. Live Statutory Withholding Countdown & Weather Risk Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WithdrawalCountdownCard withdrawals={activeWithdrawalItems} />
        <WeatherRiskCard />
      </div>

      {/* 5. Disease Trend Chart */}
      <DiseaseTrendChart />

      {/* Register Animal Modal */}
      {isRegisterModalOpen && (
        <RegisterAnimalModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSuccess={async () => {
            setIsRegisterModalOpen(false);
            const aList = await AnimalRepository.getAnimals();
            setAnimals(aList);
          }}
        />
      )}
    </div>
  );
};
