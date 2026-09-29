'use client';

import React, { useMemo } from 'react';
import {
  Search,
  X,
  LayoutGrid,
  Table as TableIcon,
  Filter,
  Check,
} from 'lucide-react';
import { useLivestockStore, SpeciesFilter, StatusFilter, ViewMode } from '../../stores/livestockStore';

const SPECIES_CONFIG: Array<{
  id: SpeciesFilter;
  label: string;
  nativeLabel: string;
  icon: string;
}> = [
  { id: 'all', label: 'All Herds', nativeLabel: 'सभी पशु', icon: '🌾' },
  { id: 'cow', label: 'Cattle', nativeLabel: 'गाय', icon: '🐄' },
  { id: 'buffalo', label: 'Buffalo', nativeLabel: 'भैंस', icon: '🐃' },
  { id: 'goat', label: 'Goat', nativeLabel: 'बकरी', icon: '🐐' },
  { id: 'sheep', label: 'Sheep', nativeLabel: 'भेड़', icon: '🐑' },
  { id: 'fishery', label: 'Aquaculture', nativeLabel: 'मत्स्य पालन', icon: '🐟' },
  { id: 'other', label: 'Other', nativeLabel: 'अन्य', icon: '🐾' },
];

export const LivestockFilterBar: React.FC = () => {
  const {
    animals,
    speciesFilter,
    statusFilter,
    searchQuery,
    viewMode,
    setSpeciesFilter,
    setStatusFilter,
    setSearchQuery,
    setViewMode,
  } = useLivestockStore();

  // Reactive species counts
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: animals.length };
    SPECIES_CONFIG.forEach((sp) => {
      if (sp.id === 'all') return;
      if (sp.id === 'other') {
        const known = ['cow', 'buffalo', 'goat', 'sheep', 'fishery'];
        map.other = animals.filter(
          (a) => !a.species || !known.includes(a.species.toLowerCase().trim())
        ).length;
      } else {
        map[sp.id] = animals.filter(
          (a) => a.species && a.species.toLowerCase().trim() === sp.id
        ).length;
      }
    });
    return map;
  }, [animals]);

  return (
    <div className="space-y-4 font-sans">
      {/* Species Pill Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SPECIES_CONFIG.map((sp) => {
          const isSelected = speciesFilter === sp.id;
          const count = counts[sp.id] ?? 0;

          return (
            <button
              key={sp.id}
              type="button"
              onClick={() => setSpeciesFilter(sp.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-900/10 scale-102 ring-2 ring-teal-600/30'
                  : 'bg-white hover:bg-teal-50/60 text-slate-700 border border-teal-100 hover:border-teal-200'
              }`}
            >
              <span className="text-sm">{sp.icon}</span>
              <span>{sp.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected
                    ? 'bg-teal-800 text-teal-100'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search, Status Filter & View Mode Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-teal-100 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ear-Tag RFID, Breed, or QR Passport..."
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Dropdown Filter & View Mode Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Health Status</option>
              <option value="healthy">Healthy (सुरक्षित)</option>
              <option value="under_treatment">Under Treatment (उपचाराधीन)</option>
              <option value="sick">Sick / Symptomatic (बीमार)</option>
              <option value="quarantine">Quarantine (संगरोध)</option>
            </select>
          </div>

          {/* Grid / Table View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Dense Table View"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-teal-800 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
