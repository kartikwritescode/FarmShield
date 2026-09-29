'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Milk,
  Beef,
  Fish,
  Waves,
  Calendar,
  ExternalLink,
  Pill,
  Clock,
} from 'lucide-react';
import { Animal } from '../../types/database';
import { getBreedAsset } from '../../lib/breed_assets';

interface AnimalCardProps {
  animal: Animal;
  onEdit?: (animal: Animal) => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onEdit }) => {
  const breedInfo = getBreedAsset(animal.species, animal.breed || '');
  const photoUrl = animal.image_url || breedInfo.imageUrl;

  const isBovine = animal.species === 'cow' || animal.species === 'buffalo';
  const isAquaculture = animal.species === 'fishery';

  // Check active withdrawals
  const activeWithdrawal = animal.withdrawals?.find(
    (w) => w.status === 'active' && new Date(w.end_date) > new Date()
  );

  // Remaining hours calculation if withdrawal is active
  let remainingHours = 0;
  if (activeWithdrawal) {
    const diff = new Date(activeWithdrawal.end_date).getTime() - Date.now();
    remainingHours = Math.max(0, Math.round(diff / (1000 * 3600)));
  }

  // Health Status Pill Style
  const getHealthBadge = () => {
    switch (animal.health_status) {
      case 'healthy':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Healthy • सुरक्षित',
        };
      case 'under_treatment':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
          label: 'Under Care • उपचाराधीन',
        };
      case 'sick':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500 animate-pulse',
          label: 'Clinical Case • बीमार',
        };
      case 'quarantine':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500',
          label: 'Quarantine • संगरोध',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Monitored',
        };
    }
  };

  const healthBadge = getHealthBadge();

  // Cultural Sensitivity Safe Food Safety Badge
  const renderFoodSafetyBadge = () => {
    if (isBovine) {
      // Strictly Milk Safe or Milk Withheld (ZERO meat mentions)
      if (activeWithdrawal) {
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" />
            <span>Milk Withheld ({remainingHours}h MRL Hold)</span>
          </div>
        );
      }
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
          <Milk className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Milk Safe • Zero Residue</span>
        </div>
      );
    }

    if (isAquaculture) {
      if (activeWithdrawal) {
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Biomass Withheld</span>
          </div>
        );
      }
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-bold">
          <Fish className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>Aquaculture Safe • Food Grade</span>
        </div>
      );
    }

    // Small ruminants / poultry
    if (activeWithdrawal) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>Meat Withheld ({remainingHours}h)</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
        <Beef className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Meat Safe • Certified</span>
      </div>
    );
  };

  return (
    <div className="group relative rounded-3xl bg-white border border-teal-100/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden font-sans">
      <div>
        {/* Card Header & Photo */}
        <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={animal.animal_code}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
              <Scale className="w-12 h-12 stroke-[1.5]" />
            </div>
          )}

          {/* Top Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

          {/* Ear-Tag RFID Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-xs font-bold shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            <span>{animal.animal_code}</span>
          </div>

          {/* QR Passport Link Button */}
          <Link
            href={`/qr/${animal.qr_token || animal.animal_code}`}
            title="Scan / Open Digital QR Passport"
            className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-transform hover:scale-110 active:scale-95"
          >
            <QrCode className="w-4 h-4 text-teal-800" />
          </Link>

          {/* Bottom Photo Strip: Breed name & Purpose */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-200">
                {animal.species}
              </span>
              <h3 className="text-base font-black leading-tight drop-shadow-sm">
                {animal.breed || (isAquaculture ? 'Pond Stock' : 'Indigenous')}
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/25">
              {animal.purpose}
            </span>
          </div>
        </div>

        {/* Card Body Details */}
        <div className="p-4 space-y-3.5">
          {/* Status & Food Safety Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Health Status Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${healthBadge.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${healthBadge.dot}`}></span>
              <span>{healthBadge.label}</span>
            </span>

            {/* Cultural Food Safety Pill */}
            {renderFoodSafetyBadge()}
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
            {isAquaculture ? (
              <>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Waves className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Water Type</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {animal.fishery_details?.water_type || 'Freshwater'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Scale className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Total Biomass</span>
                    <span className="font-bold text-slate-800">
                      {animal.fishery_details?.biomass_kg ?? animal.weight ?? 0} kg
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Scale className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Body Weight</span>
                    <span className="font-bold text-slate-800">
                      {animal.weight_kg ?? animal.weight ?? 0} kg
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Registered Age</span>
                    <span className="font-bold text-slate-800 capitalize">
                      {animal.sex || 'Female'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={`/qr/${animal.qr_token || animal.animal_code}`}
          className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <QrCode className="w-3.5 h-3.5 text-teal-700" />
          <span>Passport</span>
        </Link>

        <Link
          href={`/treatments?animal=${encodeURIComponent(animal.animal_code)}`}
          className="py-1.5 px-3 rounded-xl hover:bg-slate-200/60 text-slate-600 text-xs font-bold transition flex items-center gap-1"
          title="Clinical Treatment History"
        >
          <Pill className="w-3.5 h-3.5 text-slate-500" />
          <span>Rx</span>
        </Link>

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(animal)}
            className="py-1.5 px-2.5 rounded-xl hover:bg-slate-200/60 text-slate-600 text-xs font-bold transition cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};
