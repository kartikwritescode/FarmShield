'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  X,
  AlertTriangle,
  Flame,
  Activity,
  ShieldAlert,
  Sparkles,
  Info,
} from 'lucide-react';
import { SYMPTOM_CATALOG, SymptomDefinition } from '../../lib/services/triage.service';

interface SymptomCatalogPickerProps {
  selectedSymptoms: Set<string>;
  onToggleSymptom: (id: string) => void;
  onClearAll: () => void;
  onSelectPreset: (symptomIds: string[]) => void;
}

type CategoryFilter = 'all' | 'emergency' | 'cutaneous_mucosal' | 'respiratory' | 'mammary' | 'digestive' | 'systemic';

const CATEGORY_TABS: { id: CategoryFilter; label: string; count: number }[] = [
  { id: 'all', label: 'All Symptoms', count: 17 },
  { id: 'emergency', label: 'Emergency', count: 3 },
  { id: 'cutaneous_mucosal', label: 'Mouth / Skin / Feet', count: 5 },
  { id: 'respiratory', label: 'Respiratory & Throat', count: 3 },
  { id: 'mammary', label: 'Udder & Milk', count: 2 },
  { id: 'digestive', label: 'Digestive & Appetite', count: 2 },
  { id: 'systemic', label: 'Systemic / Fever', count: 2 },
];

const PRESETS = [
  {
    name: 'FMD Triad',
    desc: 'Blisters, Salivation & Lameness',
    symptoms: ['mouth_blisters', 'excessive_salivation', 'hoof_lesions', 'high_fever'],
    badgeClass: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  },
  {
    name: 'Anthrax Suspect',
    desc: 'Unclotted Blood / Sudden Death',
    symptoms: ['bloody_discharge', 'sudden_death'],
    badgeClass: 'bg-red-950 text-red-100 border-red-800 hover:bg-red-900',
  },
  {
    name: 'Hemorrhagic Septicemia (HS)',
    desc: 'Throat Edema & Dyspnea',
    symptoms: ['throat_swelling', 'respiratory_distress', 'high_fever'],
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
  },
  {
    name: 'Lumpy Skin (LSD)',
    desc: 'Cutaneous Nodules & Fever',
    symptoms: ['skin_nodules', 'high_fever'],
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  },
  {
    name: 'Mastitis',
    desc: 'Udder Swelling & Clotted Milk',
    symptoms: ['udder_swelling', 'abnormal_milk'],
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
  },
  {
    name: 'Redwater / Babesiosis',
    desc: 'Hemoglobinuria & Fever',
    symptoms: ['red_urine', 'high_fever'],
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
  },
];

export const SymptomCatalogPicker: React.FC<SymptomCatalogPickerProps> = ({
  selectedSymptoms,
  onToggleSymptom,
  onClearAll,
  onSelectPreset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  // Filter symptoms based on search and active tab
  const filteredSymptoms = useMemo(() => {
    return Object.values(SYMPTOM_CATALOG).filter((sym) => {
      // Exclude mild_lethargy from standard 17 if needed, or include as auxiliary
      if (activeCategory !== 'all' && sym.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesLabel = sym.label.toLowerCase().includes(query);
        const matchesLabelHi = sym.labelHi.toLowerCase().includes(query);
        const matchesDesc = sym.description.toLowerCase().includes(query);
        return matchesLabel || matchesLabelHi || matchesDesc;
      }
      return true;
    });
  }, [searchQuery, activeCategory]);

  const selectedCount = selectedSymptoms.size;

  return (
    <div className="space-y-4">
      {/* Header Bar with Search & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search symptoms (e.g. fever, छाले, salivation, swelling)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs md:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Selected: <strong className="text-teal-600 dark:text-teal-400">{selectedCount}</strong>
          </span>
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 rounded-lg transition-colors border border-red-200 dark:border-red-900"
            >
              <X className="w-3 h-3" />
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Evaluator Quick Preset Triads */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Quick Diagnostic Presets (1-Click Test):
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const isFullySelected = p.symptoms.every((s) => selectedSymptoms.has(s));
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => onSelectPreset(p.symptoms)}
                title={p.desc}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all shadow-sm flex items-center gap-1.5 ${
                  isFullySelected
                    ? 'ring-2 ring-teal-500 bg-teal-50 border-teal-400 text-teal-800 dark:bg-teal-950/60 dark:text-teal-200'
                    : p.badgeClass
                }`}
              >
                <span>{p.name}</span>
                {isFullySelected && <Check className="w-3 h-3 text-teal-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-all ${
                isActive
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Symptom Multi-Select Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredSymptoms.map((sym) => {
          const isSelected = selectedSymptoms.has(sym.id);

          // Category badge styling
          let severityBadge = (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {sym.severityWeight.toUpperCase()}
            </span>
          );
          if (sym.severityWeight === 'critical') {
            severityBadge = (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                CRITICAL
              </span>
            );
          } else if (sym.severityWeight === 'high') {
            severityBadge = (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                HIGH
              </span>
            );
          }

          return (
            <div
              key={sym.id}
              onClick={() => onToggleSymptom(sym.id)}
              className={`relative p-3 rounded-xl border text-left cursor-pointer transition-all select-none group ${
                isSelected
                  ? 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-500 shadow-sm ring-1 ring-teal-500'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {sym.label}
                  </div>
                  <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium mt-0.5">
                    {sym.labelHi}
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-teal-600 border-teal-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 group-hover:border-teal-400'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-2 leading-relaxed">
                {sym.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  {sym.category.replace('_', ' ')}
                </span>
                {severityBadge}
              </div>
            </div>
          );
        })}
      </div>

      {filteredSymptoms.length === 0 && (
        <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            No symptoms match &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="mt-2 text-xs font-semibold text-teal-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
