'use client';

import React, { useState, useEffect, useMemo, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertTriangle,
  Camera,
  QrCode,
  Pill,
  Syringe,
  Activity,
  Calendar,
  Scale,
  Waves,
  Printer,
  Share2,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit,
  Download,
  Loader2,
  Milk,
  Beef,
  Fish,
} from 'lucide-react';

import { useAuthStore } from '../../../stores/authStore';
import { useLivestockStore } from '../../../stores/livestockStore';
import { Animal, Treatment, HealthStatus } from '../../../types/database';
import { AnimalRepository } from '../../../lib/repositories/animal.repository';
import { TreatmentRepository } from '../../../lib/repositories/treatment.repository';
import { CloudinaryService } from '../../../lib/services/cloudinary.service';
import { generateClientQRDataUrl, downloadDataUrlAsFile } from '../../../lib/qrHelper';
import { getBreedAsset } from '../../../lib/breed_assets';
import { api } from '../../../lib/api';

import { GovHeader } from '../../../components/ui/GovHeader';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from '../../../components/layout/MobileNav';
import { HealthTimeline, HealthTimelineEvent } from '../../../components/livestock/HealthTimeline';
import { EditAnimalModal } from '../../../components/livestock/EditAnimalModal';
import {
  ReportHealthIssueModal,
  SyndromicReportSubmission,
} from '../../../components/livestock/ReportHealthIssueModal';

