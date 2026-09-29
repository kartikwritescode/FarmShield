'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  RefreshCw,
  Info,
  Calendar,
  FlaskConical,
  Scale,
  Milk,
  RotateCcw,
} from 'lucide-react';
import { GovHeader } from '../../../components/ui/GovHeader';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from '../../../components/layout/MobileNav';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useAuth } from '../../../providers/AuthProvider';
import {
  MLService,
  OveruseRiskRequest,
  ComplianceRiskRequest,
  MLRiskResponse,
} from '../../../lib/services/ml.service';

export default function MLRiskDashboardPage() {
  const { user } = useAuth();
  const [activeEngine, setActiveEngine] = useState<'model_a' | 'model_b'>('model_a');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // ==========================================
  // MODEL A STATE (Antimicrobial Overuse Risk)
  // ==========================================
  const [modelAForm, setModelAForm] = useState<OveruseRiskRequest>({
    species: 'Cattle',
    sex: 'Female',
    age_months: 36,
    weight_kg: 420,
    production_purpose: 'Dairy',
    treatments_last_7d: 2,
    treatments_last_30d: 4,
    treatments_last_90d: 7,
    treatments_last_180d: 9,
    total_amu_mg_last_30d: 33600,
    total_amu_mg_last_90d: 58800,
    antimicrobial_classes_used_90d: 3,
    primary_antimicrobial_class: 'Fluoroquinolones',
    repeated_same_active_ingredient_90d: 3,
    treatment_duration_days: 8,
    treatment_frequency_per_day: 2,
    disease_indication_category: 'Mastitis',
    season: 'Monsoon',
    month: 7,
    farm_level_amu_trend: 'Increasing',
    animals_treated_on_farm_30d: 24,
    farm_total_animals: 85,
    previous_treatment_outcome: 'Relapsed',
    data_completeness_score: 0.95,
  });

  const [modelAResult, setModelAResult] = useState<MLRiskResponse | null>(null);

  // ==========================================
  // MODEL B STATE (MRL Residue Non-Compliance)
  // ==========================================
  const [modelBForm, setModelBForm] = useState<ComplianceRiskRequest>({
    species: 'Cattle',
    weight_kg: 420,
    drug_name: 'Enrofloxacin',
    antimicrobial_class: 'Fluoroquinolones',
    route: 'Intramuscular',
    product_type: 'milk',
    prescribed_dose_mg_per_kg: 5.0,
    actual_dose_mg_per_kg: 8.5,
    dose_compliance: 'Overdose',
    treatment_duration_days: 5,
    official_withdrawal_period_days: 28.0,
    days_elapsed_since_treatment: 3.0,
    withdrawal_rule_known: 'No',
    permitted_in_lactating_animals: 'No',
    mrl_threshold_ppb: 100.0,
    lab_residue_test_done: 'No',
    lab_residue_level_ppb: null,
    record_completeness_score: 0.92,
  });

  const [modelBResult, setModelBResult] = useState<MLRiskResponse | null>(null);

  const handleEvaluateModelA = async (payload: OveruseRiskRequest) => {
    setIsEvaluating(true);
    try {
      const res = await MLService.predictOveruseRisk(payload);
      setModelAResult(res);
    } catch {
      setModelAResult(MLService.evaluateLocalOveruseRisk(payload));
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleEvaluateModelB = async (payload: ComplianceRiskRequest) => {
    setIsEvaluating(true);
    try {
      const res = await MLService.predictComplianceRisk(payload);
      setModelBResult(res);
    } catch {
      setModelBResult(MLService.evaluateLocalComplianceRisk(payload));
    } finally {
      setIsEvaluating(false);
    }
  };

  // Initial evaluation on mount
  useEffect(() => {
    handleEvaluateModelA(modelAForm);
    handleEvaluateModelB(modelBForm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preset Handlers for Model A
  const applyModelAPreset = (type: 'high' | 'medium' | 'low') => {
    let preset: OveruseRiskRequest;
    if (type === 'high') {
      preset = {
        species: 'Cattle',
        sex: 'Female',
        age_months: 36,
        weight_kg: 420,
        production_purpose: 'Dairy',
        treatments_last_7d: 2,
        treatments_last_30d: 4,
        treatments_last_90d: 7,
        treatments_last_180d: 9,
        total_amu_mg_last_30d: 33600,
        total_amu_mg_last_90d: 58800,
        antimicrobial_classes_used_90d: 3,
        primary_antimicrobial_class: 'Fluoroquinolones',
        repeated_same_active_ingredient_90d: 3,
        treatment_duration_days: 8,
        treatment_frequency_per_day: 2,
        disease_indication_category: 'Mastitis',
        season: 'Monsoon',
        month: 7,
        farm_level_amu_trend: 'Increasing',
        animals_treated_on_farm_30d: 24,
        farm_total_animals: 85,
        previous_treatment_outcome: 'Relapsed',
        data_completeness_score: 0.95,
      };
    } else if (type === 'medium') {
      preset = {
        species: 'Buffalo',
        sex: 'Female',
        age_months: 48,
        weight_kg: 500,
        production_purpose: 'Dairy',
        treatments_last_7d: 1,
        treatments_last_30d: 2,
        treatments_last_90d: 3,
        treatments_last_180d: 4,
        total_amu_mg_last_30d: 12000,
        total_amu_mg_last_90d: 24000,
        antimicrobial_classes_used_90d: 2,
        primary_antimicrobial_class: 'Tetracyclines',
        repeated_same_active_ingredient_90d: 1,
        treatment_duration_days: 6,
        treatment_frequency_per_day: 1,
        disease_indication_category: 'Respiratory',
        season: 'Winter',
        month: 12,
        farm_level_amu_trend: 'Stable',
        animals_treated_on_farm_30d: 8,
        farm_total_animals: 60,
        previous_treatment_outcome: 'Improved',
        data_completeness_score: 0.9,
      };
    } else {
      preset = {
        species: 'Cattle',
        sex: 'Female',
        age_months: 28,
        weight_kg: 380,
        production_purpose: 'Dairy',
        treatments_last_7d: 0,
        treatments_last_30d: 1,
        treatments_last_90d: 1,
        treatments_last_180d: 1,
        total_amu_mg_last_30d: 3500,
        total_amu_mg_last_90d: 3500,
        antimicrobial_classes_used_90d: 1,
        primary_antimicrobial_class: 'Penicillins',
        repeated_same_active_ingredient_90d: 0,
        treatment_duration_days: 3,
        treatment_frequency_per_day: 1,
        disease_indication_category: 'General Infection',
        season: 'Summer',
        month: 4,
        farm_level_amu_trend: 'Decreasing',
        animals_treated_on_farm_30d: 2,
        farm_total_animals: 50,
        previous_treatment_outcome: 'Improved',
        data_completeness_score: 0.98,
      };
    }
    setModelAForm(preset);
    handleEvaluateModelA(preset);
  };

  // Preset Handlers for Model B
  const applyModelBPreset = (type: 'high' | 'medium' | 'low') => {
    let preset: ComplianceRiskRequest;
    if (type === 'high') {
      preset = {
        species: 'Cattle',
        weight_kg: 420,
        drug_name: 'Enrofloxacin',
        antimicrobial_class: 'Fluoroquinolones',
        route: 'Intramuscular',
        product_type: 'milk',
        prescribed_dose_mg_per_kg: 5.0,
        actual_dose_mg_per_kg: 8.5,
        dose_compliance: 'Overdose',
        treatment_duration_days: 5,
        official_withdrawal_period_days: 28.0,
        days_elapsed_since_treatment: 3.0,
        withdrawal_rule_known: 'No',
        permitted_in_lactating_animals: 'No',
        mrl_threshold_ppb: 100.0,
        lab_residue_test_done: 'No',
        lab_residue_level_ppb: null,
        record_completeness_score: 0.92,
      };
    } else if (type === 'medium') {
      preset = {
        species: 'Buffalo',
        weight_kg: 500,
        drug_name: 'Oxytetracycline',
        antimicrobial_class: 'Tetracyclines',
        route: 'Intramuscular',
        product_type: 'milk',
        prescribed_dose_mg_per_kg: 10.0,
        actual_dose_mg_per_kg: 10.0,
        dose_compliance: 'Correct',
        treatment_duration_days: 4,
        official_withdrawal_period_days: 7.0,
        days_elapsed_since_treatment: 5.5,
        withdrawal_rule_known: 'Yes',
        permitted_in_lactating_animals: 'Yes',
        mrl_threshold_ppb: 100.0,
        lab_residue_test_done: 'No',
        lab_residue_level_ppb: null,
        record_completeness_score: 0.95,
      };
    } else {
      preset = {
        species: 'Cattle',
        weight_kg: 400,
        drug_name: 'Amoxicillin',
        antimicrobial_class: 'Beta-lactams',
        route: 'Intramammary',
        product_type: 'milk',
        prescribed_dose_mg_per_kg: 7.0,
        actual_dose_mg_per_kg: 7.0,
        dose_compliance: 'Correct',
        treatment_duration_days: 3,
        official_withdrawal_period_days: 4.0,
        days_elapsed_since_treatment: 6.0,
        withdrawal_rule_known: 'Yes',
        permitted_in_lactating_animals: 'Yes',
        mrl_threshold_ppb: 4.0,
        lab_residue_test_done: 'Yes',
        lab_residue_level_ppb: 0.5,
        record_completeness_score: 0.98,
      };
    }
    setModelBForm(preset);
    handleEvaluateModelB(preset);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <GovHeader />
      <Navbar currentRole={user?.role || 'admin'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-12 space-y-6">
          <PageHeader
            badge="AI INTELLIGENCE & CLINICAL AUDITING"
            title="AMU Overuse Risk Engine"
            subtitle="Dual Machine Learning Pipeline: 24-Feature Antimicrobial Stewardship Classifier & Pharmacokinetic MRL Residue Predictor"
            icon={Cpu}
            actions={
              <Link
                href="/analytics/models-info"
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-teal-700" />
                <span>Model Benchmarks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />

          {/* Engine Tabs Switcher */}
          <div className="flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs max-w-xl">
            <button
              type="button"
              onClick={() => setActiveEngine('model_a')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeEngine === 'model_a'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Cpu className={`w-4 h-4 ${activeEngine === 'model_a' ? 'text-white' : 'text-teal-700'}`} />
              <span>Model A: Overuse Classifier</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveEngine('model_b')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeEngine === 'model_b'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FlaskConical className={`w-4 h-4 ${activeEngine === 'model_b' ? 'text-white' : 'text-teal-700'}`} />
              <span>Model B: MRL Compliance</span>
            </button>
          </div>

          {/* ==================================================== */}
          {/* ENGINE A: ANTIMICROBIAL OVERUSE RISK CLASSIFIER       */}
          {/* ==================================================== */}
          {activeEngine === 'model_a' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Inputs (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1-Click Fast Presets */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Evaluator Instant Presets:
                    </span>
                    <button
                      type="button"
                      onClick={() => applyModelAPreset('high')}
                      className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyModelAPreset('high')}
                      className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      🔴 Severe Overuse: Chronic Mastitis
                    </button>
                    <button
                      type="button"
                      onClick={() => applyModelAPreset('medium')}
                      className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      🟡 Moderate Advisory: Respiratory Case
                    </button>
                    <button
                      type="button"
                      onClick={() => applyModelAPreset('low')}
                      className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      🟢 Prudent Stewardship: Routine Dairy Care
                    </button>
                  </div>
                </div>

                {/* 24-Feature Form Cards */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEvaluateModelA(modelAForm);
                  }}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-teal-700" />
                      Clinical Input Features (24 Parameters)
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">XGBClassifier Features</span>
                  </div>

                  {/* Section 1: Animal Demographics */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      1. Animal Demographics
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Species
                        </label>
                        <select
                          value={modelAForm.species}
                          onChange={(e) => setModelAForm({ ...modelAForm, species: e.target.value })}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Cattle">Cattle (Dairy Cow)</option>
                          <option value="Buffalo">Buffalo (Murrah)</option>
                          <option value="Goat">Goat (Small Ruminant)</option>
                          <option value="Sheep">Sheep</option>
                          <option value="Pig">Pig</option>
                          <option value="Poultry">Poultry</option>
                          <option value="Fishery">Fishery / Pond</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Sex
                        </label>
                        <select
                          value={modelAForm.sex}
                          onChange={(e) => setModelAForm({ ...modelAForm, sex: e.target.value as any })}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Age (Months)
                        </label>
                        <input
                          type="number"
                          value={modelAForm.age_months}
                          onChange={(e) =>
                            setModelAForm({ ...modelAForm, age_months: Number(e.target.value) })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={modelAForm.weight_kg}
                          onChange={(e) =>
                            setModelAForm({ ...modelAForm, weight_kg: Number(e.target.value) })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Historical Treatments Rolling Windows */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      2. Historical Treatment Frequency (Rolling Windows)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Last 7 Days
                        </label>
                        <input
                          type="number"
                          value={modelAForm.treatments_last_7d}
                          onChange={(e) =>
                            setModelAForm({
                              ...modelAForm,
                              treatments_last_7d: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Last 30 Days
                        </label>
                        <input
                          type="number"
                          value={modelAForm.treatments_last_30d}
                          onChange={(e) =>
                            setModelAForm({
                              ...modelAForm,
                              treatments_last_30d: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Last 90 Days
                        </label>
                        <input
                          type="number"
                          value={modelAForm.treatments_last_90d}
                          onChange={(e) =>
                            setModelAForm({
                              ...modelAForm,
                              treatments_last_90d: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Last 180 Days
                        </label>
                        <input
                          type="number"
                          value={modelAForm.treatments_last_180d}
                          onChange={(e) =>
                            setModelAForm({
                              ...modelAForm,
                              treatments_last_180d: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Cumulative AMU & Class Exposure */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      3. Antimicrobial Exposure & Dosages (mg)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Total AMU (30d, mg)
                        </label>
                        <input
                          type="number"
                          value={modelAForm.total_amu_mg_last_30d}
                          onChange={(e) =>
                            setModelAForm({
                              ...modelAForm,
                              total_amu_mg_last_30d: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Distinct Drug Classes (90d)
                        </label>
                        <input
                          type="number"
                          value={modelAForm.antimicrobial_classes_used_90d}
                          onChange={(e) =>
                            setModelAForm({
                              ...modelAForm,
                              antimicrobial_classes_used_90d: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Primary Drug Class
                        </label>
                        <select
                          value={modelAForm.primary_antimicrobial_class}
                          onChange={(e) =>
                            setModelAForm({
                              ...modelAForm,
                              primary_antimicrobial_class: e.target.value,
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Fluoroquinolones">Fluoroquinolones (CIA / Critical)</option>
                          <option value="3rd/4th Gen Cephalosporins">
                            3rd/4th Gen Cephalosporins (HPCIA)
                          </option>
                          <option value="Beta-lactams">Beta-lactams / Penicillins</option>
                          <option value="Tetracyclines">Tetracyclines</option>
                          <option value="Aminoglycosides">Aminoglycosides</option>
                          <option value="Macrolides">Macrolides</option>
                          <option value="Sulfonamides">Sulfonamides</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Current Episode Characteristics */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      4. Current Episode & Farm Profile
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Disease Indication
                        </label>
                        <select
                          value={modelAForm.disease_indication_category}
                          onChange={(e) =>
                            setModelAForm({
                              ...modelAForm,
                              disease_indication_category: e.target.value,
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Mastitis">Bovine Mastitis (Acute / Subclinical)</option>
                          <option value="Respiratory">Bovine Respiratory Disease (BRD)</option>
                          <option value="Gastrointestinal">Gastrointestinal / Enteritis</option>
                          <option value="Reproductive">Metritis / Reproductive</option>
                          <option value="Foot rot">Foot Rot / Lameness</option>
                          <option value="General Infection">General Prophylaxis / Wound</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Treatment Duration (Days)
                        </label>
                        <input
                          type="number"
                          value={modelAForm.treatment_duration_days}
                          onChange={(e) =>
                            setModelAForm({
                              ...modelAForm,
                              treatment_duration_days: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Farm AMU Trajectory
                        </label>
                        <select
                          value={modelAForm.farm_level_amu_trend}
                          onChange={(e) =>
                            setModelAForm({
                              ...modelAForm,
                              farm_level_amu_trend: e.target.value as any,
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Increasing">Increasing (Elevated AMU)</option>
                          <option value="Stable">Stable</option>
                          <option value="Decreasing">Decreasing (Stewardship Active)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Season
                        </label>
                        <select
                          value={modelAForm.season}
                          onChange={(e) => setModelAForm({ ...modelAForm, season: e.target.value })}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Monsoon">Monsoon (High Pathogen Pressure)</option>
                          <option value="Winter">Winter</option>
                          <option value="Summer">Summer (Extreme Heat Stress)</option>
                          <option value="Post-Monsoon">Post-Monsoon</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Previous Episode Outcome
                        </label>
                        <select
                          value={modelAForm.previous_treatment_outcome}
                          onChange={(e) =>
                            setModelAForm({
                              ...modelAForm,
                              previous_treatment_outcome: e.target.value as any,
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Relapsed">Relapsed</option>
                          <option value="No change">No change</option>
                          <option value="Improved">Improved</option>
                          <option value="Unknown">Unknown</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isEvaluating}
                    className="w-full py-3.5 px-6 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isEvaluating ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Activity className="w-5 h-5" />
                    )}
                    <span>Run Model A Overuse Prediction</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Model A Output Display (5 Cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-6">
                {modelAResult && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
                    {/* Score Gauge & Level Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                          Model A Prediction
                        </span>
                        <h3 className="text-lg font-black text-slate-900">
                          Overuse Risk Evaluation
                        </h3>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${
                          modelAResult.risk_level === 'HIGH'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : modelAResult.risk_level === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {modelAResult.risk_level} RISK
                      </span>
                    </div>

                    {/* Risk Score Big Gauge */}
                    <div
                      className={`p-6 rounded-3xl border flex items-center justify-between ${
                        modelAResult.risk_level === 'HIGH'
                          ? 'bg-rose-50/70 border-rose-200'
                          : modelAResult.risk_level === 'MEDIUM'
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-emerald-50/70 border-emerald-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Overuse Propensity Score
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-slate-900">
                          {(modelAResult.risk_score * 100).toFixed(1)}%
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          Range: 0.000 to 1.000
                        </span>
                      </div>

                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-br from-slate-900 to-slate-800">
                        {modelAResult.risk_level === 'HIGH' ? (
                          <AlertTriangle className="w-8 h-8 text-rose-400" />
                        ) : modelAResult.risk_level === 'MEDIUM' ? (
                          <Clock className="w-8 h-8 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        )}
                      </div>
                    </div>

                    {/* Probability Distribution Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>Class Soft Probability Distribution:</span>
                        <span className="font-mono">P(Class)</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-rose-700">HIGH Risk</span>
                            <span className="font-mono font-bold text-slate-700">
                              {(modelAResult.probability_distribution.HIGH * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-rose-500 h-full rounded-full transition-all"
                              style={{
                                width: `${modelAResult.probability_distribution.HIGH * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-amber-700">MEDIUM Risk</span>
                            <span className="font-mono font-bold text-slate-700">
                              {(modelAResult.probability_distribution.MEDIUM * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all"
                              style={{
                                width: `${modelAResult.probability_distribution.MEDIUM * 100}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-emerald-700">LOW Risk</span>
                            <span className="font-mono font-bold text-slate-700">
                              {(modelAResult.probability_distribution.LOW * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full transition-all"
                              style={{
                                width: `${modelAResult.probability_distribution.LOW * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SHAP Clinical Reason Codes */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                        SHAP Clinical Reason Codes:
                      </span>
                      <div className="space-y-2">
                        {modelAResult.reason_codes.map((reason, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-800 leading-snug flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 flex-shrink-0 mt-1.5" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actionable Veterinary Directive */}
                    <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs space-y-1">
                      <strong className="text-teal-900 block font-bold">
                        Actionable Veterinary Directive:
                      </strong>
                      <p className="text-teal-800 leading-relaxed">
                        {modelAResult.recommended_action}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* ENGINE B: MRL RESIDUE NON-COMPLIANCE ENGINE           */}
          {/* ==================================================== */}
          {activeEngine === 'model_b' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Inputs (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1-Click Fast Presets */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Evaluator Instant Presets:
                    </span>
                    <button
                      type="button"
                      onClick={() => applyModelBPreset('high')}
                      className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => applyModelBPreset('high')}
                      className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      🔴 Critical Embargo: Enrofloxacin (25d Left)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyModelBPreset('medium')}
                      className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      🟡 Near Clearance: Oxytetracycline (1.5d Left)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyModelBPreset('low')}
                      className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      🟢 Cleared for Market: Amoxicillin Bovine
                    </button>
                  </div>
                </div>

                {/* Model B Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEvaluateModelB(modelBForm);
                  }}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-teal-700" />
                      MRL Pharmacokinetic Compliance Parameters
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">Gradient Boosting Regressor</span>
                  </div>

                  {/* Section 1: Target Commodity & Drug */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      1. Animal & Food Commodity
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Species
                        </label>
                        <select
                          value={modelBForm.species}
                          onChange={(e) => setModelBForm({ ...modelBForm, species: e.target.value })}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Cattle">Cattle (Dairy Cow)</option>
                          <option value="Buffalo">Buffalo (Murrah)</option>
                          <option value="Goat">Goat (Caprine)</option>
                          <option value="Sheep">Sheep (Ovine)</option>
                          <option value="Fishery">Aquaculture Unit</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Target Product Type
                        </label>
                        <select
                          value={modelBForm.product_type}
                          onChange={(e) =>
                            setModelBForm({ ...modelBForm, product_type: e.target.value as any })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="milk">Dairy Raw Milk (Bulk Tank)</option>
                          {['Goat', 'Sheep', 'Fishery'].includes(modelBForm.species) && (
                            <option value="meat">Meat / Muscle Tissue</option>
                          )}
                          <option value="eggs">Eggs (Poultry)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={modelBForm.weight_kg}
                          onChange={(e) =>
                            setModelBForm({ ...modelBForm, weight_kg: Number(e.target.value) })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Drug & Route */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      2. Drug Molecule & Dosage
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Antimicrobial Active
                        </label>
                        <select
                          value={modelBForm.drug_name}
                          onChange={(e) => setModelBForm({ ...modelBForm, drug_name: e.target.value })}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Enrofloxacin">Enrofloxacin (Fluoroquinolone)</option>
                          <option value="Oxytetracycline">Oxytetracycline</option>
                          <option value="Amoxicillin">Amoxicillin (Beta-lactam)</option>
                          <option value="Ceftiofur">Ceftiofur (3rd Gen Cephalosporin)</option>
                          <option value="Gentamicin">Gentamicin (Aminoglycoside)</option>
                          <option value="Sulfamethazine">Sulfamethazine</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Route of Administration
                        </label>
                        <select
                          value={modelBForm.route}
                          onChange={(e) => setModelBForm({ ...modelBForm, route: e.target.value })}
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Intramuscular">Intramuscular (IM)</option>
                          <option value="Intramammary">Intramammary Infusion</option>
                          <option value="Oral">Oral Solution</option>
                          <option value="Intravenous">Intravenous (IV)</option>
                          <option value="Subcutaneous">Subcutaneous (SC)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Approved for Lactation?
                        </label>
                        <select
                          value={modelBForm.permitted_in_lactating_animals}
                          onChange={(e) =>
                            setModelBForm({
                              ...modelBForm,
                              permitted_in_lactating_animals: e.target.value as any,
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Yes">Yes (Lactation Cleared)</option>
                          <option value="No">No (Prohibited in Lactating Animals)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Prescribed Dose (mg/kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={modelBForm.prescribed_dose_mg_per_kg}
                          onChange={(e) =>
                            setModelBForm({
                              ...modelBForm,
                              prescribed_dose_mg_per_kg: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Actual Administered Dose (mg/kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={modelBForm.actual_dose_mg_per_kg}
                          onChange={(e) =>
                            setModelBForm({
                              ...modelBForm,
                              actual_dose_mg_per_kg: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Dose Compliance Status
                        </label>
                        <select
                          value={modelBForm.dose_compliance}
                          onChange={(e) =>
                            setModelBForm({ ...modelBForm, dose_compliance: e.target.value as any })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        >
                          <option value="Correct">Correct Therapeutic Dose</option>
                          <option value="Overdose">Overdose (&gt;15% excess)</option>
                          <option value="Underdose">Underdose</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Statutory Withdrawal Timing */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      3. Statutory Withdrawal & Days Elapsed
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Official Statutory Withdrawal (Days)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={modelBForm.official_withdrawal_period_days}
                          onChange={(e) =>
                            setModelBForm({
                              ...modelBForm,
                              official_withdrawal_period_days: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Days Elapsed Since Last Dose
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={modelBForm.days_elapsed_since_treatment}
                          onChange={(e) =>
                            setModelBForm({
                              ...modelBForm,
                              days_elapsed_since_treatment: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          FSSAI MRL Threshold (ppb)
                        </label>
                        <input
                          type="number"
                          value={modelBForm.mrl_threshold_ppb}
                          onChange={(e) =>
                            setModelBForm({
                              ...modelBForm,
                              mrl_threshold_ppb: Number(e.target.value),
                            })
                          }
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isEvaluating}
                    className="w-full py-3.5 px-6 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isEvaluating ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <FlaskConical className="w-5 h-5" />
                    )}
                    <span>Run Model B MRL Compliance Prediction</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Model B Output Display (5 Cols) */}
              <div className="lg:col-span-5 space-y-6 sticky top-6">
                {modelBResult && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                          Model B Prediction
                        </span>
                        <h3 className="text-lg font-black text-slate-900">
                          MRL Non-Compliance Risk
                        </h3>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs ${
                          modelBResult.risk_level === 'HIGH'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : modelBResult.risk_level === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {modelBResult.clearance_badge || modelBResult.risk_level}
                      </span>
                    </div>

                    {/* Big Metric Box */}
                    <div
                      className={`p-6 rounded-3xl border flex items-center justify-between ${
                        modelBResult.risk_level === 'HIGH'
                          ? 'bg-rose-50/70 border-rose-200'
                          : modelBResult.risk_level === 'MEDIUM'
                          ? 'bg-amber-50/70 border-amber-200'
                          : 'bg-emerald-50/70 border-emerald-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Residue Exceedance Probability
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-slate-900">
                          {(modelBResult.risk_score * 100).toFixed(1)}%
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          FSSAI Threshold: {modelBForm.mrl_threshold_ppb} ppb
                        </span>
                      </div>

                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-br from-slate-900 to-slate-800">
                        {modelBResult.risk_level === 'HIGH' ? (
                          <AlertTriangle className="w-8 h-8 text-rose-400" />
                        ) : modelBResult.risk_level === 'MEDIUM' ? (
                          <Clock className="w-8 h-8 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        )}
                      </div>
                    </div>

                    {/* Residual Clearance Countdown Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-900 to-emerald-950 text-white space-y-2 border border-teal-800/80 shadow-md">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-teal-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-teal-300" />
                          Residual Clearance Countdown
                        </span>
                        <span className="text-xs font-mono text-teal-300 font-bold">
                          Statutory Margin
                        </span>
                      </div>

                      <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
                        {modelBResult.remaining_withdrawal_days !== undefined &&
                        modelBResult.remaining_withdrawal_days > 0 ? (
                          <>
                            <span className="text-amber-300">
                              {modelBResult.remaining_withdrawal_days.toFixed(1)} Days
                            </span>
                            <span className="text-xs text-teal-200">
                              ({Math.round(modelBResult.remaining_withdrawal_days * 24)} hours)
                            </span>
                          </>
                        ) : (
                          <span className="text-emerald-300">0.0 Days (CLEARED)</span>
                        )}
                      </div>

                      <div className="text-xs text-teal-100/90 leading-relaxed">
                        {modelBResult.remaining_withdrawal_days &&
                        modelBResult.remaining_withdrawal_days > 0
                          ? 'Zero-Sale Mandate active. Bulk tank collection prohibited.'
                          : 'Residues predicted below statutory LOD. Safe for chilling plant collection.'}
                      </div>
                    </div>

                    {/* SHAP Reason Codes */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                        SHAP Clinical Reason Codes:
                      </span>
                      <div className="space-y-2">
                        {modelBResult.reason_codes.map((reason, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-800 leading-snug flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 flex-shrink-0 mt-1.5" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actionable Veterinary Directive */}
                    <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs space-y-1">
                      <strong className="text-teal-900 block font-bold">
                        Food Safety & Regulatory Directive:
                      </strong>
                      <p className="text-teal-800 leading-relaxed">
                        {modelBResult.recommended_action}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
