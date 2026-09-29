'use client';

import React, { useState } from 'react';
import {
  X,
  Pill,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Camera,
  ShieldCheck,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { MedicineRepository } from '../../lib/repositories/medicine.repository';
import { CloudinaryService } from '../../lib/services/cloudinary.service';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMedicineAdded?: () => void;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onMedicineAdded,
}) => {
  const [name, setName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [antimicrobialClass, setAntimicrobialClass] = useState('Penicillins');
  const [whoClassification, setWhoClassification] = useState<'HPCIA' | 'CIA' | 'HIA' | 'Standard'>(
    'Standard'
  );
  const [strength, setStrength] = useState('100 mg/ml');
  const [withdrawalMilk, setWithdrawalMilk] = useState('3');
  const [withdrawalMeat, setWithdrawalMeat] = useState('14');
  const [speciesRule, setSpeciesRule] = useState('cow');
  const [mrlLimit, setMrlLimit] = useState('50.0 ug/kg');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeIngredient.trim()) {
      setErrorMsg('Brand Name and Active Ingredient are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let imageUrl: string | null = null;
      if (selectedFile) {
        try {
          const uploadRes = await CloudinaryService.uploadImage(selectedFile, 'medicines');
          imageUrl = uploadRes.secure_url;
        } catch {
          // fallback to local preview
          imageUrl = imagePreview;
        }
      }

      await MedicineRepository.createMedicine({
        name: name.trim(),
        active_ingredient: activeIngredient.trim(),
        antimicrobial_class: antimicrobialClass,
        strength: strength.trim(),
        who_classification: whoClassification,
        image_url: imageUrl,
        default_withdrawal_days_milk: Number(withdrawalMilk || 0),
        default_withdrawal_days_meat: Number(withdrawalMeat || 0),
        rule_species: speciesRule,
        rule_mrl: mrlLimit.trim(),
        rule_withdrawal_days: Number(withdrawalMilk || 3),
      });

      if (onMedicineAdded) {
        onMedicineAdded();
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish regulatory medicine.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-400 shadow-xs">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
                Veterinary Formulary
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Add Medicine & Statutory MRL Rule
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Brand / Commercial Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amoxil-Vet 15% LA"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Active Chemical Molecule / Salt *
              </label>
              <input
                type="text"
                required
                value={activeIngredient}
                onChange={(e) => setActiveIngredient(e.target.value)}
                placeholder="e.g. Amoxicillin Trihydrate"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Antimicrobial Class
              </label>
              <select
                value={antimicrobialClass}
                onChange={(e) => setAntimicrobialClass(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Penicillins">Penicillins (Beta-lactam)</option>
                <option value="Tetracyclines">Tetracyclines</option>
                <option value="Fluoroquinolones (CIA)">Fluoroquinolones (HPCIA)</option>
                <option value="3rd Gen Cephalosporins">3rd Gen Cephalosporins (HPCIA)</option>
                <option value="Macrolides">Macrolides</option>
                <option value="Aminoglycosides">Aminoglycosides</option>
                <option value="Sulfonamides">Sulfonamides</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                WHO Importance Tier
              </label>
              <select
                value={whoClassification}
                onChange={(e) => setWhoClassification(e.target.value as any)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="HPCIA">HPCIA (Highest Priority Critically Important)</option>
                <option value="CIA">CIA (Critically Important)</option>
                <option value="HIA">HIA (Highly Important)</option>
                <option value="Standard">Standard Veterinary Antimicrobial</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Strength / Concentration
              </label>
              <input
                type="text"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="e.g. 150 mg/ml"
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Statutory MRL Rule Specification */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-teal-600" />
              Statutory MRL & Withdrawal Rules (DAHD / FSSAI)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Species
                </label>
                <select
                  value={speciesRule}
                  onChange={(e) => setSpeciesRule(e.target.value)}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="cow">Cattle (Dairy Cow)</option>
                  <option value="buffalo">Buffalo (Murrah)</option>
                  <option value="goat">Goat (Small Ruminant)</option>
                  <option value="sheep">Sheep</option>
                  <option value="fishery">Fishery (Aquaculture)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Milk Withdrawal (Days)
                </label>
                <input
                  type="number"
                  value={withdrawalMilk}
                  onChange={(e) => setWithdrawalMilk(e.target.value)}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Meat Withdrawal (Days)
                </label>
                <input
                  type="number"
                  value={withdrawalMeat}
                  onChange={(e) => setWithdrawalMeat(e.target.value)}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  FSSAI MRL Limit
                </label>
                <input
                  type="text"
                  value={mrlLimit}
                  onChange={(e) => setMrlLimit(e.target.value)}
                  placeholder="e.g. 4.0 ug/kg"
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Packaging Photo Upload */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Medicine Packaging / Label Photo
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer py-2.5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 transition">
                <Camera className="w-4 h-4 text-teal-600" />
                <span>Upload Packaging Photo</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {imagePreview && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-md transition flex items-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              <span>Publish Regulatory Medicine</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
