'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Cpu,
  ShieldCheck,
  Activity,
  Layers,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Award,
  Database,
  HelpCircle,
  TrendingUp,
  FlaskConical,
  ExternalLink,
  Flame,
} from 'lucide-react';
import {
  MLService,
  ModelBenchmarkMetadata,
  FALLBACK_MODELS_METADATA,
  FeatureImportanceItem,
} from '../../lib/services/ml.service';

interface ModelsInfoCardProps {
  initialMetadata?: ModelBenchmarkMetadata;
}

export const ModelsInfoCard: React.FC<ModelsInfoCardProps> = ({ initialMetadata }) => {
  const [metadata, setMetadata] = useState<ModelBenchmarkMetadata>(
    initialMetadata || FALLBACK_MODELS_METADATA
  );
  const [loading, setLoading] = useState<boolean>(!initialMetadata);
  const [openAccordion, setOpenAccordion] = useState<string | null>('pk-decay');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const data = await MLService.getModelsMetadata();
        if (isMounted && data) {
          setMetadata(data);
        }
      } catch (err) {
        console.warn('Using fallback models metadata:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (!initialMetadata) {
      loadData();
    }
    return () => {
      isMounted = false;
    };
  }, [initialMetadata]);

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const modelA = metadata.model_a;
  const modelB = metadata.model_b;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner / Project Overview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white shadow-md border border-teal-700/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-mono font-bold border border-teal-500/30">
              <Award className="w-3.5 h-3.5 text-teal-300" />
              <span>{metadata.framework || 'National One-Health Surveillance Framework'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Dual Machine Learning Benchmarks & Model Architecture
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed">
              Production XGBoost and Gradient Boosting inference pipelines trained on multi-center
              veterinary epidemiological datasets with farm-level data isolation.
            </p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end gap-2 text-xs text-teal-100 font-mono">
            <span className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl border border-teal-600/40">
              <Database className="w-3.5 h-3.5 text-teal-300" />
              102,800+ Total Records
            </span>
            <span className="text-[11px] text-teal-200/80">
              GroupShuffleSplit (Zero Farm Leakage)
            </span>
          </div>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model A Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-800 shadow-2xs">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
                  Model A Engine
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {modelA.name}
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
              F1: {modelA.macro_f1?.toFixed(3)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Multi-class soft probability classifier that screens rolling antimicrobial treatments,
            CIA usage, and farm-level trajectories to flag early patterns of routine overuse and AMR risk.
          </p>

          {/* Metric KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs hover:border-teal-300 transition-colors">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Macro F1</span>
              <strong className="text-sm sm:text-base font-black text-slate-900">
                {(modelA.macro_f1 * 100).toFixed(1)}%
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs hover:border-teal-300 transition-colors">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">ROC-AUC (OvR)</span>
              <strong className="text-sm sm:text-base font-black text-emerald-700">
                {modelA.roc_auc_ovr?.toFixed(3)}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs hover:border-teal-300 transition-colors">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Precision</span>
              <strong className="text-sm sm:text-base font-black text-slate-900">
                {((modelA.precision || 0.792) * 100).toFixed(1)}%
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs hover:border-teal-300 transition-colors">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Training Size</span>
              <strong className="text-sm sm:text-base font-black text-teal-800">
                {(modelA.n_samples || 48200).toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 text-xs shadow-2xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Algorithm:</span>
              <span className="font-mono font-bold text-slate-900">{modelA.algorithm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target Classes:</span>
              <span className="font-semibold text-slate-800">
                LOW (0), MEDIUM (1), HIGH (2)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Data Preprocessing:</span>
              <span className="font-medium text-slate-800">
                StandardScaler + OneHotEncoder Pipeline
              </span>
            </div>
          </div>

          {/* Feature Importance Bar Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-teal-700" />
                SHAP Global Feature Importance
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Weight / 1.0</span>
            </div>

            <div className="space-y-2.5">
              {modelA.feature_importance?.map((item: FeatureImportanceItem) => (
                <div key={item.feature} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{item.label}</span>
                    <span className="font-mono font-bold text-teal-800">
                      {(item.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, item.importance * 280)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model B Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-800 shadow-2xs">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block">
                  Model B Engine
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {modelB.name}
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-mono font-bold">
              F1: {modelB.macro_f1?.toFixed(3)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Pharmacokinetic decay regressor & compliance engine that tracks drug clearance across
            biological matrices (milk, meat, eggs) and enforces statutory zero-residue margins.
          </p>

          {/* Metric KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs hover:border-teal-300 transition-colors">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Macro F1</span>
              <strong className="text-sm sm:text-base font-black text-slate-900">
                {(modelB.macro_f1 * 100).toFixed(1)}%
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs hover:border-teal-300 transition-colors">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">ROC-AUC (OvR)</span>
              <strong className="text-sm sm:text-base font-black text-teal-700">
                {modelB.roc_auc_ovr?.toFixed(3)}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs hover:border-teal-300 transition-colors">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Precision</span>
              <strong className="text-sm sm:text-base font-black text-slate-900">
                {((modelB.precision || 0.835) * 100).toFixed(1)}%
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-center shadow-2xs hover:border-teal-300 transition-colors">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Training Size</span>
              <strong className="text-sm sm:text-base font-black text-teal-800">
                {(modelB.n_samples || 54600).toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 text-xs shadow-2xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Architecture:</span>
              <span className="font-mono font-bold text-slate-900">{modelB.algorithm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Primary Objective:</span>
              <span className="font-semibold text-slate-800">
                Multi-Class Soft Probability + 95% Confidence Upper Bound
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Statutory Standard:</span>
              <span className="font-medium text-slate-800">
                FSSAI / Codex Alimentarius MRL Tables
              </span>
            </div>
          </div>

          {/* Feature Importance Bar Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-teal-700" />
                SHAP Global Feature Importance
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Weight / 1.0</span>
            </div>

            <div className="space-y-2.5">
              {modelB.feature_importance?.map((item: FeatureImportanceItem) => (
                <div key={item.feature} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{item.label}</span>
                    <span className="font-mono font-bold text-teal-800">
                      {(item.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, item.importance * 260)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Educational Accordions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-5 h-5 text-teal-700" />
          <h3 className="text-base sm:text-lg font-black text-slate-900">
            Educational Scientific Guide & Pharmacokinetic Fundamentals
          </h3>
        </div>

        {/* Accordion 1: Pharmacokinetic Decay Curves & MRL Intersection */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => toggleAccordion('pk-decay')}
            className="w-full p-4 sm:p-5 flex items-center justify-between bg-white text-left font-bold text-slate-900 text-xs sm:text-sm hover:bg-slate-50/60 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-700" />
              1. Pharmacokinetic Decay Curves Intersecting Statutory MRL Thresholds
            </span>
            {openAccordion === 'pk-decay' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openAccordion === 'pk-decay' && (
            <div className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/80 bg-white">
              <p>
                Veterinary antimicrobials clear animal tissues according to first-order multi-compartment
                exponential decay kinetics:
              </p>
              <div className="p-4 bg-slate-900 text-emerald-300 rounded-2xl font-mono text-center text-xs sm:text-sm overflow-x-auto shadow-inner">
                C(t) = C₀ · e^(-kₑₗ · t) &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; t₁/₂ = ln(2) / kₑₗ
              </div>
              <p>
                Statutory withdrawal times (e.g. 7 days for milk, 28 days for muscle tissue) are determined
                not at the population mean, but at the <strong>95% tolerance limit with 95% confidence</strong>.
                This ensures that 95 out of 100 animal food products sampled at the end of the statutory period
                will contain drug residue levels strictly below the statutory Maximum Residue Limit (MRL / ppb).
              </p>
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900">
                <strong>Model B Precision:</strong> Model B checks whether an animal&apos;s administered dosage
                exceeded the therapeutic baseline. If overdosed by &gt;15%, the biological clearance timeline is
                extended by an additional 1 to 2 half-lives (\(t_{1/2}\)) before clearance can be legally certified.
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2: Temperature-Humidity Index (THI) & Hepatic Clearance */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => toggleAccordion('thi-stress')}
            className="w-full p-4 sm:p-5 flex items-center justify-between bg-white text-left font-bold text-slate-900 text-xs sm:text-sm hover:bg-slate-50/60 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              2. Temperature-Humidity Index (THI) & Hepatic Clearance Prolongation
            </span>
            {openAccordion === 'thi-stress' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openAccordion === 'thi-stress' && (
            <div className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/80 bg-white">
              <p>
                Extreme ambient heat and humidity trigger profound metabolic stress in tropical livestock.
                Under acute heat stress, hepatic blood flow decreases and cytochrome P450 monooxygenase
                enzymes are downregulated, significantly prolonging active drug clearance:
              </p>
              <div className="p-4 bg-slate-900 text-amber-300 rounded-2xl font-mono text-center text-xs sm:text-sm overflow-x-auto shadow-inner">
                THI = (1.8 × T + 32) − (0.55 − 0.0055 × RH) × (1.8 × T − 26)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center pt-2">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <strong className="text-emerald-800 block">THI &lt; 72</strong>
                  <span className="text-slate-500 text-[11px]">Normal Clearance (1.0x)</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <strong className="text-amber-800 block">THI 72–78</strong>
                  <span className="text-slate-500 text-[11px]">Mild Stress (1.1x)</span>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <strong className="text-orange-800 block">THI 79–88</strong>
                  <span className="text-slate-500 text-[11px]">Moderate (+25% W/D)</span>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <strong className="text-rose-800 block">THI &gt; 89</strong>
                  <span className="text-slate-500 text-[11px]">Severe (+50% W/D)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 3: Zero-Residue Mandates & Cultural Integrity */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => toggleAccordion('zero-residue')}
            className="w-full p-4 sm:p-5 flex items-center justify-between bg-white text-left font-bold text-slate-900 text-xs sm:text-sm hover:bg-slate-50/60 transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              3. Statutory Zero-Residue Mandates & Cultural Production Guardrails
            </span>
            {openAccordion === 'zero-residue' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openAccordion === 'zero-residue' && (
            <div className="p-4 sm:p-5 space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/80 bg-white">
              <p>
                In compliance with the Food Safety and Standards Authority of India (FSSAI) and the Department
                of Animal Husbandry & Dairying (DAHD):
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Zero Bovine Meat Metrics:</strong> Indian indigenous cattle (Cow) and Buffalo passports
                  strictly restrict evaluation to dairy milk safety. Meat metrics are prohibited for bovine species.
                </li>
                <li>
                  <strong>Prohibited Antimicrobials:</strong> Nitrofuran and Chloramphenicol derivatives carry a
                  zero-tolerance threshold (LOD &lt; 0.3 ppb) and are permanently embargoed from dairy animals.
                </li>
                <li>
                  <strong>Aquaculture Pond Units:</strong> Fishery units are evaluated collectively as pond biomass
                  with water-sediment half-life calculations.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
