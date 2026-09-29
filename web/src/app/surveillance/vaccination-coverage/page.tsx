'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Shield, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { GovHeader } from '../../../components/ui/GovHeader';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from '../../../components/layout/MobileNav';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useAuth } from '../../../providers/AuthProvider';

export default function VaccinationCoveragePage() {
  const { user } = useAuth();

  const blockData = [
    { block: 'Haveli (Pune)', target: 24000, vaccinated: 21500, rate: 89 },
    { block: 'Baramati', target: 31000, vaccinated: 28200, rate: 91 },
    { block: 'Govardhan (Mathura)', target: 18000, vaccinated: 12400, rate: 68 },
    { block: 'Jagraon (Ludhiana)', target: 29000, vaccinated: 27100, rate: 93 },
    { block: 'Shirur', target: 22000, vaccinated: 14500, rate: 66 },
  ];

  const diseasePie = [
    { name: 'Foot-and-Mouth (FMD)', value: 45000, color: '#0d9488' },
    { name: 'Brucellosis (Calfhood)', value: 22000, color: '#059669' },
    { name: 'Lumpy Skin Disease', value: 18000, color: '#d97706' },
    { name: 'PPR (Goat/Sheep)', value: 14000, color: '#7c3aed' },
    { name: 'Hemorrhagic Septicemia', value: 11000, color: '#e11d48' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <GovHeader />
      <Navbar currentRole={user?.role || 'admin'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8 space-y-6">
          <PageHeader
            badge="NATIONAL IMMUNIZATION MONITOR"
            title="Animal Disease Control (NADCP) Coverage"
            subtitle="Block-Level Vaccination Rates • Herd Immunity Threshold (85% Target) • Ear-Tag Digitization"
            icon={ShieldCheck}
            backUrl="/surveillance/map"
            actions={
              <div className="flex items-center gap-3">
                <div className="bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-xs text-right">
                  <div className="text-xl font-black text-emerald-600">82.4%</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Regional Herd Immunity</div>
                </div>
              </div>
            }
          />

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Doses Administered</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">110,000</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Target Coverage</span>
              <span className="text-2xl font-black text-teal-700 mt-1 block">124,000</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">High Performing Blocks</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">3 / 5</span>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Critical Threshold Gaps</span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">2 Blocks</span>
            </div>
          </div>

          {/* Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Target vs Vaccinated per Block */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Block Targets vs Actuals (Doses)
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={blockData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="block" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#0f172a' }}
                    />
                    <Bar dataKey="target" fill="#cbd5e1" name="Target Doses" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="vaccinated" fill="#0d9488" name="Administered Doses" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: Vaccine Coverage by Disease Target */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" /> Vaccine Doses by Pathogen Target
              </h2>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diseasePie}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {diseasePie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '1rem', color: '#0f172a' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 text-xs mt-2">
                {diseasePie.map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-600 font-semibold">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Coverage Warning Callout */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-amber-900 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold">Immediate Drive Alert:</span> Govardhan (Mathura) and Shirur blocks are below the 70% threshold. Vulnerable to seasonal FMD and HS wash.
              </div>
            </div>
            <button 
              onClick={() => alert('Dispatched mobile paravet vaccination camps to Govardhan and Shirur blocks.')}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs shrink-0 transition cursor-pointer"
            >
              Deploy Emergency Camps
            </button>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
