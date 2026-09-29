'use client';

import React, { useState } from 'react';
import { X, Save, Scale, ShieldCheck, Waves, Loader2 } from 'lucide-react';
import { Animal, HealthStatus, AnimalPurpose } from '../../types/database';

interface EditAnimalModalProps {
  animal: Animal;
  isOpen?: boolean;
  onClose: () => void;
  onSave: (updated: Animal) => void;
}

export const EditAnimalModal: React.FC<EditAnimalModalProps> = ({
  animal,
  isOpen = true,
  onClose,
  onSave,
}) => {
  const isBovine = animal.species === 'cow' || animal.species === 'buffalo';
  const isAquaculture = animal.species === 'fishery';

  const [weight, setWeight] = useState(
    String(animal.weight_kg ?? animal.weight ?? (isAquaculture ? '850' : '400'))
  );
  const [healthStatus, setHealthStatus] = useState<HealthStatus>(animal.health_status || 'healthy');
  const [purpose, setPurpose] = useState<AnimalPurpose>(animal.purpose || (isAquaculture ? 'aquaculture' : 'milk'));
  const [notes, setNotes] = useState(animal.notes || '');

  // Fishery details
  const [pondId, setPondId] = useState(animal.fishery_details?.pond_id || 'POND-01');
  const [waterType, setWaterType] = useState(animal.fishery_details?.water_type || 'freshwater');
  const [surfaceAreaSqm, setSurfaceAreaSqm] = useState(
    String(animal.fishery_details?.surface_area_sqm || 1200)
  );

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const parsedWeight = Number(weight) || 0;

    const updatedAnimal: Animal = {
      ...animal,
      weight: parsedWeight,
      weight_kg: parsedWeight,
      health_status: healthStatus,
      purpose,
      notes,
      fishery_details: isAquaculture
        ? {
            pond_id: pondId,
            water_type: waterType as any,
            biomass_kg: parsedWeight,
            surface_area_sqm: Number(surfaceAreaSqm) || 0,
            stocking_density: animal.fishery_details?.stocking_density,
          }
        : animal.fishery_details,
    };

    setTimeout(() => {
      setIsSaving(false);
      onSave(updatedAnimal);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-teal-950 via-teal-900 to-teal-800 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-black tracking-tight">
              Edit Animal: {animal.animal_code}
            </h3>
            <p className="text-xs text-teal-200/90 capitalize">
              {animal.breed} • {animal.species}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Weight / Biomass */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              {isAquaculture ? 'Pond Biomass (kg)' : 'Live Weight (kg)'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                kg
              </span>
            </div>
          </div>

          {/* Health Status */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Clinical Health Status
            </label>
            <select
              value={healthStatus}
              onChange={(e) => setHealthStatus(e.target.value as HealthStatus)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            >
              <option value="healthy">Healthy (सुरक्षित)</option>
              <option value="under_treatment">Under Treatment (उपचाराधीन)</option>
              <option value="sick">Sick / Clinical (अस्वस्थ)</option>
              <option value="quarantine">Quarantine (संगरोध)</option>
            </select>
          </div>

          {/* Purpose (Strictly Culturally Sensitive: No Meat for Bovines) */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Production Purpose
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as AnimalPurpose)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            >
              {isBovine ? (
                <>
                  <option value="milk">Milk Production (दुग्ध उत्पादन)</option>
                  <option value="breeding">Breeding Stock (प्रजनन)</option>
                  <option value="draught">Draught Work (कृषि कार्य)</option>
                </>
              ) : isAquaculture ? (
                <option value="aquaculture">Aquaculture Production (मत्स्य)</option>
              ) : (
                <>
                  <option value="meat">Meat Production (मांस उत्पादन)</option>
                  <option value="milk">Milk Production (दुग्ध)</option>
                  <option value="breeding">Breeding (प्रजनन)</option>
                  <option value="egg">Egg Layer (अंडा)</option>
                </>
              )}
            </select>
          </div>

          {/* Aquaculture Specific Inputs */}
          {isAquaculture && (
            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 space-y-3">
              <div className="text-xs font-black text-sky-950 uppercase flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-sky-700" />
                <span>Aquaculture Pond Settings</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Pond ID</label>
                  <input
                    type="text"
                    value={pondId}
                    onChange={(e) => setPondId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Water Type</label>
                  <select
                    value={waterType}
                    onChange={(e) => setWaterType(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border border-sky-300 rounded-lg text-xs font-bold"
                  >
                    <option value="freshwater">Freshwater</option>
                    <option value="brackish">Brackish</option>
                    <option value="saline">Saline</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Pedigree / Management Remarks
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Physical markings, tag replacement notes, or pedigree..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Animal Specs</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
