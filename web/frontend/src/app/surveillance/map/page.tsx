'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  MapPin, 
  AlertTriangle, 
  Radio, 
  Layers, 
  RefreshCw, 
  Compass, 
  Thermometer, 
  Droplets, 
  Wind,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { GovHeader } from '../../../components/ui/GovHeader';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from '../../../components/layout/MobileNav';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useAuth } from '../../../providers/AuthProvider';

interface IncidentFeature {
  properties: {
    featureType: string;
    id: string;
    disease: string;
    severity: 'LOW' | 'MODERATE' | 'CRITICAL' | 'ZOONOTIC';
    species: string;
    affected_count: number;
    mortality_count: number;
    status: string;
    date: string;
    is_cluster: boolean;
  };
  geometry: {
    coordinates: [number, number];
  };
}

export default function SurveillanceMapPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'critical' | 'containment'>('all');
  
  // Weather metrics state
  const [weather, setWeather] = useState({
    temp: 28.4,
    humidity: 78,
    riskMultiplier: 2.4,
    level: 'EXTREME',
    advisory: 'High humidity and warm temperatures encourage vector-borne transmission.'
  });

  const incidents: IncidentFeature[] = [
    {
      geometry: { coordinates: [73.9824, 18.5793] },
      properties: {
        featureType: 'disease_incident',
        id: 'rep_01',
        disease: 'Foot-and-Mouth Disease (FMD)',
        severity: 'CRITICAL',
        species: 'Cow',
        affected_count: 5,
        mortality_count: 0,
        status: 'investigating',
        date: '10 Mins ago',
        is_cluster: true,
      }
    },
    {
      geometry: { coordinates: [73.9850, 18.5810] },
      properties: {
        featureType: 'disease_incident',
        id: 'rep_02',
        disease: 'Foot-and-Mouth Disease (FMD)',
        severity: 'CRITICAL',
        species: 'Buffalo',
        affected_count: 2,
        mortality_count: 0,
        status: 'reported',
        date: '25 Mins ago',
        is_cluster: true,
      }
    },
    {
      geometry: { coordinates: [77.4984, 27.5258] },
      properties: {
        featureType: 'disease_incident',
        id: 'rep_03',
        disease: 'Suspected Anthrax',
        severity: 'ZOONOTIC',
        species: 'Cow',
        affected_count: 1,
        mortality_count: 1,
        status: 'reported',
        date: '1 Hour ago',
        is_cluster: false,
      }
    },
    {
      geometry: { coordinates: [74.5772, 18.1539] },
      properties: {
        featureType: 'disease_incident',
        id: 'rep_04',
        disease: 'Lumpy Skin Disease (LSD)',
        severity: 'MODERATE',
        species: 'Cow',
        affected_count: 4,
        mortality_count: 0,
        status: 'investigating',
        date: '3 Hours ago',
        is_cluster: false,
      }
    }
  ];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <GovHeader />
      <Navbar currentRole={user?.role || 'admin'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8 space-y-6">
          <PageHeader
            badge="WOAH BIOSECURITY & GIS SURVEILLANCE"
            title="Livestock Surveillance & Outbreak GIS Map"
            subtitle="Real-Time Syndromic Triage, PostGIS 5km Containment Rings & Vector Weather Forecasting"
            icon={ShieldAlert}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Link 
                  href="/surveillance/map" 
                  className="px-3 py-1.5 text-xs font-bold bg-teal-800 text-white rounded-xl shadow-xs"
                >
                  GIS Outbreak Map
                </Link>
                <Link 
                  href="/surveillance/triage-queue" 
                  className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 shadow-xs transition"
                >
                  Triage SLA Queue
                </Link>
                <Link 
                  href="/surveillance/vaccination-coverage" 
                  className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 shadow-xs transition"
                >
                  Vaccine Coverage
                </Link>
                <Link 
                  href="/surveillance/advisories" 
                  className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80 shadow-xs transition"
                >
                  Emergency Broadcast
                </Link>
              </div>
            }
          />

          {/* Main Grid View */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Side: Interactive Map Simulation Canvas */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
              {/* Map Controls Floating Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => setActiveLayer('all')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      activeLayer === 'all' 
                        ? 'bg-teal-700 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> All Incidents ({incidents.length})
                  </button>
                  <button 
                    onClick={() => setActiveLayer('critical')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      activeLayer === 'critical' 
                        ? 'bg-rose-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 text-rose-300 animate-pulse" /> Critical / Zoonotic
                  </button>
                  <button 
                    onClick={() => setActiveLayer('containment')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                      activeLayer === 'containment' 
                        ? 'bg-amber-600 text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" /> 5km Containment Rings
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Grid Active • EPSG:4326
                  </span>
                </div>
              </div>

              {/* Interactive Simulated GIS Map Canvas */}
              <div className="relative w-full h-[520px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

                {/* Simulated 5km Containment Zone Ring */}
                <div className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-red-500/50 bg-red-500/10 flex items-center justify-center animate-pulse">
                  {/* 10km Surveillance Outer Ring */}
                  <div className="w-[420px] h-[420px] rounded-full border border-amber-500/30 bg-amber-500/5 absolute pointer-events-none" />
                  <div className="text-[10px] text-red-400 font-bold tracking-widest uppercase bg-slate-950/80 px-2 py-0.5 rounded border border-red-500/40">
                    5km Strict Containment Core (Pune-Haveli)
                  </div>
                </div>

                {/* Interactive Pulse Markers */}
                {incidents.map((inc, i) => {
                  const offsets = [
                    { top: '48%', left: '46%' },
                    { top: '53%', left: '52%' },
                    { top: '25%', left: '70%' },
                    { top: '65%', left: '35%' },
                  ];

                  return (
                    <div
                      key={inc.properties.id}
                      style={offsets[i]}
                      onClick={() => setSelectedIncident(inc)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group transition-all"
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Pulsing Aura for Critical Incidents */}
                        {inc.properties.severity === 'CRITICAL' || inc.properties.severity === 'ZOONOTIC' ? (
                          <div className="w-8 h-8 rounded-full bg-red-500/40 animate-ping absolute" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-amber-500/30 animate-pulse absolute" />
                        )}
                        
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-lg ${
                          inc.properties.severity === 'ZOONOTIC' 
                            ? 'bg-purple-600 border-purple-300' 
                            : inc.properties.severity === 'CRITICAL' 
                            ? 'bg-rose-600 border-rose-200' 
                            : 'bg-amber-600 border-amber-200'
                        }`}>
                          <span className="text-[9px] font-bold text-white">!</span>
                        </div>

                        {/* Hover Pin Label */}
                        <div className="hidden group-hover:block absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-xl shadow-xl pointer-events-none z-30">
                          <div className="font-bold text-white">{inc.properties.disease}</div>
                          <div className="text-[10px] text-slate-400">
                            {inc.properties.species} • {inc.properties.affected_count} affected
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Map Legend Footer */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 gap-3">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-600 border border-purple-300" />
                    <span className="font-medium">Zoonotic Hazard (Anthrax)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-600 border border-rose-200" />
                    <span className="font-medium">Critical Contagion (FMD)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-600 border border-amber-200" />
                    <span className="font-medium">Moderate (LSD)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-2 rounded bg-red-500/20 border border-red-500" />
                    <span className="font-medium">5km Containment Ring</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  PostGIS Spatial Engine
                </div>
              </div>
            </div>

            {/* Right Sidebar: Details & Climate Intelligence */}
            <div className="flex flex-col gap-6">
              {/* Selected Incident Drawer */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Incident Inspector</span>
                  {selectedIncident && (
                    <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 font-bold">
                      {selectedIncident.properties.severity}
                    </span>
                  )}
                </h2>

                {selectedIncident ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="text-slate-500 font-medium">Suspected Disease</div>
                      <div className="text-base font-black text-slate-900">{selectedIncident.properties.disease}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="text-slate-500 text-[11px]">Species</div>
                        <div className="font-bold text-slate-800">{selectedIncident.properties.species}</div>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div className="text-slate-500 text-[11px]">Affected / Deaths</div>
                        <div className="font-bold text-slate-800">
                          {selectedIncident.properties.affected_count} / {selectedIncident.properties.mortality_count}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[11px]">Incident Coordinates</div>
                      <div className="font-mono text-slate-700 font-bold">
                        {selectedIncident.geometry.coordinates[1]}, {selectedIncident.geometry.coordinates[0]}
                      </div>
                    </div>
                    <div className="pt-2 flex gap-2">
                      <Link
                        href="/surveillance/triage-queue"
                        className="w-full text-center py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition"
                      >
                        Dispatch Rapid Response
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">
                    Click on any pulsing map marker to inspect clinical symptoms, casualty numbers, and dispatch protocols.
                  </div>
                )}
              </div>

              {/* Real-Time Weather Correlation Gauge (Open-Meteo Integration) */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Vector Weather Risk</span>
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200 font-bold">
                    OPEN-METEO
                  </span>
                </h2>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                    <Thermometer className="w-4 h-4 mx-auto text-amber-500 mb-1" />
                    <div className="text-[10px] text-slate-500 font-medium">Temp</div>
                    <div className="font-black text-slate-900 text-xs">{weather.temp}°C</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                    <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                    <div className="text-[10px] text-slate-500 font-medium">Humidity</div>
                    <div className="font-black text-slate-900 text-xs">{weather.humidity}%</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                    <Wind className="w-4 h-4 mx-auto text-teal-600 mb-1" />
                    <div className="text-[10px] text-slate-500 font-medium">Risk Mult.</div>
                    <div className="font-black text-rose-600 text-xs">{weather.riskMultiplier}x</div>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3 text-xs text-rose-900">
                  <div className="font-bold mb-1 flex items-center gap-1.5 text-rose-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Vector Multiplication Alert
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-700">{weather.advisory}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
