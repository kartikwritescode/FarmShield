'use client';

import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  ShieldAlert,
  PhoneCall,
  Lock,
  Stethoscope,
  Printer,
  ChevronRight,
  Wind,
  FileSpreadsheet,
} from 'lucide-react';
import { TriageAssessment, TriageUrgency } from '../../lib/services/triage.service';

interface TriageAssessmentCardProps {
  assessment: TriageAssessment;
  animalCode?: string;
  species?: string;
  onCallHelpline?: () => void;
  onPrintNotice?: () => void;
}

export const TriageAssessmentCard: React.FC<TriageAssessmentCardProps> = ({
  assessment,
  animalCode,
  species,
  onCallHelpline,
  onPrintNotice,
}) => {
  const {
    urgency,
    suspectedConditions,
    rationalePoints,
    recommendedActions,
    requiresImmediateIsolation,
    alertFieldVeterinarian,
    vectorRiskMultiplier,
  } = assessment;

  // Banner visual config
  const bannerConfig: Record<
    TriageUrgency,
    {
      bg: string;
      text: string;
      border: string;
      icon: React.ReactNode;
      label: string;
      sub: string;
      pulseClass: string;
    }
  > = {
    urgent: {
      bg: 'bg-red-600 dark:bg-red-700',
      text: 'text-white',
      border: 'border-red-500 shadow-red-200 dark:shadow-red-950/50',
      icon: <AlertOctagon className="w-6 h-6 text-white animate-bounce" />,
      label: 'URGENT BIOSECURITY HAZARD',
      sub: 'CRITICAL STATUTORY OUTBREAK PROTOCOL ACTIVE',
      pulseClass: 'animate-pulse ring-4 ring-red-400/50',
    },
    high: {
      bg: 'bg-orange-600 dark:bg-orange-700',
      text: 'text-white',
      border: 'border-orange-500 shadow-orange-200 dark:shadow-orange-950/50',
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
      label: 'HIGH CLINICAL PRIORITY',
      sub: 'ACTIVE INFECTION / VETERINARY DISPATCH RECOMMENDED',
      pulseClass: 'ring-2 ring-orange-300',
    },
    moderate: {
      bg: 'bg-amber-500 dark:bg-amber-600',
      text: 'text-white',
      border: 'border-amber-400 shadow-amber-200 dark:shadow-amber-950/50',
      icon: <Info className="w-6 h-6 text-white" />,
      label: 'MODERATE SYNDROMIC ADVISORY',
      sub: 'CLINICAL SYMPTOMS UNDER CLOSE STALL MONITORING',
      pulseClass: '',
    },
    low: {
      bg: 'bg-emerald-600 dark:bg-emerald-700',
      text: 'text-white',
      border: 'border-emerald-500 shadow-emerald-200 dark:shadow-emerald-950/50',
      icon: <CheckCircle2 className="w-6 h-6 text-white" />,
      label: 'LOW RISK / OBSERVATION',
      sub: 'NO TRANSBOUNDARY EPIDEMIC SIGNS DETECTED',
      pulseClass: '',
    },
  };

  const currentBanner = bannerConfig[urgency];

  return (
    <div
      className={`rounded-2xl overflow-hidden border shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 ${currentBanner.border} ${
        urgency === 'urgent' ? 'ring-4 ring-red-500/20' : ''
      }`}
    >
      {/* Top Urgency Header Banner */}
      <div
        className={`px-5 py-4 ${currentBanner.bg} ${currentBanner.text} flex items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            {currentBanner.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black tracking-wide uppercase">
                {currentBanner.label}
              </span>
              {urgency === 'urgent' && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-white text-red-700 rounded-full animate-pulse uppercase tracking-wider">
                  STATUTORY WOAH
                </span>
              )}
            </div>
            <div className="text-[11px] font-medium opacity-90 tracking-wide mt-0.5">
              {currentBanner.sub}
            </div>
          </div>
        </div>

        {/* Live Vector Multiplier Badge */}
        {vectorRiskMultiplier > 1.0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-black/25 rounded-xl text-xs font-semibold backdrop-blur-sm">
            <Wind className="w-3.5 h-3.5" />
            <span>Vector Multiplier: {vectorRiskMultiplier.toFixed(1)}x</span>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="p-5 space-y-5">
        {/* Suspected Conditions Box */}
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
            <span>Deterministic Triage Match:</span>
            {animalCode && (
              <span className="text-slate-600 dark:text-slate-300 font-bold lowercase normal-case">
                Subject: <strong className="font-mono text-teal-600 dark:text-teal-400">{animalCode}</strong>
                {species ? ` (${species})` : ''}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {suspectedConditions.map((cond, idx) => {
              let badgeStyle =
                'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300';
              if (urgency === 'urgent') {
                badgeStyle =
                  'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-200 dark:border-red-800';
              } else if (urgency === 'high') {
                badgeStyle =
                  'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-800';
              } else if (urgency === 'moderate') {
                badgeStyle =
                  'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800';
              } else {
                badgeStyle =
                  'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800';
              }

              return (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm ${badgeStyle}`}
                >
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>{cond}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Biosecurity Action Flags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
              requiresImmediateIsolation
                ? 'bg-red-50/80 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-900 dark:text-red-200'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                requiresImmediateIsolation
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}
            >
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">
                {requiresImmediateIsolation ? 'Immediate Quarantine Mandatory' : 'Quarantine Not Mandatory'}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {requiresImmediateIsolation
                  ? 'Isolate affected animal in separate pen / 100m perimeter'
                  : 'Maintain standard herd biosecurity & hygiene'}
              </div>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
              alertFieldVeterinarian
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                alertFieldVeterinarian
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">
                {alertFieldVeterinarian ? 'Veterinary Alert Dispatched' : 'Standard Routine Monitoring'}
              </div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {alertFieldVeterinarian
                  ? 'Field veterinarian / Paravet notification required'
                  : 'Check vital parameters at next regular scheduled visit'}
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Rationale Bullet Points */}
        {rationalePoints.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Clinical Rationale & Symptom Correlation:
            </h4>
            <ul className="space-y-1.5">
              {rationalePoints.map((point, i) => (
                <li
                  key={i}
                  className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 mt-2 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Immediate Actions */}
        {recommendedActions.length > 0 && (
          <div className="bg-teal-50/50 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-200 dark:border-teal-900/60">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300 mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Mandatory SOP & Immediate Farm Actions:
            </h4>
            <div className="space-y-2">
              {recommendedActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900/70 p-2.5 rounded-lg border border-teal-100 dark:border-teal-900/40 shadow-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span className="font-medium leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <a
            href="tel:1962"
            onClick={onCallHelpline}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            Call Emergency Toll-Free 1962 (Kisan / Vet Helpline)
          </a>

          <button
            type="button"
            onClick={onPrintNotice || (() => window.print())}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print Biosecurity Notice
          </button>
        </div>
      </div>
    </div>
  );
};
