'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wheat,
  Stethoscope,
  Building2,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  FileText,
  BadgeAlert,
} from 'lucide-react';

type ShowcaseTab = 'farmer' | 'veterinarian' | 'government';

export const ProductShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('farmer');

  return (
    <div className="space-y-8">
      {/* Interactive Tabs Navigation */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs max-w-xl w-full">
          <button
            type="button"
            onClick={() => setActiveTab('farmer')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'farmer'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Wheat className={`w-4 h-4 ${activeTab === 'farmer' ? 'text-white' : 'text-teal-700'}`} />
            <span>Farmer Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('veterinarian')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'veterinarian'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Stethoscope
              className={`w-4 h-4 ${activeTab === 'veterinarian' ? 'text-white' : 'text-teal-700'}`}
            />
            <span>Veterinary Portal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('government')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'government'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2
              className={`w-4 h-4 ${activeTab === 'government' ? 'text-white' : 'text-teal-700'}`}
            />
            <span>Government Console</span>
          </button>
        </div>
      </div>

      {/* Browser Window Mockup Frame */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Browser Top Chrome */}
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="px-4 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-mono font-medium text-slate-500 max-w-xs sm:max-w-md w-full text-center truncate">
            https://farmshield.gov.in/{activeTab === 'farmer' ? 'dashboard' : activeTab === 'veterinarian' ? 'vet/dashboard' : 'admin/surveillance'}
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
            Interactive Live Preview
          </span>
        </div>

        {/* Dynamic Showcase View Content */}
        <div className="p-4 sm:p-7 space-y-6">
          {/* TAB 1: FARMER SHOWCASE */}
          {activeTab === 'farmer' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800">
                    Farmer Dashboard Preview
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Green Valley Dairy Herd & Safe Milk Supply
                  </h3>
                  <p className="text-xs text-slate-500">
                    Statutory Ear-Tag INAPH Tracking & FSSAI Milk Clearance Status
                  </p>
                </div>
                <Link
                  href="/login?role=farmer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold shadow-xs hover:bg-teal-900 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <span>Launch Farmer Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Registered Herd
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">48 Head</div>
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% RFID Tagged
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                    Active Withholding
                  </span>
                  <div className="text-2xl font-black text-rose-900 mt-1">2 Animals</div>
                  <span className="text-[11px] text-rose-800 font-bold flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Zero-Sale Active
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Milk Batch Clearance
                  </span>
                  <div className="text-2xl font-black text-emerald-800 mt-1">100% Safe</div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    Tank #2 Certified Clean
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Next Clearance Due
                  </span>
                  <div className="text-2xl font-black text-teal-800 mt-1">18 Hours</div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" /> Cow #PB-104 (Amoxicillin)
                  </span>
                </div>
              </div>

              {/* Sample Livestock List */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Priority Herd Monitor</span>
                  <span className="text-[11px] text-slate-400 font-mono">FSSAI Status</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="p-3.5 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
                        🐄
                      </div>
                      <div>
                        <strong className="text-slate-900 block font-bold">Laxmi (#PB-104)</strong>
                        <span className="text-slate-500 text-[11px]">Holstein Friesian • 4y 2m</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Withdrawal Active (18h rem)
                    </span>
                  </div>

                  <div className="p-3.5 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
                        🐃
                      </div>
                      <div>
                        <strong className="text-slate-900 block font-bold">Gauri (#PB-219)</strong>
                        <span className="text-slate-500 text-[11px]">Murrah Buffalo • 5y 1m</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Milk Sale Certified Safe
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VETERINARIAN SHOWCASE */}
          {activeTab === 'veterinarian' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800">
                    Veterinarian Portal Preview
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Clinical Prescription & AMU Stewardship Hub
                  </h3>
                  <p className="text-xs text-slate-500">
                    Licensed Drug Authorization, Restricted HPCIA Auditing & Residue Safety
                  </p>
                </div>
                <Link
                  href="/login?role=veterinarian"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold shadow-xs hover:bg-teal-900 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <span>Launch Veterinary Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Prescriptions Logged
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">142 Cases</div>
                  <span className="text-[11px] text-teal-700 font-bold mt-1 block">
                    Current Month (PB-09)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Restricted CIA Audits
                  </span>
                  <div className="text-2xl font-black text-amber-700 mt-1">3 Audited</div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    Cephalosporin (3rd Gen)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    AMU Stewardship Score
                  </span>
                  <div className="text-2xl font-black text-emerald-900 mt-1">94.6%</div>
                  <span className="text-[11px] text-emerald-800 font-bold mt-1 block">
                    Ranked Tier-1 Prudent
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    NABL Lab Assays
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">18 Tested</div>
                  <span className="text-[11px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Non-Violative
                  </span>
                </div>
              </div>

              {/* Clinical AI Prediction Preview */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <strong className="text-teal-900 font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-700" />
                    AI Antimicrobial Overuse Risk Engine (Model A)
                  </strong>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                    Macro F1: 0.884
                  </span>
                </div>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Calculates real-time 95% confidence drug clearance curve based on animal weight (480kg),
                  dose trajectory, and ambient Temperature-Humidity Index (THI). Recommends 7-day milk
                  withholding for Enrofloxacin 10% injection.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: GOVERNMENT SHOWCASE */}
          {activeTab === 'government' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800">
                    Government Console Preview
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    National Biosecurity & GIS Disease Surveillance
                  </h3>
                  <p className="text-xs text-slate-500">
                    Regional Heatmaps, 5km Containment Buffer Rings & Statutory MRL Enforcement
                  </p>
                </div>
                <Link
                  href="/login?role=admin"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-800 text-white text-xs font-bold shadow-xs hover:bg-teal-900 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <span>Launch Government Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* KPI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Active Surveillance Alerts
                  </span>
                  <div className="text-2xl font-black text-rose-700 mt-1">1 Priority</div>
                  <span className="text-[11px] text-rose-800 font-bold mt-1 flex items-center gap-1">
                    <BadgeAlert className="w-3.5 h-3.5" /> FMD Suspect (Block Ludhiana-W)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Herd Immunity (NADCP)
                  </span>
                  <div className="text-2xl font-black text-teal-800 mt-1">87.4%</div>
                  <span className="text-[11px] text-emerald-700 font-bold mt-1 block">
                    Exceeds 85% Target
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    5km Quarantine Rings
                  </span>
                  <div className="text-2xl font-black text-amber-700 mt-1">1 Enclosure</div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                    4-Hour SLA Unit Dispatched
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    FSSAI Residue Compliance
                  </span>
                  <div className="text-2xl font-black text-emerald-800 mt-1">98.9%</div>
                  <span className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Statutory Pass Rate
                  </span>
                </div>
              </div>

              {/* GIS Map Simulation Widget */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-teal-300 font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    GIS Cluster Map Simulation (PostGIS EPSG:4326)
                  </span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                    Live Telemetry Feed
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Zone Epicenter</span>
                    <strong className="text-slate-100">30.9010° N, 75.8573° E</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Quarantine Radius</span>
                    <strong className="text-amber-400">5.0 km Containment Ring</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">SMS Advisory Sent</span>
                    <strong className="text-emerald-400">1,240 Dairy Farmers</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
