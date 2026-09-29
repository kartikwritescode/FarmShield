'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill,
  Search,
  ArrowLeft,
  AlertOctagon,
  Plus,
  RefreshCw,
  Scale,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { MedicineDetailModal } from './MedicineDetailModal';
import { AddMedicineModal } from './AddMedicineModal';
import { MedicineRepository, MedicineWithRules } from '../../lib/repositories/medicine.repository';
import { Medicine } from '../../types/database';
import { ReportExportService } from '../../lib/services/report_export.service';
import { PageHeader } from '../ui/PageHeader';

interface MedicinesCatalogProps {
  onBack?: () => void;
}

export const MedicinesCatalogModal: React.FC<MedicinesCatalogProps> = ({ onBack }) => {
  const [medicines, setMedicines] = useState<MedicineWithRules[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedWho, setSelectedWho] = useState<string>('All');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  const loadMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MedicineRepository.getMedicines({
        search: searchQuery,
        antimicrobialClass: selectedClass,
        whoClassification: selectedWho === 'All' ? undefined : selectedWho,
      });
      setMedicines(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedClass, selectedWho]);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const classes = [
    'All',
    'Penicillins',
    'Tetracyclines',
    'Fluoroquinolones (CIA)',
    '3rd Gen Cephalosporins',
    'Macrolides',
    'Aminoglycosides',
    'Sulfonamides',
  ];

  const whoTiers = ['All', 'HPCIA', 'CIA', 'HIA', 'Standard'];

  const handleExportCsv = () => {
    const exportData = medicines.map((m) => ({
      'Medicine ID': m.id,
      'Brand Name': m.name,
      'Active Ingredient': m.active_ingredient,
      'Class': m.antimicrobial_class,
      'WHO Classification': m.who_classification || 'Standard',
      'Strength': m.strength,
      'Milk Withdrawal (Days)': m.withdrawal_days_milk ?? m.default_withdrawal_days_milk ?? 3,
      'Meat Withdrawal (Days)': m.withdrawal_days_meat ?? m.default_withdrawal_days_meat ?? 14,
      'Statutory MRL': m.mrl || 'Regulated',
      'Status': m.status,
    }));
    ReportExportService.exportToCsv('FarmShield_Approved_Medicines_Formulary', exportData);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <PageHeader
        onBack={onBack}
        badge="FSSAI Regulated Formulary"
        icon={<Pill className="w-5 h-5 text-teal-700" />}
        title="Veterinary Medicines & Statutory MRL Formulary"
        description="National Residue Monitoring Standards • WHO Critically Important Antimicrobials (CIA/HPCIA)."
        actions={
          <>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-700" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-black text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine &amp; Rule</span>
            </button>
          </>
        }
      />

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medicine brand, active chemical molecule, or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 bg-gray-50/50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-teal-700 outline-none shadow-xs"
            />
          </div>

          {/* WHO Classification Badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">WHO Tier:</span>
            {whoTiers.map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedWho(tier)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition cursor-pointer ${
                  selectedWho === tier
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {/* Antimicrobial Class Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Class:</span>
          {classes.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition cursor-pointer ${
                selectedClass === c
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin text-teal-700" />
          <span className="text-xs font-bold">Querying National Veterinary Formulary...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && medicines.length === 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <Pill className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-gray-900">No Veterinary Formulations Found</h3>
          <p className="text-xs text-gray-500 font-bold max-w-md mx-auto">
            No active molecules matched your filter criteria. Adjust the class filter or register a new medicine formulation.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('All');
              setSelectedWho('All');
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Medicine Cards Grid */}
      {!loading && medicines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((item) => {
            const isBanned = item.antimicrobial_class.includes('PROHIBITED');
            const isHpcia = item.who_classification === 'HPCIA';
            const isCia = item.who_classification === 'CIA';
            const milkDays = item.withdrawal_days_milk ?? item.default_withdrawal_days_milk ?? 3;
            const meatDays = item.withdrawal_days_meat ?? item.default_withdrawal_days_meat ?? 14;

            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border-2 bg-white shadow-xs space-y-4 relative overflow-hidden transition-all hover:shadow-md ${
                  isBanned
                    ? 'border-red-500/60 bg-red-50/20'
                    : isHpcia
                    ? 'border-amber-300'
                    : 'border-gray-200'
                }`}
              >
                {isBanned && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                    PROHIBITED SUBSTANCE
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isHpcia
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : isCia
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      WHO {item.who_classification || 'Standard'}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">{item.strength}</span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">{item.name}</h3>
                  <p className="text-xs text-gray-500 font-bold">Active: {item.active_ingredient}</p>
                  <p className="text-[11px] text-teal-700 font-semibold">{item.antimicrobial_class}</p>
                </div>

                {/* Regulatory Withdrawal & MRL Box */}
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-bold">🥛 Milk Withdrawal:</span>
                    <span className="font-black text-gray-900">
                      {isBanned ? 'BANNED' : `${milkDays} Days`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-bold">🥩 Meat Withdrawal:</span>
                    <span className="font-black text-gray-900">
                      {isBanned ? 'BANNED' : `${meatDays} Days (Caprine/Ovine)`}
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-gray-200 text-[11px] text-gray-600 flex justify-between items-center">
                    <span className="font-bold flex items-center gap-1">
                      <Scale className="w-3 h-3 text-teal-700" /> FSSAI MRL:
                    </span>
                    <span className="font-black text-teal-800">{item.mrl || 'Regulated Threshold'}</span>
                  </div>

                  {item.regulatory_rules && item.regulatory_rules.length > 0 && (
                    <div className="text-[10px] text-gray-400 font-medium pt-1">
                      Rules: {item.regulatory_rules.length} Species Specific Directive(s)
                    </div>
                  )}
                </div>

                {isBanned ? (
                  <p className="text-[11px] text-red-600 font-bold flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 shrink-0" />
                    Strictly prohibited under Gazette of India veterinary notification.
                  </p>
                ) : (
                  <button
                    onClick={() =>
                      setSelectedMedicine({
                        id: item.id,
                        name: item.name,
                        active_ingredient: item.active_ingredient,
                        antimicrobial_class: item.antimicrobial_class,
                        strength: item.strength,
                        status: item.status || 'active',
                      })
                    }
                    className="w-full py-2 px-3 bg-gray-50 hover:bg-teal-700 text-gray-700 hover:text-white font-bold text-xs rounded-xl border border-gray-200 transition-colors cursor-pointer text-center"
                  >
                    Inspect MRL &amp; Dosage Guidelines →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect MRL & Dosage Guidelines Modal */}
      {selectedMedicine && (
        <MedicineDetailModal
          medicine={selectedMedicine}
          onClose={() => setSelectedMedicine(null)}
        />
      )}

      {/* Add Medicine & Statutory Rule Modal */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMedicineAdded={loadMedicines}
      />
    </div>
  );
};