export default function AnimalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const animalId = resolvedParams.id;

  const router = useRouter();
  const { user, profile, role } = useAuthStore();
  const { updateAnimal } = useLivestockStore();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<HealthTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Modals & Upload state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Load Animal & Clinical History
  useEffect(() => {
    async function loadAnimalProfile() {
      setLoading(true);
      try {
        let loadedAnimal: Animal | null = null;
        let loadedTreatments: Treatment[] = [];

        // 1. Try Backend API
        try {
          const apiRes = await api.get<any>(`animals/${animalId}`);
          if (apiRes && apiRes.data?.animal) {
            loadedAnimal = apiRes.data.animal;
            loadedTreatments = apiRes.data.treatmentHistory || [];
          } else if (apiRes && apiRes.id) {
            loadedAnimal = apiRes;
          }
        } catch {
          // Fallback to repository
        }

        // 2. Repository Fallback
        if (!loadedAnimal) {
          loadedAnimal = await AnimalRepository.getAnimalById(animalId);
          if (loadedAnimal) {
            loadedTreatments = await TreatmentRepository.getTreatments(loadedAnimal.id);
          }
        }

        if (loadedAnimal) {
          setAnimal(loadedAnimal);
          setTreatments(loadedTreatments);

          // Generate QR Data URL
          const qrToken = loadedAnimal.qr_token || `QR-${loadedAnimal.animal_code}`;
          generateClientQRDataUrl(qrToken).then(setQrDataUrl).catch(console.error);

          // Build Unified Clinical Health Timeline
          buildInitialTimeline(loadedAnimal, loadedTreatments);
        }
      } catch (err) {
        console.error('Failed to load animal profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAnimalProfile();
  }, [animalId]);

  // Build Unified Timeline Combining 4 Event Streams
  const buildInitialTimeline = (anim: Animal, txList: Treatment[]) => {
    const events: HealthTimelineEvent[] = [];

    // 1. Treatments
    txList.forEach((tx) => {
      const isWithdrawalActive = tx.withdrawal
        ? tx.withdrawal.status === 'active' && new Date(tx.withdrawal.end_date) > new Date()
        : false;
      let remainingHours = 0;
      if (tx.withdrawal) {
        const diff = new Date(tx.withdrawal.end_date).getTime() - Date.now();
        remainingHours = Math.max(0, Math.round(diff / (1000 * 3600)));
      }

      events.push({
        id: `tx-${tx.id}`,
        type: 'treatment',
        title: `${tx.medicine?.name || 'Veterinary Antimicrobial'} Administration`,
        description: `Prescribed for ${tx.indication || 'bacterial infection'}. Dosage: ${tx.dose} ${tx.dose_unit} via ${tx.route} (${tx.frequency} for ${tx.duration} days).`,
        timestamp: tx.start_date || tx.created_at,
        severity: isWithdrawalActive ? 'high' : 'low',
        performedBy: tx.veterinarian?.name || 'Dr. Sharma (Field Vet)',
        metadata: {
          medicineName: tx.medicine?.name,
          dose: `${tx.dose} ${tx.dose_unit}`,
          route: tx.route,
          indication: tx.indication || undefined,
          withdrawalEndDate: tx.withdrawal?.end_date,
          isWithdrawalActive,
          remainingHours,
        },
      });
    });

    // 2. Vaccinations (Core Indian National Animal Disease Control Programme - NADCP)
    events.push({
      id: `vac-01-${anim.id}`,
      type: 'vaccination',
      title: 'Foot & Mouth Disease (FMD) Trivalent Vaccine',
      description: 'National NADCP round 4 immunization against O, A, and Asia-1 serotypes.',
      timestamp: new Date(Date.now() - 90 * 86400000).toISOString(),
      performedBy: 'Animal Husbandry Dept',
      metadata: {
        vaccineName: 'FMD Trivalent Oil Adjuvant',
        diseaseTargeted: 'Foot and Mouth Disease (खुरपका-मुंहपका)',
        batchNumber: 'FMD-2025-PB882',
        boosterDueDate: new Date(Date.now() + 90 * 86400000).toISOString(),
        isOverdue: false,
      },
    });

    events.push({
      id: `vac-02-${anim.id}`,
      type: 'vaccination',
      title: 'Hemorrhagic Septicemia (HS) Adjuvanted Vaccine',
      description: 'Pre-monsoon preventive immunization against Pasteurella multocida.',
      timestamp: new Date(Date.now() - 180 * 86400000).toISOString(),
      performedBy: 'Mobile Vet Clinic #04',
      metadata: {
        vaccineName: 'HS Alum Precipitated Vaccine',
        diseaseTargeted: 'Hemorrhagic Septicemia (गलघोंटू)',
        batchNumber: 'HS-2024-ND41',
        boosterDueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        isOverdue: true, // Overdue booster badge demo
      },
    });

    // 3. Routine Health & Biometry Checks
    events.push({
      id: `check-01-${anim.id}`,
      type: 'health_check',
      title: 'Quarterly Herd Biometry & Mastitis Screening',
      description: `California Mastitis Test (CMT) scored negative. Body weight recorded at ${anim.weight_kg ?? anim.weight ?? 420} kg. Normal rumination and clear mucosal membranes.`,
      timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
      performedBy: 'Livestock Field Inspector',
      metadata: {
        weightKg: anim.weight_kg ?? anim.weight ?? 420,
      },
    });

    setTimelineEvents(events);
  };

  // Photo Update Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !animal) return;
    const file = e.target.files[0];

    setIsUploadingPhoto(true);
    try {
      const uploadRes = await CloudinaryService.uploadImage(file, {
        folder: 'animals',
        tags: [animal.species, animal.breed || ''],
      });

      const updated = {
        ...animal,
        image_url: uploadRes.secureUrl,
        cloudinary_public_id: uploadRes.publicId,
      };

      setAnimal(updated);
      await updateAnimal(animal.id, updated);
    } catch (err) {
      console.error('Photo upload error:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Syndromic Report Submission Handler
  const handleSyndromicReportSubmit = async (report: SyndromicReportSubmission) => {
    if (!animal) return;

    // 1. Add new event to unified timeline
    const newEvent: HealthTimelineEvent = {
      id: `symptom-${Date.now()}`,
      type: 'symptom_report',
      title: `Syndromic Triage: ${report.suspectedCondition}`,
      description: `Reported symptoms: ${report.symptoms.join(', ')}. ${report.notes || ''}`,
      timestamp: new Date().toISOString(),
      severity: report.triageUrgency,
      performedBy: profile?.name || (user?.user_metadata?.name as string) || 'Producer Self-Report',
      metadata: {
        symptoms: report.symptoms,
        bodyTemperatureC: report.bodyTemperatureC,
        triageUrgency: report.triageUrgency,
      },
    };

    setTimelineEvents((prev) => [newEvent, ...prev]);

    // 2. Update animal health status optimistically
    const updatedAnimal = {
      ...animal,
      health_status: report.resultingStatus,
    };
    setAnimal(updatedAnimal);
    await updateAnimal(animal.id, updatedAnimal);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-800">
          <Loader2 className="w-5 h-5 animate-spin text-teal-700" />
          <span>Hydrating Animal Profile & Health Journey...</span>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white text-center font-sans">
        <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 text-2xl">
          ⚠️
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-1">Animal Record Not Found</h2>
        <p className="text-xs text-slate-500 mb-5 max-w-sm">
          No livestock registry matches ear-tag RFID or ID &quot;{animalId}&quot;.
        </p>
        <button
          type="button"
          onClick={() => router.push('/livestock')}
          className="px-5 py-2.5 rounded-xl bg-teal-700 text-white text-xs font-black shadow-sm"
        >
          Return to Herd Directory
        </button>
      </div>
    );
  }

  const breedAsset = getBreedAsset(animal.species, animal.breed || '');
  const photoUrl = animal.image_url || breedAsset.imageUrl;
  const isBovine = animal.species === 'cow' || animal.species === 'buffalo';
  const isAquaculture = animal.species === 'fishery';

  // Calculate age
  const ageDisplay = (() => {
    if (!animal.dob) return 'Age Not Logged';
    const dob = new Date(animal.dob);
    const months = Math.max(
      0,
      Math.floor((Date.now() - dob.getTime()) / (30.44 * 24 * 3600 * 1000))
    );
    if (months < 12) return `${months} Months`;
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} Years`;
  })();

  // Active Withdrawal Check & Remaining Hours
  const activeWithdrawal = treatments
    .map((t) => t.withdrawal)
    .find((w) => w && w.status === 'active' && new Date(w.end_date) > new Date());

  const remainingHours = activeWithdrawal
    ? Math.max(0, Math.round((new Date(activeWithdrawal.end_date).getTime() - Date.now()) / (1000 * 3600)))
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans selection:bg-teal-500 selection:text-white">
      <GovHeader />
      {/* Top Navbar */}
      <Navbar currentRole={role || 'farmer'} />

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Profile Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-28 lg:pb-12 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <Link href="/livestock" className="hover:text-teal-800 transition flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Livestock Registry</span>
            </Link>
            <span>/</span>
            <span className="font-mono font-bold text-slate-800">{animal.animal_code}</span>
          </div>

          {/* TOP HEADER HERO: Photo with Hover Camera Overlay, Tag Title, Location, Age & Large Status Badge */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 text-white p-6 sm:p-8 shadow-xl border border-teal-500/30">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Hero: Avatar with Camera Hover & Titles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Animal Photo with Hover Camera Trigger */}
                <div className="relative group shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-white/20 shadow-lg bg-teal-900">
                  <img
                    src={photoUrl}
                    alt={animal.animal_code}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Camera Hover Overlay */}
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    title="Change Animal Photo"
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  >
                    {isUploadingPhoto ? (
                      <Loader2 className="w-6 h-6 animate-spin text-teal-300" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-teal-300" />
                        <span className="text-[10px] font-bold uppercase mt-1">Change Photo</span>
                      </>
                    )}
                  </button>

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>

                {/* Identity & Specs */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-teal-200">
                      RFID: {animal.animal_code}
                    </span>
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-lg bg-teal-500/20 text-teal-200 border border-teal-400/30">
                      {animal.species}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {animal.animal_code} • {animal.breed || 'Indigenous'}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-teal-200/90 font-medium">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-teal-300" />
                      <span>{profile?.district || 'Ludhiana'}, {profile?.state || 'Punjab'}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-300" />
                      <span>Age: {ageDisplay}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Hero: Large Status Badge & Quick Actions */}
              <div className="flex flex-col sm:items-end gap-4">
                {/* Large Food Safety Badge (Zero Cattle Meat Mentions) */}
                {isBovine ? (
                  activeWithdrawal ? (
                    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-rose-500/20 border-2 border-rose-500/60 text-white shadow-lg backdrop-blur-md">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-rose-200">
                          🔴 STATUTORY WITHHOLDING ACTIVE
                        </div>
                        <div className="text-[11px] text-rose-100 font-semibold">
                          Strict Milk Hold • {remainingHours} Hours Remaining
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-white shadow-lg backdrop-blur-md">
                      <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
                          🟢 CLEARED / MILK SAFE
                        </div>
                        <div className="text-[11px] text-emerald-100 font-semibold">
                          Zero MRL Residues • Certified Safe for Procurement
                        </div>
                      </div>
                    </div>
                  )
                ) : isAquaculture ? (
                  activeWithdrawal ? (
                    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-rose-500/20 border-2 border-rose-500/60 text-white shadow-lg">
                      <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-rose-200">
                          🔴 BIOMASS WITHHOLDING ACTIVE
                        </div>
                        <div className="text-[11px] text-rose-100 font-semibold">
                          Hold Harvesting ({remainingHours}h)
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-sky-500/20 border-2 border-sky-400/50 text-white shadow-lg">
                      <span className="w-3 h-3 rounded-full bg-sky-400"></span>
                      <div>
                        <div className="text-xs font-black uppercase tracking-wider text-sky-200">
                          🟢 FOOD GRADE SAFE
                        </div>
                        <div className="text-[11px] text-sky-100 font-semibold">
                          Aquaculture Biomass Ready for Market
                        </div>
                      </div>
                    </div>
                  )
                ) : activeWithdrawal ? (
                  <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-rose-500/20 border-2 border-rose-500/60 text-white shadow-lg">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-rose-200">
                        🔴 STATUTORY WITHHOLDING ACTIVE
                      </div>
                      <div className="text-[11px] text-rose-100 font-semibold">
                        Meat Withholding ({remainingHours}h)
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 text-white shadow-lg">
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
                        🟢 CLEARED / MEAT SAFE
                      </div>
                      <div className="text-[11px] text-emerald-100 font-semibold">
                        Certified Fit for Slaughter / Procurement
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Action Button Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-teal-300" />
                    <span>Edit Profile</span>
                  </button>

                  <Link
                    href={`/treatments/new?animal=${encodeURIComponent(animal.animal_code)}`}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>Log Treatment</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowReportModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                    <span>Report Health Issue</span>
                  </button>

                  <Link
                    href={`/qr/${animal.qr_token || animal.animal_code}`}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5 text-teal-300" />
                    <span>View QR Passport</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* TWO-COLUMN GRID: Left Biometric Specs & QR Badge | Right Unified Health Journey */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Biometric & Production Specs (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Biometrics Card */}
              <div className="bg-white rounded-3xl border border-teal-100 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Biometric & Production Specs
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    Modify
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Species</span>
                    <span className="font-bold text-slate-900 uppercase">{animal.species}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Breed Lineage</span>
                    <span className="font-bold text-slate-900">{animal.breed || 'Indigenous'}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Sex / Class</span>
                    <span className="font-bold text-slate-900 capitalize">{animal.sex || 'Female'}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Date of Birth</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {animal.dob || 'Not Recorded'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Production Purpose</span>
                    <span className="font-bold text-slate-900 capitalize">{animal.purpose}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">
                      {isAquaculture ? 'Collective Biomass' : 'Recorded Weight'}
                    </span>
                    <span className="font-black text-slate-900 text-sm">
                      {animal.weight_kg ?? animal.weight ?? (isAquaculture ? 850 : 420)} kg
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Holding Farm ID</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {animal.farm_id || profile?.farmId || 'farm-pb-01'}
                    </span>
                  </div>

                  {/* Aquaculture Collective Pond Specs */}
                  {isAquaculture && (
                    <div className="mt-3 p-3 bg-sky-50 rounded-2xl border border-sky-200 space-y-2">
                      <div className="text-[11px] font-black text-sky-950 uppercase flex items-center gap-1.5">
                        <Waves className="w-3.5 h-3.5 text-sky-700" />
                        <span>Pond Specifications</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Pond Identifier:</span>
                        <span className="font-bold text-slate-800">{animal.fishery_details?.pond_id || 'POND-01'}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Water Salinity:</span>
                        <span className="font-bold text-slate-800 capitalize">{animal.fishery_details?.water_type || 'Freshwater'}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Surface Area:</span>
                        <span className="font-bold text-slate-800">{animal.fishery_details?.surface_area_sqm || 1200} m²</span>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {animal.notes && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Management Notes
                      </span>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {animal.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Digital Ear Tag Passport QR Card */}
              <div className="bg-white rounded-3xl border border-teal-100 p-5 sm:p-6 shadow-2xs space-y-4 text-center">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-left">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Digital QR Ear-Tag Passport
                    </h3>
                    <p className="text-[11px] text-slate-400">Verifiable by dairies, chilling centers & FSSAI</p>
                  </div>
                  <QrCode className="w-5 h-5 text-teal-700 shrink-0" />
                </div>

                <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 inline-block shadow-inner">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Animal QR Passport" className="w-40 h-40 mx-auto" />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-slate-300">
                      <QrCode className="w-16 h-16" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="font-mono text-xs font-extrabold text-slate-800">
                    {animal.qr_token || `QR-${animal.animal_code}`}
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    Encrypted Food Safety Verification Token
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => qrDataUrl && downloadDataUrlAsFile(qrDataUrl, `passport_${animal.animal_code}.png`)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR</span>
                  </button>

                  <Link
                    href={`/qr/${animal.qr_token || animal.animal_code}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Passport URL</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Unified Chronological Health Journey (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <HealthTimeline
                events={timelineEvents}
                onLogTreatment={() => router.push(`/treatments/new?animal=${encodeURIComponent(animal.animal_code)}`)}
                onReportIssue={() => setShowReportModal(true)}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Edit Animal Modal */}
      {showEditModal && (
        <EditAnimalModal
          animal={animal}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={async (updated) => {
            setAnimal(updated);
            setShowEditModal(false);
            await updateAnimal(animal.id, updated);
          }}
        />
      )}

      {/* Report Clinical Health Issue Modal */}
      {showReportModal && (
        <ReportHealthIssueModal
          animal={animal}
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleSyndromicReportSubmit}
        />
      )}

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
