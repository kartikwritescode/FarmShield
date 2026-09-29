'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Upload,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Waves,
  Calendar,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Species, AnimalPurpose, AnimalSex, FisheryDetails } from '../../types/database';
import { BREED_DATA, getBreedAsset } from '../../lib/breed_assets';
import { CloudinaryService } from '../../lib/services/cloudinary.service';
import { useLivestockStore } from '../../stores/livestockStore';

interface RegisterAnimalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SPECIES_OPTIONS: Array<{ id: Species; label: string; icon: string }> = [
  { id: 'cow', label: 'Cattle (गाय)', icon: '🐄' },
  { id: 'buffalo', label: 'Buffalo (भैंस)', icon: '🐃' },
  { id: 'goat', label: 'Goat (बकरी)', icon: '🐐' },
  { id: 'sheep', label: 'Sheep (भेड़)', icon: '🐑' },
  { id: 'fishery', label: 'Aquaculture (मत्स्य)', icon: '🐟' },
  { id: 'poultry', label: 'Poultry (मुर्गी पालन)', icon: '🐔' },
];

export const RegisterAnimalModal: React.FC<RegisterAnimalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { registerAnimal, isSubmitting } = useLivestockStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [species, setSpecies] = useState<Species>('cow');
  const [animalCode, setAnimalCode] = useState('');
  const [breed, setBreed] = useState('Sahiwal');
  const [dob, setDob] = useState(
    new Date(Date.now() - 365 * 2 * 86400000).toISOString().split('T')[0]
  );
  const [sex, setSex] = useState<AnimalSex>('female');
  const [weightKg, setWeightKg] = useState('420');
  const [purpose, setPurpose] = useState<AnimalPurpose>('milk');
  const [notes, setNotes] = useState('');

  // Aquaculture Collective Pond State
  const [pondId, setPondId] = useState('POND-01');
  const [waterType, setWaterType] = useState<'freshwater' | 'brackish' | 'saline'>('freshwater');
  const [biomassKg, setBiomassKg] = useState('850');
  const [surfaceAreaSqm, setSurfaceAreaSqm] = useState('1200');
  const [stockingDensity, setStockingDensity] = useState('8');

  // Media State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Breed Options
  const breedOptions = useMemo(() => {
    const list = BREED_DATA[species] || {};
    return Object.keys(list);
  }, [species]);

  // Adjust purpose and sex whenever species changes (Strict Cultural Sensitivity Check)
  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies);
    const breeds = BREED_DATA[newSpecies] || {};
    const firstBreed = Object.keys(breeds)[0] || 'Indigenous';
    setBreed(firstBreed);

    if (newSpecies === 'cow' || newSpecies === 'buffalo') {
      // Strictly Bovine: default to milk
      setPurpose('milk');
      setSex('female');
      setWeightKg(newSpecies === 'buffalo' ? '540' : '420');
    } else if (newSpecies === 'fishery') {
      setPurpose('aquaculture');
      setSex('collective');
      setWeightKg('850');
    } else if (newSpecies === 'goat' || newSpecies === 'sheep') {
      setPurpose('meat');
      setSex('female');
      setWeightKg('45');
    } else if (newSpecies === 'poultry') {
      setPurpose('egg');
      setSex('female');
      setWeightKg('2.2');
    }
  };

  // Auto Generate Tag
  const handleAutoGenerateTag = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = species === 'cow' ? 'COW' : species === 'buffalo' ? 'BUF' : species.substring(0, 3).toUpperCase();
    setAnimalCode(`IN-PB-2024-${prefix}-${randomSuffix}`);
  };

  // Generated QR Token
  const previewQrToken = useMemo(() => {
    const tag = animalCode || 'RFID';
    return `QR-${species.toUpperCase()}-${tag.replace(/[^a-zA-Z0-9]/g, '')}`;
  }, [species, animalCode]);

  // Handle Photo Selection
  const handlePhotoSelect = async (file: File) => {
    setSelectedFile(file);
    const compressed = await CloudinaryService.compressImage(file);
    setPreviewUrl(URL.createObjectURL(compressed));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoSelect(e.dataTransfer.files[0]);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalCode.trim()) {
      handleAutoGenerateTag();
    }

    try {
      let uploadedImageUrl = previewUrl;
      let cloudinaryPublicId: string | null = null;

      if (selectedFile) {
        setIsUploadingPhoto(true);
        try {
          const uploadRes = await CloudinaryService.uploadImage(selectedFile, {
            folder: 'animals',
            tags: [species, breed],
          });
          uploadedImageUrl = uploadRes.secureUrl;
          cloudinaryPublicId = uploadRes.publicId;
        } catch (uploadErr) {
          console.warn('Media upload failed, continuing with local asset fallback:', uploadErr);
        } finally {
          setIsUploadingPhoto(false);
        }
      }

      const isAquaculture = species === 'fishery';
      const fisheryDetails: FisheryDetails | null = isAquaculture
        ? {
            pond_id: pondId,
            water_type: waterType,
            biomass_kg: Number(biomassKg) || Number(weightKg) || 0,
            surface_area_sqm: Number(surfaceAreaSqm) || 0,
            stocking_density: Number(stockingDensity) || 0,
          }
        : null;

      await registerAnimal({
        animal_code: animalCode.trim() || `IN-PB-2024-${Math.floor(1000 + Math.random() * 9000)}`,
        species,
        breed,
        dob,
        sex,
        weight_kg: Number(isAquaculture ? biomassKg : weightKg) || 0,
        purpose,
        health_status: 'healthy',
        fishery_details: fisheryDetails,
        image_url: uploadedImageUrl || getBreedAsset(species, breed).imageUrl,
        cloudinary_public_id: cloudinaryPublicId,
        notes,
        qr_token: previewQrToken,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-teal-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-950 via-teal-900 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800/80 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <ShieldCheck className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                <span>National Livestock Digital Registry</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30">
                  DAHD / FSSAI
                </span>
              </h2>
              <p className="text-xs text-teal-200/90 mt-0.5">
                Register animal or pond unit with statutory MRL withdrawal passport
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                step >= 1 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </span>
            <span className={step === 1 ? 'text-teal-900' : ''}>Species & Tag</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                step >= 2 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span className={step === 2 ? 'text-teal-900' : ''}>Breed & Metrics</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                step >= 3 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span className={step === 3 ? 'text-teal-900' : ''}>Purpose</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                step >= 4 ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              4
            </span>
            <span className={step === 4 ? 'text-teal-900' : ''}>Photo & QR</span>
          </div>
        </div>

        {/* Modal Body / Steps */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* STEP 1: Species Selection & National Ear-Tag RFID */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  1. Select Livestock or Aquaculture Species
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SPECIES_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSpeciesChange(opt.id)}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        species === opt.id
                          ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="text-xs font-bold">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    2. Ear-Tag RFID / National Animal ID
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateTag}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Generate National Tag</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={animalCode}
                  onChange={(e) => setAnimalCode(e.target.value.toUpperCase())}
                  placeholder="e.g. IN-PB-2024-COW-9102"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Standard format conforms to Department of Animal Husbandry & Dairying (DAHD) tagging protocol.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Breed, DOB & Biometrics */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Breed Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                    Breed / Genetic Lineage
                  </label>
                  {breedOptions.length > 0 ? (
                    <select
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                    >
                      {breedOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                      <option value="Indigenous Cross">Indigenous Cross (मिश्रित देसी)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      placeholder="Breed name"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                    />
                  )}
                </div>

                {/* Date of Birth / Hatching */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                    Approximate Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Sex Selector */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                    Sex / Reproductive Class
                  </label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as AnimalSex)}
                    disabled={species === 'fishery'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 disabled:opacity-60"
                  >
                    <option value="female">Female (मादा)</option>
                    <option value="male">Male (नर)</option>
                    {species === 'fishery' && <option value="collective">Collective Pond Stock (सामूहिक)</option>}
                  </select>
                </div>

                {/* Weight / Biomass */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                    {species === 'fishery' ? 'Stock Biomass (kg)' : 'Live Weight (kg)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Purpose & Cultural Sensitivity Safeguards / Aquaculture Collective Pond Inputs */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Cultural Sensitivity Safeguard Notice */}
              {(species === 'cow' || species === 'buffalo') && (
                <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Indian Dairy Bio-Safety Standards:</span> Cattle and buffaloes are designated strictly for dairy milk production, breeding improvement, and agricultural draught work.
                  </div>
                </div>
              )}

              {species === 'fishery' ? (
                /* Dedicated Aquaculture Collective Pond Inputs */
                <div className="space-y-3.5 bg-sky-50/70 p-4 rounded-2xl border border-sky-200">
                  <h3 className="text-xs font-black uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
                    <Waves className="w-4 h-4 text-sky-700" />
                    <span>Aquaculture Pond Unit Parameters</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Pond / Tank Identifier</label>
                      <input
                        type="text"
                        value={pondId}
                        onChange={(e) => setPondId(e.target.value)}
                        placeholder="e.g. POND-NORTH-01"
                        className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Water Environment</label>
                      <select
                        value={waterType}
                        onChange={(e) => setWaterType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-bold text-slate-800"
                      >
                        <option value="freshwater">Freshwater (मीठा पानी)</option>
                        <option value="brackish">Brackish Water (खारा पानी)</option>
                        <option value="saline">Marine / Saline</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Surface Area (m² / bigha)</label>
                      <input
                        type="number"
                        value={surfaceAreaSqm}
                        onChange={(e) => setSurfaceAreaSqm(e.target.value)}
                        placeholder="e.g. 1200"
                        className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Estimated Biomass (kg)</label>
                      <input
                        type="number"
                        value={biomassKg}
                        onChange={(e) => {
                          setBiomassKg(e.target.value);
                          setWeightKg(e.target.value);
                        }}
                        placeholder="e.g. 850"
                        className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Terrestrial Livestock Purpose Options */
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                    Production Purpose
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Bovines: strictly Milk, Breeding, Draught */}
                    {species === 'cow' || species === 'buffalo' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setPurpose('milk')}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                            purpose === 'milk'
                              ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="text-lg">🥛</span>
                          <div>
                            <div className="text-xs font-bold">Milk Production</div>
                            <div className="text-[10px] text-slate-400">दुग्ध उत्पादन</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPurpose('breeding')}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                            purpose === 'breeding'
                              ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="text-lg">🧬</span>
                          <div>
                            <div className="text-xs font-bold">Breeding Stock</div>
                            <div className="text-[10px] text-slate-400">नस्ल सुधार</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPurpose('draught')}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                            purpose === 'draught'
                              ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="text-lg">🚜</span>
                          <div>
                            <div className="text-xs font-bold">Draught Work</div>
                            <div className="text-[10px] text-slate-400">कृषि कार्य</div>
                          </div>
                        </button>
                      </>
                    ) : (
                      /* Small ruminants & poultry: Meat, Milk, Egg, Breeding */
                      <>
                        <button
                          type="button"
                          onClick={() => setPurpose('meat')}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                            purpose === 'meat'
                              ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="text-lg">🥩</span>
                          <div>
                            <div className="text-xs font-bold">Meat Production</div>
                            <div className="text-[10px] text-slate-400">मांस उत्पादन</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPurpose('milk')}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                            purpose === 'milk'
                              ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="text-lg">🥛</span>
                          <div>
                            <div className="text-xs font-bold">Milk Production</div>
                            <div className="text-[10px] text-slate-400">दुग्ध</div>
                          </div>
                        </button>
                        {species === 'poultry' ? (
                          <button
                            type="button"
                            onClick={() => setPurpose('egg')}
                            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                              purpose === 'egg'
                                ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="text-lg">🥚</span>
                            <div>
                              <div className="text-xs font-bold">Egg Layer</div>
                              <div className="text-[10px] text-slate-400">अंडा उत्पादन</div>
                            </div>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPurpose('breeding')}
                            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                              purpose === 'breeding'
                                ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-600/20'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="text-lg">🧬</span>
                            <div>
                              <div className="text-xs font-bold">Breeding Stock</div>
                              <div className="text-[10px] text-slate-400">प्रजनन</div>
                            </div>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                  Clinical / Pedigree Remarks (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record vaccination marks, deworming history, or ear tag physical location..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Photo Picker & QR Verification */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Animal Identification Photo (Cloudinary / Supabase)
                </label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-teal-200 hover:border-teal-400 rounded-3xl p-5 bg-teal-50/30 flex flex-col items-center justify-center text-center transition-colors cursor-pointer relative"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
                  />

                  {previewUrl ? (
                    <div className="relative group w-full max-w-xs h-40 rounded-2xl overflow-hidden shadow-md">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewUrl('');
                            setSelectedFile(null);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        Drag & drop animal photo here, or browse files
                      </div>
                      <p className="text-[11px] text-slate-400">
                        JPEG, PNG or WebP • Automatic client-side compression
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          cameraInputRef.current?.click();
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs hover:bg-teal-50"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Take Photo via Camera</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* QR Verification Preview Badge */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 shrink-0">
                    <QrCode className="w-5 h-5 text-teal-300" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                      Automatic Digital Passport QR Token
                    </div>
                    <div className="font-mono text-sm font-extrabold text-white">
                      {previewQrToken}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 shrink-0">
                  Ready to Issue
                </span>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl hover:bg-slate-100 text-slate-500 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !animalCode) handleAutoGenerateTag();
                  setStep((s) => (s + 1) as any);
                }}
                className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer ml-auto"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || isUploadingPhoto}
                className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer ml-auto disabled:opacity-60"
              >
                {isSubmitting || isUploadingPhoto ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Animal...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Register Animal & Issue Passport</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
