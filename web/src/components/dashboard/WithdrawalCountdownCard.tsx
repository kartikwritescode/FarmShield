'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  AlertOctagon,
  Milk,
  Beef,
  Fish,
  Egg,
  ShieldCheck,
  Clock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { TargetProduct } from '../../types/database';

export interface ActiveWithdrawalItem {
  id: string;
  animalId?: string;
  animalCode?: string;
  animal_code?: string;
  species?: string;
  product: TargetProduct | string;
  medicineName?: string;
  medicine_name?: string;
  startDate?: string;
  endDate?: string;
  end_date?: string;
  withdrawalDays?: number;
  withdrawal_days?: number;
}

interface WithdrawalCountdownCardProps {
  withdrawals: ActiveWithdrawalItem[];
  onSelectAnimal?: (animalCode: string) => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
  isCleared: boolean;
  progressPct: number;
}

function computeTimeRemaining(endDateStr?: string, startDateStr?: string, statutoryDays = 5): TimeRemaining {
  if (!endDateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, isCleared: true, progressPct: 100 };
  }

  const target = new Date(endDateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0, isCleared: true, progressPct: 100 };
  }

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / (24 * 3600));
  const hours = Math.floor((totalSec % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const totalHours = Math.floor(diff / (1000 * 3600));

  // Compute percentage elapsed
  const start = startDateStr ? new Date(startDateStr).getTime() : target - statutoryDays * 86400000;
  const totalDuration = Math.max(1, target - start);
  const elapsed = Math.max(0, now - start);
  const progressPct = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  return { days, hours, minutes, seconds, totalHours, isCleared: false, progressPct };
}

export const WithdrawalCountdownCard: React.FC<WithdrawalCountdownCardProps> = ({
  withdrawals = [],
  onSelectAnimal,
}) => {
  // Reactive 1-second interval ticker for live countdown clocks
  const [, setTicker] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((prev) => (prev + 1) % 100000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getProductIcon = (product: string) => {
    const p = (product || '').toLowerCase();
    switch (p) {
      case 'milk':
        return <Milk className="w-4 h-4 text-amber-300" />;
      case 'meat':
        return <Beef className="w-4 h-4 text-rose-300" />;
      case 'fish':
        return <Fish className="w-4 h-4 text-sky-300" />;
      case 'eggs':
        return <Egg className="w-4 h-4 text-yellow-300" />;
      default:
        return <AlertOctagon className="w-4 h-4 text-amber-300" />;
    }
  };

  // If no active withdrawals, display 100% compliant Teal status banner
  if (!withdrawals || withdrawals.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-teal-900 to-teal-800 border border-teal-500/30 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-800/80 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
              <ShieldCheck className="w-7 h-7 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">All Herds Legally Cleared (MRL Safe)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  100% Compliant
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                No active drug withholding periods. All dairy milk and biomass are certified safe for chilling plants and consumers.
              </p>
            </div>
          </div>

          <Link
            href="/treatments/new"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <span>Administer Treatment</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          </span>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
            Live Statutory Withdrawal Tickers ({withdrawals.length} Active)
          </h2>
        </div>

        <Link
          href="/calendar"
          className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 hover:underline"
        >
          <span>View Withdrawal Calendar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {withdrawals.map((item) => {
          const endDate = item.endDate || item.end_date;
          const startDate = item.startDate;
          const statDays = item.withdrawalDays || item.withdrawal_days || 5;
          const medName = item.medicineName || item.medicine_name || 'Veterinary Antimicrobial';

          const time = computeTimeRemaining(endDate, startDate, statDays);

          // Visual clearance progress bar color logic:
          // crimson (<24h) to amber (1-3 days) to teal (cleared or >3 days)
          let barGradient = 'from-teal-600 to-teal-500';
          let borderStyle = 'border-teal-500/40';
          let bgGradient = 'from-teal-950 via-teal-900 to-teal-800';
          let statusBadge = 'bg-teal-500/20 text-teal-300 border-teal-500/40';
          let statusLabel = 'Statutory Safe Clearance in Progress';

          if (time.isCleared) {
            barGradient = 'from-emerald-500 to-teal-400';
            borderStyle = 'border-emerald-500/50';
            bgGradient = 'from-teal-950 via-teal-900 to-emerald-950';
            statusBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50';
            statusLabel = 'SAFE TO HARVEST • MRL CLEARED';
          } else if (time.totalHours < 24) {
            barGradient = 'from-rose-600 to-rose-500';
            borderStyle = 'border-rose-500/60';
            bgGradient = 'from-slate-950 via-rose-950 to-slate-900';
            statusBadge = 'bg-rose-500/25 text-rose-300 border-rose-500/60 animate-pulse';
            statusLabel = 'URGENT: FINAL 24H WITHHOLDING';
          } else if (time.days <= 3) {
            barGradient = 'from-amber-600 to-amber-500';
            borderStyle = 'border-amber-500/50';
            bgGradient = 'from-slate-950 via-amber-950 to-slate-900';
            statusBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
            statusLabel = 'ACTIVE WITHHOLDING (STRICT MRL)';
          }

          return (
            <div
              key={item.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient} border-2 ${borderStyle} p-5 text-white shadow-xl transition-all duration-300 hover:shadow-2xl`}
            >
              {/* Background radial accent */}
              <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                {/* Header: Animal ear tag, drug name, product pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
                      {time.isCleared ? (
                        <Unlock className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-rose-400 animate-pulse" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectAnimal && onSelectAnimal(item.animalCode || item.animal_code || 'ANIMAL')}
                          className="text-base font-extrabold tracking-tight text-white hover:text-teal-300 transition cursor-pointer flex items-center gap-1"
                        >
                          <span>{item.animalCode || item.animal_code || 'ANIMAL'}</span>
                          <ExternalLink className="w-3 h-3 text-white/60" />
                        </button>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/15 capitalize">
                          {item.species || 'Cattle'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium line-clamp-1">{medName}</p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white border border-white/15 uppercase tracking-wider">
                    {getProductIcon(String(item.product))}
                    <span>{String(item.product)}</span>
                  </span>
                </div>

                {/* Live Ticker Clock Units (Days : Hours : Mins : Secs) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-400" />
                      Clearance Countdown
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-2 backdrop-blur-xs">
                      <div className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
                        {String(time.days).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Days</div>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-2 backdrop-blur-xs">
                      <div className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
                        {String(time.hours).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Hours</div>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-2 backdrop-blur-xs">
                      <div className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
                        {String(time.minutes).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Mins</div>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-2 backdrop-blur-xs">
                      <div className="text-xl sm:text-2xl font-black text-teal-300 font-mono leading-none">
                        {String(time.seconds).padStart(2, '0')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Secs</div>
                    </div>
                  </div>
                </div>

                {/* Clearance Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                    <span>Metabolic Drug Clearance</span>
                    <span className="font-mono font-bold">{time.progressPct}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/50 border border-white/10 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
                      style={{ width: `${Math.max(5, time.progressPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
