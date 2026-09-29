'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FlaskConical,
  MapPin,
  FileText,
  Activity,
  BarChart3,
  Cpu,
  Pill,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Download,
  Filter,
  Eye,
  PlusCircle,
  X,
  Search,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import { SyndromicRepository } from '../../lib/repositories/syndromic.repository';
import { DiseaseAlert } from '../../types/database';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const GovernmentDashboardView: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'surveillance' | 'compliance' | 'formulary'>('surveillance');
  const [alerts, setAlerts] = useState<DiseaseAlert[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add medicine modal state
  const [showAddMed, setShowAddMed] = useState(false);
  const [medName, setMedName] = useState('');
  const [medActiveIng, setMedActiveIng] = useState('');
  const [medClass, setMedClass] = useState('Penicillins');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [alertList, resMeds, resRules] = await Promise.all([
          SyndromicRepository.getActiveAlerts().catch(() => []),
          fetch('http://localhost:5000/api/medicines').then((r) => r.json()).catch(() => ({ data: [] })),
          fetch('http://localhost:5000/api/regulatory-rules').then((r) => r.json()).catch(() => ({ data: [] })),
        ]);

        setAlerts(alertList || []);
        if (resMeds?.data) setMedicines(resMeds.data);
        if (resRules?.data) setRules(resRules.data);
      } catch (err) {
        console.error('Failed to load government dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName || !medActiveIng) return;

    try {
      await fetch('http://localhost:5000/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: medName,
          active_ingredient: medActiveIng,
          antimicrobial_class: medClass,
        }),
      });
      setShowAddMed(false);
      setMedName('');
      setMedActiveIng('');
      // Refresh medicines
      const res = await fetch('http://localhost:5000/api/medicines');
      const data = await res.json();
      if (data?.data) setMedicines(data.data);
    } catch (err) {
      console.error('Failed to add medicine:', err);
    }
  };

  const highSeverityAlerts = alerts.filter((a) => a.severity === 'critical' || a.severity === 'warning');

  return (
    <div className="space-y-6">
      {/* 1. National Authority Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Department of Animal Husbandry & Dairying (DAHD)
              </span>
              <span className="text-xs text-emerald-200/80 font-bold">
                FSSAI Central Regulatory Sentinel
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              National Biosecurity & AMU Compliance Console
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl">
              Official command portal for state veterinary authorities, disease surveillance epidemiologists,
              and FSSAI food safety residue inspectors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/reports"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-black text-white flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Statutory Audit Export</span>
            </Link>
            <Link
              href="/surveillance/map"
              className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-xs font-black text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>GIS Outbreak Hotspots</span>
            </Link>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-6 pt-4 border-t border-emerald-800/60 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('surveillance')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'surveillance'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            National Biosecurity & Outbreaks
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'compliance'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            MRL Lab Assays & Residue Compliance
          </button>
          <button
            onClick={() => setActiveTab('formulary')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'formulary'
                ? 'bg-white text-emerald-950 shadow-md'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            Regulatory Medicines & FSSAI Rules
          </button>
        </div>
      </div>

      {/* 2. Top-Level National KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Disease Hotspots */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Outbreak Alerts
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{alerts.length}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {highSeverityAlerts.length} High Risk
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Across 28 states & union territories in real-time
          </p>
        </div>

        {/* KPI 2: MRL Compliance Rate */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              MRL Food Safety Index
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-800">98.4%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +0.6%
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            FSSAI residue compliance across milk chilling plants
          </p>
        </div>

        {/* KPI 3: HPCIA / CIA Stewardship Index */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              CIA Prescription Index
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
              <Pill className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-900">11.4%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> Under 15% Cap
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Critically Important Antibiotics national usage share
          </p>
        </div>

        {/* KPI 4: Registered Formulary Molecules */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Approved Formulary
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200/60">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{medicines.length}</span>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              {rules.length} Statutory Rules
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Active veterinary compounds mapped to FSSAI MRL limits
          </p>
        </div>
      </div>

      {/* 3. Tab Content */}

      {/* TAB 1: National Biosecurity & Outbreaks */}
      {activeTab === 'surveillance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live Syndromic Incident Feed */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                    <span>Real-Time Disease & Syndromic Alert Feed</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Incidents reported by field veterinarians and automated syndromic triage rules
                  </p>
                </div>
                <Link
                  href="/surveillance/triage-queue"
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Triage Queue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {alerts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
                  <p className="text-sm font-bold text-slate-700">No active disease outbreaks reported</p>
                  <p className="text-xs text-slate-400">All regional surveillance sentinel nodes reporting normal biosecurity</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl mt-0.5 ${
                            alert.severity === 'critical'
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-slate-900">
                              {alert.disease_name || 'Syndromic Alert'}
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                alert.severity === 'critical'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Active containment radius: {alert.containment_zone_radius_km || 10} km zone
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {alert.district || 'State Veterinary Zone'}
                            </span>
                            <span>•</span>
                            <span>{new Date(alert.issued_at).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href="/surveillance/map"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer whitespace-nowrap"
                        >
                          Locate
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: Biosecurity Protocols & GIS Shortcut */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-teal-400 tracking-wider">
                    Geospatial GIS Radar
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Outbreak Geospatial Grid</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Visualize disease clusters, vector density, and 10km containment quarantine buffer zones.
                  </p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Monitored Districts:</span>
                    <span className="font-bold text-white">766</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Sentinel Stations:</span>
                    <span className="font-bold text-white">4,280</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Containment Zones:</span>
                    <span className="font-bold text-emerald-400">0 Active</span>
                  </div>
                </div>
                <Link
                  href="/surveillance/map"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open Fullscreen GIS Map</span>
                </Link>
              </div>

              {/* National Advisories Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Standing Ministry Directives</span>
                </h3>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-900 block">DAHD/2026/AMU-CIRCULAR-04</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Mandatory zero-sale enforcement on Colistin & Critically Important Fluoroquinolones.
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="font-bold text-slate-900 block">FSSAI/DOC/MRL-MILK-STD</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Updated statutory MRL limits: Oxytetracycline 100 µg/kg, Cefquinome 20 µg/kg.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MRL Lab Assays & Residue Compliance */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-emerald-700" />
                  <span>NABL Accredited Laboratory Residue Testing Log</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Residue assays from dairy chilling centers, state testing labs, and bulk milk coolers
                </p>
              </div>
              <Link
                href="/lab-results"
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>Submit Lab Assay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Sample ID</th>
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Tested Analyte</th>
                    <th className="pb-3">FSSAI MRL Limit</th>
                    <th className="pb-3">Measured Level</th>
                    <th className="pb-3">Compliance Verdict</th>
                    <th className="pb-3 text-right">Testing Lab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-slate-900">LAB-2026-8812</td>
                    <td className="py-3 font-bold text-slate-800">Cow Milk (Bulk Cooler)</td>
                    <td className="py-3">Oxytetracycline</td>
                    <td className="py-3">100 µg/kg</td>
                    <td className="py-3 font-mono font-bold text-emerald-700">14.2 µg/kg</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        COMPLIANT (PASS)
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-500">NABL Pune Dairy Lab</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-slate-900">LAB-2026-8813</td>
                    <td className="py-3 font-bold text-slate-800">Buffalo Milk (Co-op 4)</td>
                    <td className="py-3">Enrofloxacin</td>
                    <td className="py-3">10 µg/kg</td>
                    <td className="py-3 font-mono font-bold text-emerald-700">1.8 µg/kg</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        COMPLIANT (PASS)
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-500">NDRI Karnal Quality Lab</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-slate-900">LAB-2026-8814</td>
                    <td className="py-3 font-bold text-slate-800">Aquaculture (Shrimp)</td>
                    <td className="py-3">Chloramphenicol</td>
                    <td className="py-3">0.0 µg/kg (Zero Tolerance)</td>
                    <td className="py-3 font-mono font-bold text-emerald-700">&lt; 0.1 µg/kg (ND)</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        COMPLIANT (PASS)
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-500">MPEDA Cochin Assay Unit</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-slate-900">LAB-2026-8790</td>
                    <td className="py-3 font-bold text-slate-800">Cow Milk (Farm Unit 12)</td>
                    <td className="py-3">Sulfonamides</td>
                    <td className="py-3">100 µg/kg</td>
                    <td className="py-3 font-mono font-bold text-red-600">114.5 µg/kg</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-200">
                        NON-COMPLIANT (QUARANTINED)
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-500">State Food Lab Anand</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Regulatory Medicines & FSSAI Rules */}
      {activeTab === 'formulary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Approved Medicines Catalog */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-teal-700" />
                    <span>Approved Medicines Formulary</span>
                  </h3>
                  <p className="text-xs text-slate-500">Active molecules approved for veterinary administration</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddMed(true)}
                  leftIcon={<PlusCircle className="w-4 h-4 text-white" />}
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  Add Medicine
                </Button>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {medicines.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">{m.name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {m.active_ingredient} • <span className="text-teal-700 font-bold">{m.antimicrobial_class}</span>
                      </p>
                    </div>
                    <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      {m.strength || 'Active'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* FSSAI Statutory Withdrawal & MRL Rules */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-700" />
                    <span>FSSAI Statutory MRL Standards</span>
                  </h3>
                  <p className="text-xs text-slate-500">Species-specific withholding mandates & residue ceilings</p>
                </div>
                <Badge variant="info" className="bg-teal-50 text-teal-700 border-teal-200">
                  FSSAI Gazette 2026
                </Badge>
              </div>

              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {rules.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200/60 space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-black text-teal-950 text-sm capitalize">
                        {r.species} — {r.product}
                      </span>
                      <span className="text-teal-800 font-black text-xs bg-white px-2 py-0.5 rounded-full border border-teal-300">
                        {r.withdrawal_days} Days Withholding
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-xs">
                      <span>MRL Residue Limit: <strong className="text-slate-800">{r.mrl}</strong></span>
                      <span>Jurisdiction: {r.jurisdiction || 'National'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Cross-Module Launchpad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/surveillance"
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-teal-500 transition-all shadow-sm group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h4 className="font-black text-sm text-slate-900 mt-3">Biosecurity Grid</h4>
          <p className="text-xs text-slate-500 mt-0.5">National syndromic surveillance monitors</p>
        </Link>

        <Link
          href="/surveillance/map"
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-teal-500 transition-all shadow-sm group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-red-50 text-red-700 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h4 className="font-black text-sm text-slate-900 mt-3">GIS Outbreak Map</h4>
          <p className="text-xs text-slate-500 mt-0.5">Live spatial disease clusters & vectors</p>
        </Link>

        <Link
          href="/analytics/ml-risk"
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-teal-500 transition-all shadow-sm group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h4 className="font-black text-sm text-slate-900 mt-3">AI Risk Intelligence</h4>
          <p className="text-xs text-slate-500 mt-0.5">Dual ML models for AMU overuse & MRLs</p>
        </Link>

        <Link
          href="/reports"
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-teal-500 transition-all shadow-sm group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h4 className="font-black text-sm text-slate-900 mt-3">Statutory PDF / CSV</h4>
          <p className="text-xs text-slate-500 mt-0.5">Official compliance dossiers for audits</p>
        </Link>
      </div>

      {/* Add Medicine Modal */}
      {showAddMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-2 border-teal-800 rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-4 text-xs font-bold text-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-lg font-black text-teal-900">Add Statutory Approved Medicine</h2>
              <button
                onClick={() => setShowAddMed(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1">Medicine Trade Name *</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Cefquinome Inj 2.5%"
                  className="w-full bg-[#FFFDF5] border border-gray-300 rounded-2xl px-4 py-2.5 text-sm text-gray-900 focus:border-teal-700 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Active Ingredient *</label>
                <input
                  type="text"
                  required
                  value={medActiveIng}
                  onChange={(e) => setMedActiveIng(e.target.value)}
                  placeholder="e.g. Cefquinome Sulfate"
                  className="w-full bg-[#FFFDF5] border border-gray-300 rounded-2xl px-4 py-2.5 text-sm text-gray-900 focus:border-teal-700 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Antimicrobial Class</label>
                <select
                  value={medClass}
                  onChange={(e) => setMedClass(e.target.value)}
                  className="w-full bg-[#FFFDF5] border border-gray-300 rounded-2xl px-4 py-2.5 text-sm text-gray-900 focus:border-teal-700 focus:outline-none font-bold"
                >
                  <option value="Penicillins">Penicillins</option>
                  <option value="Cephalosporins (4th Gen - HPCIA)">Cephalosporins (4th Gen - HPCIA)</option>
                  <option value="Fluoroquinolones (HPCIA)">Fluoroquinolones (HPCIA)</option>
                  <option value="Tetracyclines">Tetracyclines</option>
                  <option value="Macrolides (HPCIA)">Macrolides (HPCIA)</option>
                  <option value="Aminoglycosides">Aminoglycosides</option>
                  <option value="Sulfonamides">Sulfonamides</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
                <Button type="button" variant="ghost" onClick={() => setShowAddMed(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="bg-teal-700 hover:bg-teal-800">
                  Save & Publish Rule
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
