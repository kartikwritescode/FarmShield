'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle2, MessageSquare, Radio, Users, RadioTower, AlertTriangle } from 'lucide-react';
import { GovHeader } from '../../../components/ui/GovHeader';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from '../../../components/layout/MobileNav';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useAuth } from '../../../providers/AuthProvider';

export default function AdvisoriesBroadcastPage() {
  const { user } = useAuth();
  const [district, setDistrict] = useState('Pune');
  const [block, setBlock] = useState('Haveli');
  const [disease, setDisease] = useState('Foot-and-Mouth Disease (FMD)');
  const [channels, setChannels] = useState({ sms: true, inApp: true, ivrCall: false });
  const [sent, setSent] = useState(false);

  const englishAdvisory = `[ANIMAL HEALTH ALERT - ${district.toUpperCase()}] Suspected outbreak of ${disease} reported in ${block} block. Isolate infected cattle immediately. Do not sell unpasteurized milk. Ring vaccination camp open tomorrow at Subcenter. Helpline: 1800-VET-CARE.`;

  const hindiAdvisory = `[पशु स्वास्थ्य चेतावनी - ${district}] ${block} ब्लॉक में ${disease} का प्रकोप देखा गया है। प्रभावित पशुओं को तुरंत अलग करें। कच्चा दूध न बेचें। नजदीकी पशु औषधालय में मुफ्त टीकाकरण कराएं।`;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      alert(`Broadcast dispatched to 4,820 registered livestock owners in ${district} - ${block} block via SMS & App.`);
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <GovHeader />
      <Navbar currentRole={user?.role || 'admin'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full pb-24 lg:pb-8 space-y-6">
          <PageHeader
            badge="TELECOM & MULTILINGUAL BROADCAST"
            title="Geo-Targeted Advisory Broadcast"
            subtitle="Dispatches Instant Containment Warnings via NIC/CDAC SMS, Voice Calls & App Push Notifications"
            icon={RadioTower}
            backUrl="/surveillance/map"
            actions={
              <div className="flex items-center gap-2">
                <Link
                  href="/surveillance/map"
                  className="px-3.5 py-2 bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Return to GIS Map
                </Link>
              </div>
            }
          />

          {/* Form Card */}
          <form onSubmit={handleDispatch} className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target District</label>
                <select 
                  value={district} 
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                >
                  <option value="Pune">Pune (Maharashtra)</option>
                  <option value="Mathura">Mathura (Uttar Pradesh)</option>
                  <option value="Ludhiana">Ludhiana (Punjab)</option>
                  <option value="Baramati">Baramati (Maharashtra)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Block</label>
                <select 
                  value={block} 
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                >
                  <option value="Haveli">Haveli Block</option>
                  <option value="Manjari">Manjari Sub-block</option>
                  <option value="Govardhan">Govardhan Block</option>
                  <option value="Jagraon">Jagraon Block</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Disease Threat</label>
                <select 
                  value={disease} 
                  onChange={(e) => setDisease(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                >
                  <option value="Foot-and-Mouth Disease (FMD)">Foot-and-Mouth Disease (FMD)</option>
                  <option value="Anthrax">Anthrax (Zoonotic Alert)</option>
                  <option value="Lumpy Skin Disease (LSD)">Lumpy Skin Disease (LSD)</option>
                  <option value="Hemorrhagic Septicemia">Hemorrhagic Septicemia (HS)</option>
                </select>
              </div>
            </div>

            {/* Delivery Channels */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Delivery Channels</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition">
                  <input 
                    type="checkbox" 
                    checked={channels.sms} 
                    onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-0" 
                  />
                  SMS Broadcast (CDAC Gateway)
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition">
                  <input 
                    type="checkbox" 
                    checked={channels.inApp} 
                    onChange={(e) => setChannels({ ...channels, inApp: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-0" 
                  />
                  In-App Push Alert
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition">
                  <input 
                    type="checkbox" 
                    checked={channels.ivrCall} 
                    onChange={(e) => setChannels({ ...channels, ivrCall: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-0" 
                  />
                  Automated IVR Outbound Call
                </label>
              </div>
            </div>

            {/* Bilingual Preview Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-700" /> English Advisory Preview (SMS)
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-mono bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                  {englishAdvisory}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-700" /> Hindi Advisory Preview (हिंदी संदेश)
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs">
                  {hindiAdvisory}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button 
              type="submit"
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Send className="w-4 h-4" /> DISPATCH EMERGENCY CONTAINMENT BROADCAST
            </button>
          </form>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
