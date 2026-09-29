'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  ExternalLink,
  QrCode,
  Info,
} from 'lucide-react';
import { Animal } from '../../types/database';

interface HerdHeatmapCardProps {
  animals: Animal[];
  onSelectAnimal?: (animal: Animal) => void;
}

export const HerdHeatmapCard: React.FC<HerdHeatmapCardProps> = ({
  animals = [],
  onSelectAnimal,
}) => {
  const [filterSpecies, setFilterSpecies] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredAnimal, setHoveredAnimal] = useState<Animal | null>(null);

  // Filtered animal collection
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const matchSpecies = filterSpecies === 'all' || animal.species === filterSpecies;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        animal.animal_code.toLowerCase().includes(q) ||
        (animal.breed || '').toLowerCase().includes(q);
      return matchSpecies && matchQuery;
    });
  }, [animals, filterSpecies, searchQuery]);

  // Aggregate clinical stats
  const healthyCount = animals.filter((a) => a.health_status === 'healthy').length;
  const underTreatmentCount = animals.filter((a) => a.health_status === 'under_treatment').length;
  const sickCount = animals.filter((a) => a.health_status === 'sick' || a.health_status === 'quarantine').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return {
          tile: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-800 hover:bg-emerald-500/30 hover:border-emerald-600',
          dot: 'bg-emerald-500',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Healthy',
        };
      case 'under_treatment':
        return {
          tile: 'bg-amber-500/20 border-amber-500/50 text-amber-900 hover:bg-amber-500/35 hover:border-amber-600',
          dot: 'bg-amber-500 animate-pulse',
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          label: 'Under Treatment',
        };
      case 'sick':
      case 'quarantine':
      default:
        return {
          tile: 'bg-rose-500/20 border-rose-500/60 text-rose-900 hover:bg-rose-500/35 hover:border-rose-600 animate-pulse',
          dot: 'bg-rose-500',
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'Critical / Sick',
        };
    }
  };

  return (
    <div className="rounded-2xl border border-teal-100/90 bg-white p-6 shadow-md shadow-teal-950/5 font-sans space-y-5">
      {/* Header with Title and Status Badges */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Activity className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Herd Clinical Heatmap Matrix
            </h2>
            <span className="text-xs text-slate-500 font-medium">({animals.length} Census)</span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time biometric grid color-coded by active clinical and pharmacological status.
          </p>
        </div>

        {/* Status Counters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Healthy: {healthyCount}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Withdrawal: {underTreatmentCount}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Critical: {sickCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Species Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto text-xs font-bold">
          {['all', 'cow', 'buffalo', 'goat', 'fishery'].map((species) => (
            <button
              key={species}
              type="button"
              onClick={() => setFilterSpecies(species)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                filterSpecies === species
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {species === 'all' ? 'All Units' : species}
            </button>
          ))}
        </div>

        {/* Tag Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ear-tag or breed..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
          />
        </div>
      </div>

      {/* Interactive Tile Grid */}
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
          {filteredAnimals.map((animal) => {
            const colors = getStatusColor(animal.health_status);
            return (
              <div
                key={animal.id}
                onMouseEnter={() => setHoveredAnimal(animal)}
                onMouseLeave={() => setHoveredAnimal(null)}
                onClick={() => onSelectAnimal && onSelectAnimal(animal)}
                className={`relative rounded-xl border-2 p-3 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[92px] ${colors.tile}`}
              >
                {/* Tile Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    {animal.species.slice(0, 3)}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                </div>

                {/* Ear-Tag Code */}
                <div className="my-1">
                  <div className="text-xs font-black tracking-tight">{animal.animal_code}</div>
                  <div className="text-[10px] text-slate-600 truncate font-medium">
                    {animal.breed || 'Indigenous'}
                  </div>
                </div>

                {/* Footer Tag Metric */}
                <div className="text-[9px] font-bold text-slate-500 uppercase flex items-center justify-between pt-1 border-t border-slate-200/50">
                  <span>{animal.weight}kg</span>
                  <QrCode className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Tooltip / Detail Overlay */}
        {hoveredAnimal && (
          <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-teal-500/40 animate-in fade-in zoom-in-95 pointer-events-none">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                  {hoveredAnimal.species} • {hoveredAnimal.purpose}
                </span>
                <h3 className="text-lg font-black text-white">{hoveredAnimal.animal_code}</h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  getStatusColor(hoveredAnimal.health_status).badge
                }`}
              >
                {getStatusColor(hoveredAnimal.health_status).label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Breed</span>
                <span className="font-semibold text-slate-200">{hoveredAnimal.breed || 'Crossbred'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Weight Biomass</span>
                <span className="font-semibold text-slate-200">{hoveredAnimal.weight} kg</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">QR Passport Token</span>
                <span className="font-mono text-teal-300 font-bold">{hoveredAnimal.qr_token}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Clinical Treatment</span>
                <span className="font-semibold text-slate-200">
                  {hoveredAnimal.health_status === 'under_treatment' ? 'Active Countdown' : 'None Active'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-teal-200 mt-2.5 flex items-center gap-1 font-medium">
              <Info className="w-3 h-3 text-teal-400" />
              Click tile to view full animal medical records & QR tag
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
