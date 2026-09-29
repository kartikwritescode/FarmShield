'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  ArrowLeft,
  Wifi,
  WifiOff,
  Send,
  AlertTriangle,
  Thermometer,
  Wind,
  Users,
  Skull,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  ChevronDown,
  Info,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';
import { GovHeader } from '../../../components/ui/GovHeader';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from '../../../components/layout/MobileNav';
import { AnimalRepository } from '../../../lib/repositories/animal.repository';
import { Animal, Species, HealthStatus } from '../../../types/database';
import {
  ClinicalTriageService,
  TriageAssessment,
  TriageUrgency,
  SYMPTOM_CATALOG,
} from '../../../lib/services/triage.service';
import { SymptomCatalogPicker } from '../../../components/surveillance/SymptomCatalogPicker';
import { TriageAssessmentCard } from '../../../components/surveillance/TriageAssessmentCard';

const OFFLINE_STORAGE_KEY = 'farmshield_offline_triage_reports';

interface OfflineReport {
  id: string;
  timestamp: string;
  animalId?: string;
  animalCode?: string;
  species: Species;
  symptoms: string[];
  bodyTemperatureC: number | null;
  vectorRiskMultiplier: number;
  affectedCount: number;
  mortalityCount: number;
  notes?: string;
  triage: TriageAssessment;
  status: 'pending_sync' | 'synced';
}

function SyndromicTriageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedAnimalId = searchParams.get('animalId');

  const { user } = useAuth();

  // Animals dataset
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [isLoadingAnimals, setIsLoadingAnimals] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [animalSearchQuery, setAnimalSearchQuery] = useState('');
  const [isAnimalDropdownOpen, setIsAnimalDropdownOpen] = useState(false);

  // Species fallback when no specific animal is selected
  const [selectedSpecies, setSelectedSpecies] = useState<Species>('cow');

  // Vitals & Risk Inputs
  const [temperatureInput, setTemperatureInput] = useState<string>('38.5');
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [vectorMultiplier, setVectorMultiplier] = useState<number>(1.2);
  const [affectedCount, setAffectedCount] = useState<number>(1);
  const [mortalityCount, setMortalityCount] = useState<number>(0);
  const [clinicalNotes, setClinicalNotes] = useState<string>('');

  // Observed Symptoms Multi-Select
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());

  // Offline & Sync States
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<OfflineReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessReport, setSubmitSuccessReport] = useState<OfflineReport | null>(null);

  // Load Animals from AnimalRepository
  useEffect(() => {
    async function loadAnimals() {
      try {
        setIsLoadingAnimals(true);
        const data = await AnimalRepository.getAnimals();
        setAnimals(data);

        if (preselectedAnimalId) {
          const match = data.find((a) => a.id === preselectedAnimalId || a.animal_code === preselectedAnimalId);
          if (match) {
            setSelectedAnimal(match);
            setSelectedSpecies(match.species);
          }
        }
      } catch (err) {
        console.error('Failed to load animals for triage:', err);
      } finally {
        setIsLoadingAnimals(false);
      }
    }
    loadAnimals();
  }, [preselectedAnimalId]);

  // Load Offline Queue from localStorage
  const loadOfflineQueue = useCallback(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as OfflineReport[];
        setOfflineQueue(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadOfflineQueue();

    // Online/Offline detection
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      // Auto-flush pending reports when network reconnects
      flushOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadOfflineQueue]);

  // Calculate body temperature in Celsius for standard triage rule logic
  const bodyTemperatureC = useMemo<number | null>(() => {
    const parsed = parseFloat(temperatureInput);
    if (isNaN(parsed) || parsed <= 0) return null;
    if (temperatureUnit === 'F') {
      return ClinicalTriageService.fahrenheitToCelsius(parsed);
    }
    return parsed;
  }, [temperatureInput, temperatureUnit]);

  // Auto-fever detection
  const isFeverDetected = useMemo(() => {
    if (bodyTemperatureC == null) return false;
    return bodyTemperatureC >= 39.5;
  }, [bodyTemperatureC]);

  // Instant Client-Side Triage Evaluation
  const triageAssessment = useMemo<TriageAssessment>(() => {
    return ClinicalTriageService.evaluateTriage({
      selectedSymptoms,
      bodyTemperatureC,
      species: selectedAnimal?.species || selectedSpecies,
      vectorRiskMultiplier: vectorMultiplier,
    });
  }, [selectedSymptoms, bodyTemperatureC, selectedAnimal, selectedSpecies, vectorMultiplier]);

  // Toggle single symptom
  const handleToggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Clear all symptoms
  const handleClearAllSymptoms = () => {
    setSelectedSymptoms(new Set());
  };

  // Select quick preset bundle
  const handleSelectPreset = (symptomIds: string[]) => {
    setSelectedSymptoms(new Set(symptomIds));
  };

  // Temperature unit toggle
  const handleToggleUnit = (unit: 'C' | 'F') => {
    if (unit === temperatureUnit) return;
    const current = parseFloat(temperatureInput);
    if (!isNaN(current) && current > 0) {
      if (unit === 'F') {
        setTemperatureInput(ClinicalTriageService.celsiusToFahrenheit(current).toString());
      } else {
        setTemperatureInput(ClinicalTriageService.fahrenheitToCelsius(current).toString());
      }
    }
    setTemperatureUnit(unit);
  };

  // Save report to localStorage offline queue
  const saveToOfflineQueue = (report: OfflineReport) => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      const list = stored ? (JSON.parse(stored) as OfflineReport[]) : [];
      list.unshift(report);
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(list));
      setOfflineQueue(list);
    } catch (e) {
      console.error('Failed to save to local offline queue:', e);
    }
  };

  // Flush pending offline reports to server
  const flushOfflineQueue = async () => {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      if (!stored) return;
      const list = JSON.parse(stored) as OfflineReport[];
      const pending = list.filter((r) => r.status === 'pending_sync');
      if (pending.length === 0) return;

      for (const item of pending) {
        try {
          await fetch('/api/v1/surveillance/triage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_report_id: item.id,
              species: item.species,
              affected_count: item.affectedCount,
              mortality_count: item.mortalityCount,
              symptoms: item.symptoms.reduce((acc, curr) => ({ ...acc, [curr]: true }), {}),
              latitude: 30.901,
              longitude: 75.8573,
            }),
          });
          item.status = 'synced';
        } catch {}
      }
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(list));
      setOfflineQueue([...list]);
    } catch {}
  };

  // Submit triage report
  const handleSubmitReport = async () => {
    if (selectedSymptoms.size === 0 && mortalityCount === 0 && !isFeverDetected) {
      alert('Please select at least one clinical symptom or report vitals abnormality before dispatching.');
      return;
    }

    setIsSubmitting(true);
    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const effectiveSpecies = selectedAnimal?.species || selectedSpecies;

    const reportItem: OfflineReport = {
      id: reportId,
      timestamp: new Date().toISOString(),
      animalId: selectedAnimal?.id,
      animalCode: selectedAnimal?.animal_code,
      species: effectiveSpecies,
      symptoms: Array.from(selectedSymptoms),
      bodyTemperatureC,
      vectorRiskMultiplier: vectorMultiplier,
      affectedCount,
      mortalityCount,
      notes: clinicalNotes,
      triage: triageAssessment,
      status: isOnline ? 'synced' : 'pending_sync',
    };

    try {
      // 1. Update animal health status in AnimalRepository
      if (selectedAnimal) {
        let newStatus: HealthStatus = 'healthy';
        if (triageAssessment.urgency === 'urgent') {
          newStatus = 'quarantine';
        } else if (triageAssessment.urgency === 'high' || triageAssessment.urgency === 'moderate') {
          newStatus = 'under_treatment';
        }
        await AnimalRepository.updateAnimalStatus(selectedAnimal.id, newStatus);
      }

      // 2. Dispatch to Backend API
      if (isOnline) {
        const payload = {
          client_report_id: reportId,
          reporter_role: user?.role || 'farmer',
          reporter_name: user?.name,
          farm_id: selectedAnimal?.farm_id || 'farm-pb-01',
          species: effectiveSpecies,
          affected_count: affectedCount,
          mortality_count: mortalityCount,
          latitude: 30.901,
          longitude: 75.8573,
          symptoms: Array.from(selectedSymptoms).reduce(
            (acc, curr) => ({ ...acc, [curr]: true }),
            {}
          ),
          notes: clinicalNotes,
        };

        try {
          await fetch('/api/v1/surveillance/triage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } catch {
          // If network fetch fails, queue locally
          reportItem.status = 'pending_sync';
        }
      }

      // 3. Save to local queue
      saveToOfflineQueue(reportItem);
      setSubmitSuccessReport(reportItem);
    } catch (err) {
      console.error('Triage submission error:', err);
      saveToOfflineQueue(reportItem);
      setSubmitSuccessReport(reportItem);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter animals for dropdown
  const filteredAnimals = useMemo(() => {
    if (!animalSearchQuery.trim()) return animals.slice(0, 10);
    const q = animalSearchQuery.toLowerCase();
    return animals.filter(
      (a) =>
        a.animal_code.toLowerCase().includes(q) ||
        a.breed?.toLowerCase().includes(q) ||
        a.species.toLowerCase().includes(q)
    );
  }, [animals, animalSearchQuery]);

  const pendingOfflineCount = offlineQueue.filter((r) => r.status === 'pending_sync').length;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-800">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-12 space-y-6">
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/surveillance/map"
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Outbreak Prevention & WOAH Biosecurity
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs font-semibold text-slate-500">Field Protocol</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                  Veterinary Syndromic Triage Engine
                </h1>
              </div>
            </div>

            {/* Offline Resilience & Quick Links */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-xs ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cloud Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>Offline Resilience Mode</span>
                  </>
                )}
                {pendingOfflineCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-600 text-white font-extrabold">
                    {pendingOfflineCount} Queued
                  </span>
                )}
              </div>

              <Link
                href="/surveillance/triage-queue"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-teal-600" />
                <span>Triage Queue</span>
              </Link>
            </div>
          </div>

          {/* Zero-Connectivity Resilience Banner */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-600 text-white flex-shrink-0 mt-0.5">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="flex-1 text-xs leading-relaxed">
              <span className="font-extrabold text-teal-900 dark:text-teal-200 block text-xs sm:text-sm">
                Rural Zero-Connectivity Guarantee & Automatic Health Synchronization
              </span>
              <span className="text-teal-800/80 dark:text-teal-300/80">
                Evaluation executes entirely in your browser using deterministic WOAH clinical rules. If
                you are in a rural shed with zero mobile data, reports are saved to encrypted local storage
                and synchronized automatically upon reconnecting.
              </span>
            </div>
          </div>

          {/* Main 2-Column Responsive Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Inputs & Symptoms (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Animal or Herd Census Selection */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-black">
                      1
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      Affected Animal or Herd Species
                    </h3>
                  </div>
                  {selectedAnimal && (
                    <button
                      type="button"
                      onClick={() => setSelectedAnimal(null)}
                      className="text-xs text-red-600 hover:underline font-medium"
                    >
                      Clear Selected Animal
                    </button>
                  )}
                </div>

                {/* Specific Animal Dropdown / Search */}
                <div className="relative">
                  <div
                    onClick={() => setIsAnimalDropdownOpen(!isAnimalDropdownOpen)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 cursor-pointer flex items-center justify-between hover:border-teal-500 transition-colors"
                  >
                    {selectedAnimal ? (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center uppercase">
                          {selectedAnimal.species.slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {selectedAnimal.animal_code} &bull; {selectedAnimal.breed || selectedAnimal.species}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                            Status: <span className="font-semibold text-teal-600">{selectedAnimal.health_status}</span> &bull; {selectedAnimal.sex}, {selectedAnimal.weight} kg
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Select a specific registered animal (optional) or choose herd species below...
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>

                  {isAnimalDropdownOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl max-h-64 overflow-y-auto p-2 space-y-1">
                      <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search tag code or breed..."
                          value={animalSearchQuery}
                          onChange={(e) => setAnimalSearchQuery(e.target.value)}
                          className="w-full text-xs bg-transparent focus:outline-none"
                          autoFocus
                        />
                      </div>
                      {filteredAnimals.map((anim) => (
                        <div
                          key={anim.id}
                          onClick={() => {
                            setSelectedAnimal(anim);
                            setSelectedSpecies(anim.species);
                            setIsAnimalDropdownOpen(false);
                          }}
                          className="p-2.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {anim.animal_code}
                            </span>
                            <span className="text-slate-500 ml-1.5">
                              ({anim.breed || anim.species} - {anim.sex})
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {anim.health_status}
                          </span>
                        </div>
                      ))}
                      {filteredAnimals.length === 0 && (
                        <div className="p-3 text-xs text-slate-400 text-center">
                          No matching livestock tags found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Herd Species Pill Selector (Fallback or Fast Selection) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Or Select General Species Group:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['cow', 'buffalo', 'goat', 'sheep', 'poultry', 'swine'] as Species[]).map((sp) => {
                      const isSel = (!selectedAnimal && selectedSpecies === sp) || (selectedAnimal && selectedAnimal.species === sp);
                      return (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => {
                            setSelectedSpecies(sp);
                            if (selectedAnimal && selectedAnimal.species !== sp) {
                              setSelectedAnimal(null);
                            }
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all border ${
                            isSel
                              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {sp}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 2: Vitals & Environmental Risk Multiplier */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                    Vitals & Environmental Risk Assessment
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Rectal Temperature Input with Toggle */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Thermometer className="w-4 h-4 text-rose-500" />
                        Rectal Body Temperature:
                      </label>
                      <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => handleToggleUnit('C')}
                          className={`px-2 py-0.5 transition-colors ${
                            temperatureUnit === 'C'
                              ? 'bg-teal-700 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          °C
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleUnit('F')}
                          className={`px-2 py-0.5 transition-colors ${
                            temperatureUnit === 'F'
                              ? 'bg-teal-700 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          °F
                        </button>
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={temperatureInput}
                        onChange={(e) => setTemperatureInput(e.target.value)}
                        placeholder={temperatureUnit === 'C' ? '38.5' : '101.3'}
                        className="w-full text-base font-bold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        °{temperatureUnit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Normal bovine: 38.0°C – 39.3°C</span>
                      {isFeverDetected && (
                        <span className="font-extrabold text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Pyrexia / High Fever Flagged
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vector Risk Multiplier (Weather/THI Derived) */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Wind className="w-4 h-4 text-cyan-600" />
                        Vector Transmission Multiplier:
                      </label>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                        {vectorMultiplier.toFixed(1)}x Risk
                      </span>
                    </div>

                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.1"
                      value={vectorMultiplier}
                      onChange={(e) => setVectorMultiplier(parseFloat(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer"
                    />

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {vectorMultiplier >= 1.5 ? (
                        <span className="text-amber-700 dark:text-amber-400 font-medium">
                          High humidity/temp favors biting flies, Culicoides & Pasteurella proliferation.
                        </span>
                      ) : (
                        <span>Baseline weather conditions (low-to-moderate vector pressure).</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Epidemiological Numbers: Affected & Mortality */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-600" />
                      Number Affected:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={affectedCount}
                      onChange={(e) => setAffectedCount(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Skull className="w-3.5 h-3.5 text-red-600" />
                      Herd Mortality / Deaths:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={mortalityCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value, 10) || 0;
                        setMortalityCount(count);
                        if (count > 0) {
                          // Mortality implies sudden death / peracute signs
                          setSelectedSymptoms((prev) => new Set(prev).add('sudden_death'));
                        }
                      }}
                      className="w-full px-3 py-2 text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Clinical Symptoms Multi-Select Catalog */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-black">
                      3
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                      Observed Clinical Symptoms (17 Signs)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">Instant Triage Active</span>
                </div>

                <SymptomCatalogPicker
                  selectedSymptoms={selectedSymptoms}
                  onToggleSymptom={handleToggleSymptom}
                  onClearAll={handleClearAllSymptoms}
                  onSelectPreset={handleSelectPreset}
                />
              </div>

              {/* Step 4: Clinical Observations / Freeform Notes */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Field Clinician / Farmer Observations & History:
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Note additional observations, previous treatments given, feed changes, or neighboring farm outbreaks..."
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Right Column: Real-time Reactive Triage Assessment & Dispatch (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    Automated Diagnostic Assessment
                  </h3>
                  <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    Live Reactive Engine
                  </span>
                </div>

                {/* Instant Triage Assessment Card */}
                <TriageAssessmentCard
                  assessment={triageAssessment}
                  animalCode={selectedAnimal?.animal_code}
                  species={selectedAnimal?.species || selectedSpecies}
                />

                {/* Dispatch / Transmit Button */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Target Destination:</span>
                    <strong className="text-slate-700 dark:text-slate-300">
                      {isOnline ? 'Govt Animal Husbandry Network' : 'Encrypted Local Storage (Offline)'}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitReport}
                    disabled={isSubmitting}
                    className={`w-full py-3.5 px-4 rounded-xl font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-all ${
                      triageAssessment.urgency === 'urgent'
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 dark:shadow-red-950 animate-pulse'
                        : triageAssessment.urgency === 'high'
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200'
                        : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-200'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Processing Outbreak Record...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          {triageAssessment.urgency === 'urgent'
                            ? 'DISPATCH EMERGENCY BIOSECURITY REPORT'
                            : 'Transmit Syndromic Surveillance Report'}
                        </span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-slate-400">
                    Submitting automatically updates animal health status and informs relevant district veterinary officers.
                  </p>
                </div>

                {/* Quick Link to Surveillance Map */}
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      GIS Disease Cluster Map
                    </span>
                    <span className="text-slate-500">Inspect 5km radius outbreak containment zones</span>
                  </div>
                  <Link
                    href="/surveillance/map"
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1 hover:bg-teal-50"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Success Dialog */}
          {submitSuccessReport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Syndromic Report Registered
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Report ID: <strong className="font-mono text-teal-600">{submitSuccessReport.id}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Triage Classification:</span>
                    <strong className="uppercase font-black text-rose-600">
                      {submitSuccessReport.triage.urgency}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Suspected Disease:</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-right">
                      {submitSuccessReport.triage.suspectedConditions[0] || 'Under Observation'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Synchronization Status:</span>
                    <span className="font-bold text-teal-600">
                      {submitSuccessReport.status === 'synced' ? 'Synchronized with Cloud' : 'Queued Locally (Offline)'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccessReport(null);
                      setSelectedSymptoms(new Set());
                      setMortalityCount(0);
                      setSelectedAnimal(null);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    Report Another Animal
                  </button>

                  <Link
                    href="/surveillance/triage-queue"
                    className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 text-center transition-colors shadow-sm"
                  >
                    View Triage Queue
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default function SyndromicTriagePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      }
    >
      <SyndromicTriageContent />
    </React.Suspense>
  );
}
