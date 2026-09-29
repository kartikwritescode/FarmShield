'use client';

import React, { useState, useMemo } from 'react';
import {
  Pill,
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Activity,
  Clock,
  Calendar,
  CheckCircle2,
  Syringe,
  Filter,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type HealthEventType = 'treatment' | 'vaccination' | 'symptom_report' | 'health_check';

export interface HealthTimelineEvent {
  id: string;
  type: HealthEventType;
  title: string;
  description: string;
  timestamp: string;
  severity?: 'low' | 'moderate' | 'high' | 'urgent';
  performedBy?: string;
  metadata?: {
    medicineName?: string;
    dose?: string;
    route?: string;
    indication?: string;
    withdrawalEndDate?: string;
    isWithdrawalActive?: boolean;
    remainingHours?: number;
    vaccineName?: string;
    diseaseTargeted?: string;
    batchNumber?: string;
    boosterDueDate?: string;
    isOverdue?: boolean;
    bodyTemperatureC?: number;
    symptoms?: string[];
    triageUrgency?: string;
    weightKg?: number;
  };
}

interface HealthTimelineProps {
  events: HealthTimelineEvent[];
  onLogTreatment?: () => void;
  onReportIssue?: () => void;
}

export const HealthTimeline: React.FC<HealthTimelineProps> = ({
  events,
  onLogTreatment,
  onReportIssue,
}) => {
  const [filterType, setFilterType] = useState<HealthEventType | 'all'>('all');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  // Filtered & Chronologically sorted events (newest first)
  const sortedEvents = useMemo(() => {
    return [...events]
      .filter((e) => filterType === 'all' || e.type === filterType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [events, filterType]);

  const counts = useMemo(() => {
    return {
      all: events.length,
      treatment: events.filter((e) => e.type === 'treatment').length,
      vaccination: events.filter((e) => e.type === 'vaccination').length,
      symptom_report: events.filter((e) => e.type === 'symptom_report').length,
      health_check: events.filter((e) => e.type === 'health_check').length,
    };
  }, [events]);

  const getEventBadge = (event: HealthTimelineEvent) => {
    switch (event.type) {
      case 'treatment':
        return {
          icon: <Pill className="w-4 h-4 text-teal-700" />,
          color: 'bg-teal-50 text-teal-800 border-teal-200',
          dot: 'bg-teal-600',
          label: 'Antimicrobial Rx',
        };
      case 'vaccination':
        return {
          icon: <Syringe className="w-4 h-4 text-emerald-700" />,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          label: 'Immunization',
        };
      case 'symptom_report':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-700" />,
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-600',
          label: 'Syndromic Alert',
        };
      case 'health_check':
        return {
          icon: <Activity className="w-4 h-4 text-sky-700" />,
          color: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-600',
          label: 'Biometry Check',
        };
      default:
        return {
          icon: <HeartPulse className="w-4 h-4 text-slate-700" />,
          color: 'bg-slate-50 text-slate-800 border-slate-200',
          dot: 'bg-slate-600',
          label: 'Clinical Event',
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-teal-100/90 shadow-2xs p-5 sm:p-6 space-y-5 font-sans">
      {/* Timeline Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Unified Clinical Health Journey</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {events.length} Events
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chronological aggregation of treatments, statutory MRL holds, vaccines, and symptoms
          </p>
        </div>

        {/* Quick Log CTAs */}
        <div className="flex items-center gap-2">
          {onReportIssue && (
            <button
              type="button"
              onClick={onReportIssue}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Report Issue</span>
            </button>
          )}
          {onLogTreatment && (
            <button
              type="button"
              onClick={onLogTreatment}
              className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Pill className="w-3.5 h-3.5 text-teal-200" />
              <span>Log Treatment</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
            filterType === 'all'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          All Streams ({counts.all})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('treatment')}
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
            filterType === 'treatment'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          💊 Treatments ({counts.treatment})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('vaccination')}
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
            filterType === 'vaccination'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          🛡️ Vaccinations ({counts.vaccination})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('symptom_report')}
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
            filterType === 'symptom_report'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          ⚠️ Symptoms ({counts.symptom_report})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('health_check')}
          className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
            filterType === 'health_check'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          📋 Biometry ({counts.health_check})
        </button>
      </div>

      {/* Empty State */}
      {sortedEvents.length === 0 ? (
        <div className="py-12 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center mx-auto text-xl">
            🌿
          </div>
          <h3 className="text-sm font-bold text-slate-800">Clean Health History</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No clinical records logged under this filter. All routine physiologic parameters optimal.
          </p>
        </div>
      ) : (
        /* Vertical Chronological Timeline */
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-teal-100">
          {sortedEvents.map((event) => {
            const badge = getEventBadge(event);
            const isExpanded = expandedEventId === event.id;
            const dateObj = new Date(event.timestamp);
            const formattedDate = dateObj.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const formattedTime = dateObj.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={event.id} className="relative group">
                {/* Timeline Circle Beacon */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-teal-600 shadow-xs flex items-center justify-center">
                  <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                </div>

                {/* Event Card */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all space-y-2.5">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${badge.color} flex items-center gap-1`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>

                      {/* Severity pill for symptoms */}
                      {event.severity && event.severity !== 'low' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-800 border border-rose-200">
                          {event.severity} Urgency
                        </span>
                      )}

                      {/* Overdue booster warning */}
                      {event.metadata?.isOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                          Booster Overdue
                        </span>
                      )}

                      {/* Active Withdrawal Flag */}
                      {event.metadata?.isWithdrawalActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-900 border border-rose-300">
                          MRL Hold ({event.metadata.remainingHours || 24}h)
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{formattedTime}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{event.title}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Metadata Chips: Antimicrobial dose, vaccine batch, fever, etc. */}
                  {event.metadata && (
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      {event.metadata.medicineName && (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold flex items-center gap-1">
                          <Pill className="w-3 h-3 text-teal-600" />
                          <span>{event.metadata.medicineName}</span>
                          {event.metadata.dose && (
                            <span className="text-slate-400">({event.metadata.dose})</span>
                          )}
                        </span>
                      )}

                      {event.metadata.route && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                          {event.metadata.route}
                        </span>
                      )}

                      {event.metadata.vaccineName && (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold flex items-center gap-1">
                          <Syringe className="w-3 h-3 text-emerald-600" />
                          <span>Target: {event.metadata.diseaseTargeted || event.metadata.vaccineName}</span>
                        </span>
                      )}

                      {event.metadata.batchNumber && (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-mono text-[10px]">
                          Batch: {event.metadata.batchNumber}
                        </span>
                      )}

                      {event.metadata.bodyTemperatureC && (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold flex items-center gap-1">
                          <span>🌡️ {event.metadata.bodyTemperatureC}°C</span>
                        </span>
                      )}

                      {event.metadata.weightKg && (
                        <span className="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 font-bold">
                          Weight: {event.metadata.weightKg} kg
                        </span>
                      )}

                      {event.performedBy && (
                        <span className="ml-auto text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{event.performedBy}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
