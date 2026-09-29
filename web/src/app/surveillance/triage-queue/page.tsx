'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Send, 
  FileText, 
  UserCheck, 
  AlertTriangle,
  ArrowLeft,
  ShieldAlert,
  Activity,
  MapPin,
  RefreshCw,
  Search
} from 'lucide-react';
import { GovHeader } from '../../../components/ui/GovHeader';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from '../../../components/layout/MobileNav';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useAuth } from '../../../providers/AuthProvider';

interface ReportItem {
  id: string;
  species: string;
  disease: string;
  severity: 'LOW' | 'MODERATE' | 'CRITICAL' | 'ZOONOTIC';
  village: string;
  affected: number;
  mortality: number;
  reportedAt: string;
  slaRemainingMinutes: number;
  status: 'reported' | 'investigating' | 'sample_collected' | 'confirmed';
}

export default function TriageQueuePage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportItem[]>([
    {
      id: 'rep_03',
      species: 'Cow',
      disease: 'Suspected Anthrax',
      severity: 'ZOONOTIC',
      village: 'Radhakund (Mathura)',
      affected: 1,
      mortality: 1,
      reportedAt: '45 mins ago',
      slaRemainingMinutes: 45,
      status: 'reported'
    },
    {
      id: 'rep_01',
      species: 'Cow',
      disease: 'Foot-and-Mouth Disease (FMD)',
      severity: 'CRITICAL',
      village: 'Wagholi (Pune)',
      affected: 5,
      mortality: 0,
      reportedAt: '1 hour ago',
      slaRemainingMinutes: 120,
      status: 'reported'
    },
    {
      id: 'rep_02',
      species: 'Buffalo',
      disease: 'Foot-and-Mouth Disease (FMD)',
      severity: 'CRITICAL',
      village: 'Manjari (Pune)',
      affected: 2,
      mortality: 0,
      reportedAt: '2 hours ago',
      slaRemainingMinutes: 60,
      status: 'investigating'
    },
    {
      id: 'rep_04',
      species: 'Cow',
      disease: 'Lumpy Skin Disease (LSD)',
      severity: 'MODERATE',
      village: 'Malegaon (Baramati)',
      affected: 4,
      mortality: 0,
      reportedAt: '3 hours ago',
      slaRemainingMinutes: 180,
      status: 'investigating'
    }
  ]);

  const handleAssign = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'investigating' } : r));
    alert(`Veterinary Rapid Response Unit dispatched for Case ${id}.`);
  };

  const handleReferLab = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'sample_collected' } : r));
    alert(`Diagnostic Lab Chain-of-Custody created for Case ${id}. Barcode: SMP-2026-${id.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <GovHeader />
      <Navbar currentRole={user?.role || 'admin'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8 space-y-6">
          <PageHeader
            badge="BIOSECURITY INCIDENT QUEUE"
            title="Outbreak Triage & Officer Escalation Queue"
            subtitle="4-Hour SLA Escalation Tracking • Diagnostic Sample Dispatch • Rapid Response Coordination"
            icon={ShieldAlert}
            backUrl="/surveillance/map"
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> 1 Zoonotic Priority
                </span>
                <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs">
                  <Clock className="w-4 h-4 text-amber-600" /> 2 Critical SLA Pending
                </span>
                <Link
                  href="/surveillance/map"
                  className="px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <MapPin className="w-4 h-4" /> View GIS Map
                </Link>
              </div>
            }
          />

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Active Queue</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{reports.length} Cases</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">High Severity</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                {reports.filter(r => r.severity === 'CRITICAL' || r.severity === 'ZOONOTIC').length}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Investigating</span>
              <span className="text-2xl font-black text-teal-700 mt-1 block">
                {reports.filter(r => r.status === 'investigating').length}
              </span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Avg SLA Compliance</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">96.8%</span>
            </div>
          </div>

          {/* Queue Table Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                Active Incident Dispatches
              </h2>
              <span className="text-xs text-slate-500 font-medium">Real-time sync</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-3.5 font-bold">Case ID</th>
                    <th className="px-5 py-3.5 font-bold">Disease & Severity</th>
                    <th className="px-5 py-3.5 font-bold">Village / District</th>
                    <th className="px-5 py-3.5 font-bold">Herd Impact</th>
                    <th className="px-5 py-3.5 font-bold">SLA Countdown</th>
                    <th className="px-5 py-3.5 font-bold">Status</th>
                    <th className="px-5 py-3.5 font-bold text-right">Emergency Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4 font-mono font-bold text-slate-700">{r.id}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">{r.disease}</div>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${
                          r.severity === 'ZOONOTIC' 
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : r.severity === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {r.severity}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">{r.village}</td>
                      <td className="px-5 py-4">
                        <div className="text-slate-800 font-semibold">{r.species} ({r.affected} affected)</div>
                        {r.mortality > 0 && (
                          <div className="text-rose-600 font-bold text-[11px]">{r.mortality} Dead</div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className={`font-mono font-bold flex items-center gap-1.5 ${
                          r.slaRemainingMinutes < 60 ? 'text-rose-600 animate-pulse' : 'text-amber-600'
                        }`}>
                          <Clock className="w-3.5 h-3.5" /> {r.slaRemainingMinutes}m left
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.status === 'reported' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAssign(r.id)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Dispatch Paravet
                          </button>
                          <button
                            onClick={() => handleReferLab(r.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl shadow-xs text-xs font-bold flex items-center gap-1 cursor-pointer transition border border-slate-200"
                          >
                            <FileText className="w-3.5 h-3.5" /> Refer to Lab
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
