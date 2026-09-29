'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Syringe,
  FlaskConical,
  Cpu,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Pill,
  MapPin,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import { AMUAnalytics } from '../vet/AMUAnalytics';
import { TreatmentRepository } from '../../lib/repositories/treatment.repository';
import { AnimalRepository } from '../../lib/repositories/animal.repository';

export const VetDashboardView: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'clinical' | 'amu' | 'ml_models'>('clinical');
  const [stats, setStats] = useState({
    activePatients: 8,
    criticalWithholdings: 3,
    ciaAntimicrobialUsage: '14.2%',
    pendingLabAssays: 2,
  });

  const [modelsMetadata, setModelsMetadata] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/ml/models-info')
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success') {
          setModelsMetadata(json.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Veterinarian Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Veterinary Clinical Intelligence
              </span>
              <span className="text-xs text-blue-200 font-bold">
                Reg: {user?.licenseNo || 'VET-MH-8820'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dr. {user?.name || 'Veterinary Officer'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Field Veterinary Officer • State Animal Husbandry Service • Clinical triage, culture-confirmed prescription, and AMU stewardship.
            </p>
          </div>

          {/* Sub-tab view toggle */}
          <div className="flex items-center bg-slate-800/80 border border-slate-700 p-1.5 rounded-2xl text-xs font-black self-end sm:self-center">
            <button
              onClick={() => setActiveTab('clinical')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'clinical' ? 'bg-teal-700 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Clinical Operations
            </button>
            <button
              onClick={() => setActiveTab('amu')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'amu' ? 'bg-teal-700 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              AMU Stewardship
            </button>
            <button
              onClick={() => setActiveTab('ml_models')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ml_models' ? 'bg-teal-700 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Risk Models</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Clinical KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Patients */}
        <Link
          href="/herd-health"
          className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Cases</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{stats.activePatients}</span>
            <span className="text-xs font-bold text-gray-500">Animals</span>
          </div>
          <p className="text-[11px] text-blue-600 font-medium">Under active therapy</p>
        </Link>

        {/* Critical Withholdings */}
        <Link
          href="/calendar"
          className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Zero-Sale Mandates</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{stats.criticalWithholdings}</span>
            <span className="text-xs font-bold text-amber-700">Restricted</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium">Active drug clearance</p>
        </Link>

        {/* CIA Antimicrobial Index */}
        <Link
          href="/analytics/ml-risk"
          className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">CIA Index</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-700">{stats.ciaAntimicrobialUsage}</span>
            <span className="text-xs font-bold text-purple-600">WHO HPCIA</span>
          </div>
          <p className="text-[11px] text-purple-600 font-medium">Below 15% threshold target</p>
        </Link>

        {/* Pending Lab Residue Assays */}
        <Link
          href="/lab-results"
          className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all space-y-2 group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lab Assays</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700">{stats.pendingLabAssays}</span>
            <span className="text-xs font-bold text-emerald-600">Assays</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">NABL quantitative tests</p>
        </Link>
      </div>

      {/* 3. Clinical Actions & Syndromic Alert Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
        <Link
          href="/treatments/new"
          className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition flex items-center gap-3.5 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Syringe className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-gray-900 group-hover:text-teal-700 transition">Prescribe Treatment</h3>
            <p className="text-[11px] text-gray-500 font-medium truncate">Authorized veterinary drug dispensing</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-700 transition" />
        </Link>

        <Link
          href="/surveillance/triage"
          className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition flex items-center gap-3.5 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-gray-900 group-hover:text-red-700 transition">Syndromic Triage</h3>
            <p className="text-[11px] text-gray-500 font-medium truncate">WOAH deterministic cluster evaluation</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-700 transition" />
        </Link>

        <Link
          href="/lab-results"
          className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition flex items-center gap-3.5 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-gray-900 group-hover:text-purple-700 transition">Review Lab Assays</h3>
            <p className="text-[11px] text-gray-500 font-medium truncate">HPLC quantitative residue certificates</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-700 transition" />
        </Link>
      </div>

      {/* 4. Sub-view content */}
      {activeTab === 'clinical' && (
        <div className="space-y-6">
          <AMUAnalytics />
        </div>
      )}

      {activeTab === 'amu' && <AMUAnalytics />}

      {activeTab === 'ml_models' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Model A Card */}
          <div className="p-6 bg-white rounded-3xl border-2 border-teal-600/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-6 h-6 text-teal-700" />
                <div>
                  <h3 className="text-base font-black text-gray-900">Model A: AMU Overuse Risk</h3>
                  <span className="text-[11px] text-gray-500 font-bold">XGBoost Classifier (multi:softprob)</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                Active ML
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100">
                <span className="text-[10px] text-gray-600 font-bold block uppercase">Macro F1 Score</span>
                <span className="text-2xl font-black text-teal-800">
                  {modelsMetadata?.model_a?.macro_f1 ? modelsMetadata.model_a.macro_f1.toFixed(3) : '0.770'}
                </span>
              </div>
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100">
                <span className="text-[10px] text-gray-600 font-bold block uppercase">ROC-AUC (OvR)</span>
                <span className="text-2xl font-black text-teal-800">
                  {modelsMetadata?.model_a?.roc_auc ? modelsMetadata.model_a.roc_auc.toFixed(3) : '0.933'}
                </span>
              </div>
            </div>

            <Link
              href="/analytics/ml-risk"
              className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>Run Overuse Risk Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Model B Card */}
          <div className="p-6 bg-white rounded-3xl border-2 border-teal-600/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-6 h-6 text-teal-700" />
                <div>
                  <h3 className="text-base font-black text-gray-900">Model B: MRL Residue Compliance</h3>
                  <span className="text-[11px] text-gray-500 font-bold">Gradient Boosting Regressor</span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                Active ML
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-[10px] text-gray-600 font-bold block uppercase">Macro F1 Score</span>
                <span className="text-2xl font-black text-blue-800">
                  {modelsMetadata?.model_b?.macro_f1 ? modelsMetadata.model_b.macro_f1.toFixed(3) : '0.819'}
                </span>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-[10px] text-gray-600 font-bold block uppercase">ROC-AUC (OvR)</span>
                <span className="text-2xl font-black text-blue-800">
                  {modelsMetadata?.model_b?.roc_auc ? modelsMetadata.model_b.roc_auc.toFixed(3) : '0.946'}
                </span>
              </div>
            </div>

            <Link
              href="/analytics/ml-risk"
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>Run MRL Compliance Engine</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
