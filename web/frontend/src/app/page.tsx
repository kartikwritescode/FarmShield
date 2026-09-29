'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Wheat,
  Stethoscope,
  Building2,
  Activity,
  Calendar,
  MapPin,
  QrCode,
  Cpu,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Check,
  TrendingUp,
  FileCheck2,
  Shield,
  HeartPulse,
  Microscope,
  Lock,
  WifiOff,
  FileSpreadsheet,
  FileX,
  ShieldAlert,
  ChevronRight,
  Zap,
  ArrowDown,
  ArrowUp,
  Radio,
  Compass,
  Database,
  CloudSun,
  FileText,
  Search,
  Bell,
  SlidersHorizontal,
  FolderHeart,
  Pill,
} from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingFooter } from '../components/landing/LandingFooter';

export default function PublicLandingPage() {
  const [mapActiveLayer, setMapActiveLayer] = useState<'all' | 'critical' | 'containment'>('all');

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-teal-700 selection:text-white overflow-x-hidden w-full">
      {/* 1. STICKY NAVBAR */}
      <LandingNavbar />

      {/* 2, 3 & 4. HERO SECTION WITH EXACT HEADLINE, BADGE, AND FLOATING PRODUCT VISUALIZATION */}
      <section
        id="hero"
        className="relative pt-8 sm:pt-14 pb-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-teal-50/40 via-white to-white border-b border-slate-100"
      >
        <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-gradient-to-br from-teal-200/20 via-emerald-100/20 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Badge, Exact Headline, Supporting Text, and Action CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Badge above heading */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/90 text-teal-900 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-2xs max-w-full">
                <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                <span className="truncate sm:overflow-visible">DIGITAL LIVESTOCK HEALTH &amp; SURVEILLANCE PLATFORM</span>
              </div>

              {/* Exact 3-line Headline */}
              <h1 className="text-3xl min-[390px]:text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] break-words">
                Smarter Livestock.
                <br />
                Safer Food.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-800 to-emerald-600">
                  Healthier Farms.
                </span>
              </h1>

              {/* Exact Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
                FarmShield brings livestock health, disease surveillance, treatment intelligence, and
                food safety monitoring into one connected digital platform.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <Link
                  href="/login"
                  className="px-7 py-3.5 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-md shadow-teal-900/15 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#platform"
                  className="px-6 py-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <span>Explore Platform</span>
                </a>
              </div>

              {/* Trust highlights checklist */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time PostGIS surveillance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>FSSAI MRL compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>INAPH 12-digit ear tag passports</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>One Health antimicrobial controls</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Dashboard Product Visualization with Subtle Floating Elements */}
            <div className="lg:col-span-6 relative mt-6 lg:mt-0">
              {/* Subtle Floating Element 1: "98% Health Compliance" */}
              <div className="hidden sm:flex absolute -top-4 -left-4 z-20 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-black text-slate-800">98% Health Compliance</span>
              </div>

              {/* Subtle Floating Element 2: "12 Active Alerts" */}
              <div className="hidden lg:flex absolute top-1/2 -left-6 -translate-y-1/2 z-20 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs font-black text-slate-800">12 Active Alerts</span>
              </div>

              {/* Subtle Floating Element 3: "AMU Risk: Low" */}
              <div className="hidden sm:flex absolute -bottom-4 -right-4 z-20 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-xs font-black text-slate-800">AMU Risk: Low</span>
              </div>

              {/* Floating Real Product Dashboard Window */}
              <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-teal-900/10 overflow-hidden">
                {/* Dashboard Window Header Bar */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-slate-400 truncate max-w-[200px] sm:max-w-none">
                    farmshield.gov.in/dashboard
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-teal-800">Live Dashboard</span>
                  </div>
                </div>

                {/* Dashboard Interior Simulation */}
                <div className="p-4 sm:p-6 space-y-4 bg-slate-50/50">
                  {/* Farm Header */}
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        Govind Dairy Farm (#PB-104)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        District Surveillance Zone: Ludhiana West • Synchronized
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  {/* 6 Key Modules Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {/* 1. Healthy Herds */}
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Healthy Herds
                        </span>
                        <Wheat className="w-3.5 h-3.5 text-teal-700" />
                      </div>
                      <div className="text-base font-black text-slate-900">46 / 48</div>
                      <span className="text-[10px] text-emerald-700 font-bold block truncate">
                        ✓ 96% Normal Vitals
                      </span>
                    </div>

                    {/* 2. Animals Under Care */}
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Animals Under Care
                        </span>
                        <Activity className="w-3.5 h-3.5 text-blue-700" />
                      </div>
                      <div className="text-base font-black text-slate-900">2 Cattle</div>
                      <span className="text-[10px] text-blue-700 font-bold block truncate">
                        Active Clinical Rx
                      </span>
                    </div>

                    {/* 3. Withdrawal Status */}
                    <div className="p-3 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-1 bg-rose-50/30">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700">
                          Withdrawal Status
                        </span>
                        <Clock className="w-3.5 h-3.5 text-rose-600" />
                      </div>
                      <div className="text-base font-black text-rose-800">18h Rem.</div>
                      <span className="text-[10px] text-rose-700 font-bold block truncate">
                        Milk Withholding
                      </span>
                    </div>

                    {/* 4. Disease Risk */}
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Disease Risk
                        </span>
                        <Shield className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <div className="text-base font-black text-emerald-800">Low Risk</div>
                      <span className="text-[10px] text-slate-500 font-medium block truncate">
                        0 in 5km PostGIS Ring
                      </span>
                    </div>

                    {/* 5. AMU Monitoring */}
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          AMU Monitoring
                        </span>
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                      </div>
                      <div className="text-base font-black text-teal-800">Prudent</div>
                      <span className="text-[10px] text-slate-500 font-medium block truncate">
                        0 Prohibited CIA Drugs
                      </span>
                    </div>

                    {/* 6. Alerts */}
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                          Alerts
                        </span>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div className="text-base font-black text-amber-700">1 Advisory</div>
                      <span className="text-[10px] text-slate-500 font-medium block truncate">
                        FMD Booster Due
                      </span>
                    </div>
                  </div>

                  {/* Active Treatment Card */}
                  <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                        🐄
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs font-black text-slate-900 block truncate">
                          Cow #PB-104 • Amoxicillin 15%
                        </strong>
                        <span className="text-[10px] text-slate-500 block truncate">
                          Withholding: 18h remaining • Milk Sale Prohibited
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 shrink-0">
                      Locked
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TRUST / IMPACT STRIP */}
      <section className="py-8 bg-slate-50/80 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
            <div className="text-center md:text-left md:px-4 space-y-1">
              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider block">
                ONE PLATFORM
              </span>
              <p className="text-xs text-slate-500 font-medium">
                for livestock health and surveillance
              </p>
            </div>

            <div className="pt-4 md:pt-0 text-center md:text-left md:px-6 space-y-1">
              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider block">
                3 USER ECOSYSTEMS
              </span>
              <p className="text-xs text-slate-500 font-medium">
                Farmers • Veterinarians • Government
              </p>
            </div>

            <div className="pt-4 md:pt-0 text-center md:text-left md:px-6 space-y-1">
              <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider block">
                CONNECTED INTELLIGENCE
              </span>
              <p className="text-xs text-slate-500 font-medium">
                Health • Safety • Surveillance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PROBLEM SECTION */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-rose-700 px-3 py-1 rounded-full bg-rose-50 border border-rose-200">
              The Industry Challenge
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Livestock health shouldn&apos;t be managed in silos.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Traditional livestock management relies on fragmented paper records, disconnected clinical
              treatments, and slow state reporting—creating critical gaps in food safety and biosecurity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50/60 border border-slate-200/80 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
                <FileX className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Fragmented Animal Records
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paper cards and lost ear tags leave lifetime health, breed, and ownership history unverified
                at milk collection and livestock trading centers.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/60 border border-slate-200/80 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Scattered Health Information
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clinical diagnosis notes, vaccination histories, and prescriptions are trapped in local
                field diaries with zero continuity across veterinary visits.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/60 border border-slate-200/80 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Delayed Disease Detection
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Contagious syndromic outbreaks take days or weeks to reach district officers, leading to
                preventable spread across neighboring herds and markets.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/60 border border-slate-200/80 shadow-2xs space-y-3 hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Limited AMU/MRL Visibility
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Without automated milk and meat withholding countdowns, accidental antimicrobial residue
                violations endanger consumer food safety and trade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SOLUTION SECTION: ONE CONNECTED PLATFORM WITH ARCHITECTURAL DIAGRAM */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-white via-teal-50/20 to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              The Connected Solution
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              One connected platform for the entire livestock ecosystem.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              FarmShield places unified digital intelligence at the core, connecting farmers, veterinarians,
              and government authorities in an auditable, real-time One Health loop.
            </p>
          </div>

          {/* Connected Stakeholders Visual Diagram */}
          <div className="max-w-4xl mx-auto relative px-2 sm:px-4">
            <div className="flex flex-col items-center gap-6 sm:gap-8">
              {/* TOP NODE: FARMERS */}
              <div className="w-full max-w-sm p-4 sm:p-5 rounded-2xl bg-white border border-teal-200 shadow-md flex items-center gap-3.5 group hover:border-teal-400 transition-all">
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-lg shrink-0">
                  <Wheat className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                    Livestock Producers
                  </span>
                  <h4 className="text-sm font-black text-slate-900">FARMERS</h4>
                  <p className="text-[11px] text-slate-500">
                    Herd health records • Live withholding countdowns • INAPH QR passports
                  </p>
                </div>
              </div>

              {/* TOP CONNECTOR LINE */}
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-6 sm:h-8 bg-gradient-to-b from-teal-400 to-teal-700 animate-pulse" />
                <ArrowDown className="w-3.5 h-3.5 text-teal-700 -mt-1" />
              </div>

              {/* MIDDLE ROW: VETERINARIANS <---> FARMSHIELD CORE <---> GOVERNMENT */}
              <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-4 relative">
                {/* LEFT NODE: VETERINARIANS */}
                <div className="w-full lg:w-72 p-4 sm:p-5 rounded-2xl bg-white border border-blue-200 shadow-md flex items-center gap-3.5 group hover:border-blue-400 transition-all shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center font-bold text-lg shrink-0">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                      Clinical Practice
                    </span>
                    <h4 className="text-sm font-black text-slate-900">VETERINARIANS</h4>
                    <p className="text-[11px] text-slate-500">
                      Digital Rx logs • Automated MRL math • CIA drug stewardship
                    </p>
                  </div>
                </div>

                {/* HORIZONTAL CONNECTOR LEFT (DESKTOP) */}
                <div className="hidden lg:flex items-center flex-1 justify-center">
                  <div className="h-0.5 w-full bg-gradient-to-r from-blue-400 via-teal-500 to-teal-700 animate-pulse" />
                </div>

                {/* CENTER HUB: FARMSHIELD CORE PLATFORM */}
                <div className="w-full sm:w-80 p-6 rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white shadow-2xl border-2 border-teal-500/50 flex flex-col items-center text-center relative shrink-0 group">
                  <div className="absolute -inset-1 rounded-3xl bg-teal-500/20 blur-md pointer-events-none animate-pulse" />

                  <div className="w-12 h-12 rounded-2xl bg-teal-700/80 border border-teal-400/60 flex items-center justify-center text-white mb-3 shadow-lg">
                    <ShieldCheck className="w-7 h-7 stroke-[2.4]" />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-widest text-teal-300">
                    CENTRAL PLATFORM
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                    FARMSHIELD
                  </h3>
                  <p className="text-xs text-teal-100/80 mt-1 leading-relaxed">
                    The Central Digital Nervous System &amp; One Health Data Engine
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-700/60 border border-teal-400/40 text-[10px] font-bold text-teal-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real-Time Biosecurity Mesh</span>
                  </div>
                </div>

                {/* HORIZONTAL CONNECTOR RIGHT (DESKTOP) */}
                <div className="hidden lg:flex items-center flex-1 justify-center">
                  <div className="h-0.5 w-full bg-gradient-to-r from-teal-700 via-teal-500 to-emerald-400 animate-pulse" />
                </div>

                {/* RIGHT NODE: GOVERNMENT */}
                <div className="w-full lg:w-72 p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 shadow-md flex items-center gap-3.5 group hover:border-emerald-400 transition-all shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      State &amp; National Bodies
                    </span>
                    <h4 className="text-sm font-black text-slate-900">GOVERNMENT</h4>
                    <p className="text-[11px] text-slate-500">
                      PostGIS disease radar • 5km quarantine rings • 4h SLA triage
                    </p>
                  </div>
                </div>
              </div>

              {/* BOTTOM CONNECTOR LINE */}
              <div className="flex flex-col items-center">
                <ArrowDown className="w-3.5 h-3.5 text-teal-700 -mb-1" />
                <div className="w-0.5 h-6 sm:h-8 bg-gradient-to-b from-teal-700 to-teal-400 animate-pulse" />
              </div>

              {/* BOTTOM NODE: HEALTH INTELLIGENCE */}
              <div className="w-full max-w-sm p-4 sm:p-5 rounded-2xl bg-white border border-teal-200 shadow-md flex items-center gap-3.5 group hover:border-teal-400 transition-all">
                <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-lg shrink-0">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                    Predictive Analytics &amp; Safety
                  </span>
                  <h4 className="text-sm font-black text-slate-900">HEALTH INTELLIGENCE</h4>
                  <p className="text-[11px] text-slate-500">
                    Dual ML overuse risk models • Pharmacokinetic clearance • NABL lab bridge
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. THREE ROLE SOLUTIONS */}
      <section id="solutions" className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              Role-Based Solutions
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Built for every part of the livestock ecosystem.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              FarmShield delivers three dedicated role dashboards engineered around the operational
              realities of farmers, veterinary doctors, and national biosecurity inspectors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1: FARMER */}
            <div className="bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Wheat className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                    FARMER
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-snug">
                    &ldquo;Everything you need to manage healthier livestock.&rdquo;
                  </h3>
                </div>
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Features:
                  </span>
                  <ul className="space-y-2.5 text-sm text-slate-700 font-medium">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Livestock registry</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Animal health</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Treatments</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Withdrawal tracking</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Alerts</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Animal passport</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/login?role=farmer"
                  className="w-full py-3.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all hover:shadow-md cursor-pointer"
                >
                  <span>Explore Farmer Portal →</span>
                </Link>
              </div>
            </div>

            {/* Card 2: VETERINARIAN */}
            <div className="bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                    VETERINARIAN
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-snug">
                    &ldquo;Better data for better veterinary decisions.&rdquo;
                  </h3>
                </div>
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Features:
                  </span>
                  <ul className="space-y-2.5 text-sm text-slate-700 font-medium">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Herd health</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Treatment management</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>AMU analytics</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Lab results</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Disease surveillance</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Risk assessment</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/login?role=veterinarian"
                  className="w-full py-3.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all hover:shadow-md cursor-pointer"
                >
                  <span>Explore Vet Portal →</span>
                </Link>
              </div>
            </div>

            {/* Card 3: GOVERNMENT */}
            <div className="bg-white rounded-3xl border border-slate-200/90 hover:border-teal-400 p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                    GOVERNMENT
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 leading-snug">
                    &ldquo;Population-level visibility into livestock health.&rdquo;
                  </h3>
                </div>
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Features:
                  </span>
                  <ul className="space-y-2.5 text-sm text-slate-700 font-medium">
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Disease surveillance</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>GIS risk mapping</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>MRL / AMU monitoring</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Compliance</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>Reports</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      <span>System analytics</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/login?role=admin"
                  className="w-full py-3.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all hover:shadow-md cursor-pointer"
                >
                  <span>Explore Government Portal →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FEATURE SHOWCASE: "Everything you need. Connected." (Alternating Layouts) */}
      <section id="features" className="py-20 sm:py-28 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Everything you need. Connected.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Six synchronized pillars transforming fragmented animal records into real-time health intelligence.
            </p>
          </div>

          <div className="space-y-16 lg:space-y-24">
            {/* Feature 01: Livestock Intelligence (Text Left, Visual Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-2xl font-black text-teal-800 font-mono">01</span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Livestock Intelligence
                </h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  &ldquo;Track every animal from registration to health history.&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Log complete medical chronologies, parity history, RFID tag telemetry, and daily milk yields.
                  Prevent lost animals through official 12-digit INAPH ear-tag mapping.
                </p>
              </div>

              <div className="lg:col-span-7">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-base">
                        🐄
                      </div>
                      <div>
                        <strong className="text-sm font-black text-slate-900 block">
                          Gauri • Tag #IN-PB-104-9841
                        </strong>
                        <span className="text-xs text-slate-500">
                          Murrah Buffalo • Parity 3 • Age 4y 8m
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      Normal Vitals
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Daily Milk</span>
                      <strong className="text-slate-800">14.2 L / day</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">Last Vaccine</span>
                      <strong className="text-slate-800">FMD Oil-Adj.</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px]">RFID Sync</span>
                      <strong className="text-emerald-700">✓ Verified</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 02: Disease Surveillance (Visual Left, Text Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <strong className="text-xs font-mono text-teal-300">
                        Syndromic Spike Detected: Block Ludhiana-W
                      </strong>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      4-Hour SLA Triggered
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Syndromic Reports (Last 24h):</span>
                      <strong className="text-rose-400">7 Suspect Cases (Salivation &amp; Lesions)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Assigned DVO Response Team:</span>
                      <strong className="text-emerald-400">Dr. H. Sandhu (Dispatched)</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
                <span className="text-2xl font-black text-teal-800 font-mono">02</span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Disease Surveillance
                </h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  &ldquo;Detect emerging health risks before they spread.&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Real-time syndromic triage flags contagious illness clusters instantly. Automatically
                  dispatches district officers under a strict 4-hour regulatory response protocol.
                </p>
              </div>
            </div>

            {/* Feature 03: AMU & MRL Monitoring (Text Left, Visual Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-2xl font-black text-teal-800 font-mono">03</span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  AMU &amp; MRL Monitoring
                </h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  &ldquo;Monitor antimicrobial usage and residue compliance.&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Automatically calculates milk and meat withholding countdowns according to FSSAI residue limits.
                  Blocks collection of treated milk until full drug clearance is certified.
                </p>
              </div>

              <div className="lg:col-span-7">
                <div className="p-6 rounded-3xl bg-white border border-rose-200/90 shadow-lg space-y-4 bg-rose-50/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                      Active Statutory Withholding Meter
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                      Zero Milk Sale
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Ceftiofur Sodium (1g IV) • Cow #PB-104</span>
                      <strong className="text-rose-700">18 Hours Remaining</strong>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-rose-500 h-2.5 rounded-full w-4/5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    FSSAI Maximum Residue Limit: 100 µg/kg. Safe clearance time: Tomorrow 06:00 AM.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 04: Geospatial Intelligence (Visual Left, Text Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-700" /> PostGIS Outbreak Buffer Active
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">EPSG:4326</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Containment Ring Radius:</span>
                      <strong className="text-teal-900">5.0 km Automated Quarantine Buffer</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Affected Dairy Farms Inside Ring:</span>
                      <strong className="text-teal-900">42 Herds (1,240 Animals Notified via SMS)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Chilling Center Advisory:</span>
                      <strong className="text-amber-800">Lot Testing Mandatory Before Bulk Tanking</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
                <span className="text-2xl font-black text-teal-800 font-mono">04</span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Geospatial Intelligence
                </h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  &ldquo;Visualize health risks across locations.&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Automated PostGIS geospatial buffers flag dairy farms, chilling centers, and livestock
                  markets inside disease perimeters, with meteorological vector risk correlations.
                </p>
              </div>
            </div>

            {/* Feature 05: Animal Passport (Text Left, Visual Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-2xl font-black text-teal-800 font-mono">05</span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Animal Passport
                </h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  &ldquo;Give every animal a secure digital identity.&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Cryptographically signed digital animal passports accessible via QR code. Allows chilling
                  plants and livestock buyers to instantly audit health status and residue clearance.
                </p>
              </div>

              <div className="lg:col-span-7">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-teal-700" />
                      <strong className="text-sm font-black text-slate-900">
                        Official Digital Livestock Passport
                      </strong>
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Animal ID: INAPH-904128 • Holstein Friesian • Cryptographic Seal: #7F0A-2026-OK
                    </p>
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                        ✓ FSSAI Residue-Free
                      </span>
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                        ✓ Certified Healthy
                      </span>
                    </div>
                  </div>
                  <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-teal-300 flex items-center justify-center shrink-0">
                    <QrCode className="w-16 h-16 text-teal-800" />
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 06: Smart Alerts (Visual Left, Text Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-700" /> Multi-Channel Health Notification Mesh
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">Live Push Active</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between">
                      <span className="text-teal-900 font-semibold">
                        📲 SMS Advisory: FMD Booster Due within 7 Days (Sent to 48 Farmers)
                      </span>
                      <span className="text-[10px] text-teal-700 font-bold shrink-0 ml-2">Delivered</span>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                      <span className="text-amber-900 font-semibold">
                        ⚠️ Withholding Alert: Cow #PB-104 Milk Clearance at 06:00 AM Tomorrow
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold shrink-0 ml-2">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
                <span className="text-2xl font-black text-teal-800 font-mono">06</span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Smart Alerts
                </h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  &ldquo;Turn data into actionable health alerts.&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Automated SMS, push, and emergency broadcast dispatching to notify farmers of booster
                  schedules, withholding expirations, and nearby quarantine perimeters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. PRODUCT PREVIEW: "See FarmShield in action." (Large Dashboard Showcase) */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              Interactive Dashboard Tour
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              See FarmShield in action.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              A single operational dashboard integrating herd registries, clinical prescriptions, laboratory
              assays, and regional biosecurity alarms.
            </p>
          </div>

          {/* Large Dashboard Window with Sidebar & Complete UI */}
          <div className="rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden">
            {/* Window Chrome Header */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="px-4 py-1 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium text-slate-500 max-w-xs sm:max-w-md w-full text-center truncate">
                https://farmshield.gov.in/dashboard
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                SaaS Production UI
              </span>
            </div>

            {/* Dashboard App Body (Sidebar + Content) */}
            <div className="flex flex-col lg:flex-row min-h-[580px]">
              {/* Mini Sidebar Preview */}
              <div className="hidden lg:flex flex-col w-56 bg-slate-50/70 border-r border-slate-200/80 p-4 space-y-6 shrink-0">
                <div className="flex items-center gap-2.5 px-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-black text-slate-900 block">FarmShield</strong>
                    <span className="text-[10px] text-teal-800 font-bold">v2.4 Production</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-semibold text-slate-600">
                  <div className="px-3 py-2 rounded-xl bg-teal-800 text-white font-bold flex items-center gap-2.5 shadow-xs">
                    <Activity className="w-4 h-4" /> <span>Dashboard</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer">
                    <Wheat className="w-4 h-4 text-slate-400" /> <span>Livestock</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer">
                    <Stethoscope className="w-4 h-4 text-slate-400" /> <span>Treatments</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer">
                    <Microscope className="w-4 h-4 text-slate-400" /> <span>Lab Results</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer">
                    <MapPin className="w-4 h-4 text-slate-400" /> <span>GIS Radar</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer">
                    <FileText className="w-4 h-4 text-slate-400" /> <span>Reports</span>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Space */}
              <div className="flex-1 p-5 sm:p-8 space-y-6 bg-slate-50/30">
                {/* Top Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Cattle</span>
                    <strong className="text-xl sm:text-2xl font-black text-slate-900 block">48 Head</strong>
                    <span className="text-[11px] text-emerald-700 font-bold block">✓ 46 Healthy</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-2xs space-y-1 bg-rose-50/20">
                    <span className="text-[10px] font-bold uppercase text-rose-700 block">Active Withholding</span>
                    <strong className="text-xl sm:text-2xl font-black text-rose-800 block">2 Cattle</strong>
                    <span className="text-[11px] text-rose-700 font-bold block">18h Remaining</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">AMU Compliance</span>
                    <strong className="text-xl sm:text-2xl font-black text-teal-800 block">98.4%</strong>
                    <span className="text-[11px] text-slate-500 font-medium block">Ranked Tier-1 Prudent</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Biosecurity SLA</span>
                    <strong className="text-xl sm:text-2xl font-black text-emerald-800 block">Normal</strong>
                    <span className="text-[11px] text-emerald-700 font-bold block">0 Outbreaks in 5km</span>
                  </div>
                </div>

                {/* Livestock Health Table & Chart Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Table Component */}
                  <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Priority Herd Management</span>
                      <span className="text-[11px] font-mono text-slate-400">INAPH Synced</span>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                      <div className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🐄</span>
                          <div>
                            <strong className="text-slate-900 block font-bold">Laxmi (#PB-104)</strong>
                            <span className="text-slate-500 text-[11px]">Holstein Friesian • 4y 2m</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[11px]">
                          Withdrawal: 18h rem
                        </span>
                      </div>
                      <div className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🐃</span>
                          <div>
                            <strong className="text-slate-900 block font-bold">Gauri (#PB-219)</strong>
                            <span className="text-slate-500 text-[11px]">Murrah Buffalo • 5y 1m</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                          Safe for Milk Sale
                        </span>
                      </div>
                      <div className="p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">🐄</span>
                          <div>
                            <strong className="text-slate-900 block font-bold">Shanti (#PB-302)</strong>
                            <span className="text-slate-500 text-[11px]">Sahiwal Cow • 3y 6m</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                          Safe for Milk Sale
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Chart / Risk Indicator Component */}
                  <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-slate-800">
                        Monthly AMU Prudence Index
                      </strong>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                        Target: &gt;90%
                      </span>
                    </div>

                    {/* Chart Bars */}
                    <div className="space-y-2 pt-2">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>Beta-Lactams (Prudent Tier-1)</span>
                          <strong className="text-slate-900">76% Usage</strong>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-teal-700 h-2 rounded-full w-3/4" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>Cephalosporins 3rd Gen (Restricted CIA)</span>
                          <strong className="text-amber-700">3% (Audited)</strong>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full w-1/12" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>Fluoroquinolones (Restricted)</span>
                          <strong className="text-teal-800">1% (Prudent)</strong>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full w-[4%]" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>FSSAI Compliant: 100% Zero Violation</span>
                      <Link href="/login" className="text-teal-800 font-bold hover:underline">
                        Open Full View →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. HOW IT WORKS: SIMPLE 3-STEP HORIZONTAL TIMELINE */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              Simple Workflow
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              How FarmShield Works
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              Three streamlined steps from field registration to decisive public health action.
            </p>
          </div>

          {/* 3 Horizontal Steps on Desktop, Stacked on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 01: Register */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 relative group hover:border-teal-400 transition-all">
              <span className="text-3xl font-black text-teal-800 font-mono block">01</span>
              <h3 className="text-xl font-black text-slate-900">Register</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Register farms, animals, and users.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
                Issue 12-digit INAPH ear-tag credentials, profile breeds, and establish baseline biometric health files.
              </p>
            </div>

            {/* Step 02: Monitor */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 relative group hover:border-teal-400 transition-all">
              <span className="text-3xl font-black text-teal-800 font-mono block">02</span>
              <h3 className="text-xl font-black text-slate-900">Monitor</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track health, treatment, disease, AMU and MRL information.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
                Log clinical observations, calculate drug withdrawal countdowns, and verify milk batches at chilling plants.
              </p>
            </div>

            {/* Step 03: Act */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 relative group hover:border-teal-400 transition-all">
              <span className="text-3xl font-black text-teal-800 font-mono block">03</span>
              <h3 className="text-xl font-black text-slate-900">Act</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive alerts, analyze risk, and make informed decisions.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
                Trigger 4-hour SLA officer escalations, activate 5km containment rings, and enforce export food safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 12. DATA / INTELLIGENCE SECTION: DATA -> FARMSHIELD INTELLIGENCE -> ACTIONABLE INSIGHTS */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              Data Pipeline &amp; ML Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Transforming Raw Field Data into Real-Time Intelligence.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              FarmShield continuously ingests heterogeneous field streams, standardizes them through predictive
              models, and outputs instant actionable decisions.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Top Stage: DATA */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 block">
                STAGE 1 • RAW DATA INGESTION
              </span>
              <h3 className="text-lg font-black text-slate-900">DATA</h3>
              <div className="flex flex-wrap justify-center gap-2.5">
                {['Animals', 'Treatments', 'Lab Results', 'AMU', 'Disease Reports', 'Weather'].map((item) => (
                  <span
                    key={item}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-slate-700 shadow-2xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Downward Pulse Arrow 1 */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-gradient-to-b from-slate-400 to-teal-700 animate-pulse" />
              <ArrowDown className="w-4 h-4 text-teal-700 -mt-1" />
            </div>

            {/* Middle Stage: FARMSHIELD INTELLIGENCE */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white text-center space-y-3 shadow-xl border-2 border-teal-500/40 relative">
              <span className="text-xs font-black uppercase tracking-widest text-teal-300 block">
                STAGE 2 • PROCESSING CORE
              </span>
              <h3 className="text-2xl font-black tracking-tight">
                FARMSHIELD INTELLIGENCE
              </h3>
              <p className="text-xs sm:text-sm text-teal-100/90 max-w-xl mx-auto leading-relaxed">
                24-Feature XGBoost Overuse Propensity Engine • Pharmacokinetic Clearance Regressors • PostGIS Spatial Clustering
              </p>
            </div>

            {/* Downward Pulse Arrow 2 */}
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-gradient-to-b from-teal-700 to-emerald-500 animate-pulse" />
              <ArrowDown className="w-4 h-4 text-emerald-600 -mt-1" />
            </div>

            {/* Bottom Stage: ACTIONABLE INSIGHTS */}
            <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200 text-center space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-800 block">
                STAGE 3 • DECISION OUTPUTS
              </span>
              <h3 className="text-lg font-black text-slate-900">ACTIONABLE INSIGHTS</h3>
              <div className="flex flex-wrap justify-center gap-2.5">
                {['Risk Alerts', 'Disease Trends', 'Compliance', 'Health Recommendations'].map((item) => (
                  <span
                    key={item}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-900 shadow-2xs"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. GOVERNMENT / PUBLIC HEALTH SECTION: GIS/MAP VISUALIZATION */}
      <section className="py-20 sm:py-28 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800">
              Population-Level Biosecurity
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              From individual animals to population-level intelligence.
            </h2>
            <p className="text-base text-slate-300 leading-relaxed font-normal">
              State veterinary departments and national biosecurity directorates leverage FarmShield
              to monitor disease trends, detect geographic hotspots, audit AMU patterns, and guarantee food safety compliance.
            </p>
          </div>

          {/* GIS Outbreak Map Canvas & Metrics Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* GIS Map Visualization Canvas (Using Existing Project Styles) */}
            <div className="lg:col-span-8 bg-slate-950 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <strong className="text-xs font-mono text-teal-300">
                    Live GIS Containment Layer • PostGIS EPSG:4326
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMapActiveLayer('all')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer ${
                      mapActiveLayer === 'all' ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    All Incidents
                  </button>
                  <button
                    onClick={() => setMapActiveLayer('containment')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer ${
                      mapActiveLayer === 'containment' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    5km Rings
                  </button>
                </div>
              </div>

              {/* Map Canvas Frame */}
              <div className="relative w-full h-[400px] sm:h-[460px] bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-30" />

                {/* Simulated 5km Containment Zone Ring */}
                <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-red-500/60 bg-red-500/10 flex items-center justify-center animate-pulse">
                  {/* 10km Outer Surveillance Zone */}
                  <div className="w-[380px] h-[380px] rounded-full border border-amber-500/30 bg-amber-500/5 absolute pointer-events-none" />
                  <div className="text-[10px] text-red-400 font-bold tracking-widest uppercase bg-slate-950/90 px-3 py-1 rounded-full border border-red-500/50">
                    5km Biosecurity Containment Core (Ludhiana-W)
                  </div>
                </div>

                {/* Hotspot Markers */}
                <div className="absolute top-[48%] left-[46%] -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-5 h-5 rounded-full bg-rose-500 border-2 border-white animate-ping absolute" />
                  <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-lg relative">
                    !
                  </div>
                </div>

                <div className="absolute top-[32%] left-[68%] -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[8px] font-bold text-white shadow">
                    ✓
                  </div>
                </div>

                <div className="absolute bottom-[28%] left-[30%] -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[8px] font-bold text-white shadow">
                    ✓
                  </div>
                </div>

                {/* Bottom Telemetry Overlay */}
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-900/90 backdrop-blur-xs border border-slate-700/80 flex flex-wrap items-center justify-between text-[11px] text-slate-300">
                  <span>Epicenter: 30.9010° N, 75.8573° E</span>
                  <span className="text-amber-400 font-bold">Quarantine: 42 Herds Isolated</span>
                  <span className="text-emerald-400 font-bold">1,240 SMS Sent</span>
                </div>
              </div>
            </div>

            {/* Government Capabilities Explanatory Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4" />
                  <span>Disease Trends &amp; Hotspots</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real-time heatmaps aggregate syndromic reports across districts, revealing early disease vectors
                  weeks before outbreak spikes occur.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                  <Pill className="w-4 h-4" />
                  <span>AMU Patterns &amp; MRL Compliance</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Audit drug classes prescribed in each region. Ensure strict WHO CIA compliance and eliminate
                  violative drug residues from commercial milk batches.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Statutory Compliance &amp; Exports</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generate instant CSV and PDF compliance summaries for DAHD biosecurity audits, export
                  verification, and national epidemiological surveillance databases.
                </p>
              </div>

              <Link
                href="/login?role=admin"
                className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>Launch Authority Console</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 14. ENTERPRISE BIOSECURITY & SECURITY ASSURANCE */}
      <section className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              Enterprise Governance
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Security &amp; Field-Ready Reliability
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Engineered for real-world field conditions across India with enterprise-grade privacy and resilience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Role-Based Access Control</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Granular cryptographic permission barriers ensure private producer data is protected while
                granting authorities the aggregated biosecurity visibility they need.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                <WifiOff className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Offline-First Field Support</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Field veterinarians and remote farmers can record vitals and verify ear tags even without active
                cellular coverage; data automatically syncs upon reconnection.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Statutory Audit Export</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                One-click automated generation of FSSAI residue reports, DAHD epidemiological summaries,
                and export-ready dairy certification documentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 14. CALL TO ACTION */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.18),transparent_50%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative">
          <div className="w-16 h-16 rounded-3xl bg-teal-700/60 border border-teal-500/50 flex items-center justify-center mx-auto text-teal-200 shadow-xl">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to build a healthier livestock ecosystem?
          </h2>

          <p className="text-base sm:text-lg text-teal-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Bring farmers, veterinarians, and government intelligence together with FarmShield.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-teal-950 hover:bg-teal-50 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all hover:scale-105 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-teal-800" />
            </Link>
            <a
              href="#solutions"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-800/80 hover:bg-teal-700/80 text-white font-bold text-sm border border-teal-600/60 flex items-center justify-center gap-2 transition-all hover:bg-teal-700 cursor-pointer"
            >
              <span>Explore Platform</span>
            </a>
          </div>
        </div>
      </section>

      {/* 16. MODERN INSTITUTIONAL FOOTER */}
      <LandingFooter />
    </div>
  );
}
