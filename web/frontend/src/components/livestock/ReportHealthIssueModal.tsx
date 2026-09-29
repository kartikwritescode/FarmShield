'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ShieldAlert,
  Thermometer,
  Activity,
  FileText,
  Loader2,
} from 'lucide-react';
import { Animal, HealthStatus } from '../../types/database';

export interface SyndromicReportSubmission {
  symptoms: string[];
  bodyTemperatureC?: number;
  triageUrgency: 'low' | 'moderate' | 'high' | 'urgent';
  suspectedCondition: string;
  notes?: string;
  resultingStatus: HealthStatus;
}

interface ReportHealthIssueModalProps {
  animal: Animal;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: SyndromicReportSubmission) => Promise<void>;
}

const SYMPTOM_OPTIONS = [
  { id: 'high_fever', label: 'High Fever (> 39.5°C)', native: 'तीव्र बुखार', risk: 'high' },
  { id: 'mouth_blisters', label: 'Mouth / Tongue Blisters', native: 'मुंह में छाले (FMD)', risk: 'urgent' },
  { id: 'salivation', label: 'Excessive Salivation / Frothing', native: 'मुंह से अत्यधिक लार', risk: 'urgent' },
  { id: 'hoof_lesions', label: 'Lameness / Hoof Lesions', native: 'लंगड़ापन / खुर के घाव', risk: 'urgent' },
  { id: 'udder_swelling', label: 'Udder Hardening / Heat', native: 'स्तन में सूजन (Mastitis)', risk: 'high' },
  { id: 'milk_drop', label: 'Sudden Drop in Milk Yield', native: 'दूध में अचानक गिरावट', risk: 'moderate' },
  { id: 'skin_nodules', label: 'Skin Nodules / Lumps', native: 'त्वचा पर गांठें (LSD)', risk: 'urgent' },
  { id: 'respiratory_distress', label: 'Rapid Breathing / Coughing', native: 'सांस लेने में तकलीफ', risk: 'high' },
  { id: 'anorexia', label: 'Off Feed / Inappetence', native: 'चारा न खाना', risk: 'moderate' },
];

export const ReportHealthIssueModal: React.FC<ReportHealthIssueModalProps> = ({
  animal,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [bodyTempC, setBodyTempC] = useState<string>('39.8');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Rule-Based Transparent Clinical Triage Calculation
  const triageAssessment = useMemo(() => {
    const hasFever = selectedSymptoms.includes('high_fever') || Number(bodyTempC) >= 39.5;
    const hasBlisters = selectedSymptoms.includes('mouth_blisters');
    const hasSalivation = selectedSymptoms.includes('salivation');
    const hasHoof = selectedSymptoms.includes('hoof_lesions');
    const hasNodules = selectedSymptoms.includes('skin_nodules');
    const hasUdder = selectedSymptoms.includes('udder_swelling');
    const hasMilkDrop = selectedSymptoms.includes('milk_drop');

    // Urgent: Contagious Notifiable Epizootics (FMD / LSD)
    if ((hasBlisters && hasSalivation) || (hasHoof && hasSalivation) || (hasNodules && hasFever)) {
      return {
        urgency: 'urgent' as const,
        label: 'URGENT BIOSECURITY ALERT',
        badge: 'bg-rose-500/20 text-rose-800 border-rose-300',
        condition: 'Suspected Foot & Mouth Disease (FMD) or Lumpy Skin Disease (LSD)',
        guidance: 'Immediate strict physical isolation required. Do not transport. Inform Block Veterinary Officer.',
        status: 'quarantine' as HealthStatus,
      };
    }

    // High: Acute Mastitis or Severe Respiratory
    if (hasUdder || (hasFever && hasMilkDrop)) {
      return {
        urgency: 'high' as const,
        label: 'HIGH CLINICAL PRIORITY',
        badge: 'bg-amber-500/20 text-amber-900 border-amber-300',
        condition: 'Suspected Acute Bovine Mastitis with Systemic Fever',
        guidance: 'Perform California Mastitis Test (CMT). Discard affected quarter milk. Withhold antibiotic-treated milk.',
        status: 'under_treatment' as HealthStatus,
      };
    }

    // Moderate: Systemic Signs
    if (selectedSymptoms.length > 0 || hasFever) {
      return {
        urgency: 'moderate' as const,
        label: 'MODERATE CLINICAL ATTENTION',
        badge: 'bg-yellow-500/20 text-yellow-900 border-yellow-300',
        condition: 'Unspecified Syndromic Malaise / Stress',
        guidance: 'Monitor body vitals twice daily. Provide electrolytes and clean shade.',
        status: 'sick' as HealthStatus,
      };
    }

    // Low: Routine
    return {
      urgency: 'low' as const,
      label: 'ROUTINE BIO-MONITORING',
      badge: 'bg-emerald-500/20 text-emerald-900 border-emerald-300',
      condition: 'Normal Physiologic Variation',
      guidance: 'Continue standard bio-security protocol.',
      status: 'healthy' as HealthStatus,
    };
  }, [selectedSymptoms, bodyTempC]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        symptoms: selectedSymptoms,
        bodyTemperatureC: bodyTempC ? Number(bodyTempC) : undefined,
        triageUrgency: triageAssessment.urgency,
        suspectedCondition: triageAssessment.condition,
        notes,
        resultingStatus: triageAssessment.status,
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit syndromic report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950 via-slate-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <AlertTriangle className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Report Clinical Health Issue & Triage</h2>
              <p className="text-xs text-slate-300">
                Syndromic triage for {animal.animal_code} ({animal.breed} {animal.species})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Temperature Input */}
          <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  Body Temperature (°C)
                </label>
                <span className="text-[11px] text-slate-500">Normal bovine range: 38.0°C – 39.3°C</span>
              </div>
            </div>
            <input
              type="number"
              step="0.1"
              value={bodyTempC}
              onChange={(e) => setBodyTempC(e.target.value)}
              className="w-24 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 text-right focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Observed Symptoms Multi-Select */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
              Observed Clinical Signs (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {SYMPTOM_OPTIONS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-500/30'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <span className="text-[10px] font-black">✓</span>}
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-snug">{sym.label}</div>
                      <div className="text-[10px] text-slate-400">{sym.native}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Rule-Based Triage Assessment Card */}
          <div className="p-4 rounded-2xl border border-amber-200/80 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Rule-Based Clinical Triage Engine
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${triageAssessment.badge}`}>
                {triageAssessment.label}
              </span>
            </div>
            <div className="text-xs font-black text-slate-900">
              {triageAssessment.condition}
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {triageAssessment.guidance}
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1">
              Field Notes / Clinical Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe onset time, feed intake, or previous treatments..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <a
                href={`/surveillance/triage?animalId=${animal.id}`}
                className="text-xs font-bold text-teal-700 hover:underline hidden sm:inline"
              >
                Launch Full Triage Engine &rarr;
              </a>
            </div>
            <button
              type="submit"
              disabled={selectedSymptoms.length === 0 || isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging Clinical Triage...</span>
                </>
              ) : (
                <span>Log Clinical Triage Report</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
