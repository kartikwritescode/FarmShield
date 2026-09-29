'use client';

import React from 'react';
import Link from 'next/link';
import {
  QrCode,
  AlertTriangle,
  Milk,
  Beef,
  Fish,
  Pill,
  ExternalLink,
} from 'lucide-react';
import { Animal } from '../../types/database';

interface AnimalTableViewProps {
  animals: Animal[];
  onEdit?: (animal: Animal) => void;
}

export const AnimalTableView: React.FC<AnimalTableViewProps> = ({ animals, onEdit }) => {
  return (
    <div className="bg-white rounded-3xl border border-teal-100/90 shadow-2xs overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Ear-Tag RFID</th>
              <th className="py-3.5 px-4">Species & Breed</th>
              <th className="py-3.5 px-4">Sex / Unit</th>
              <th className="py-3.5 px-4">Weight / Biomass</th>
              <th className="py-3.5 px-4">Health Status</th>
              <th className="py-3.5 px-4">Food Safety Compliance</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {animals.map((animal) => {
              const isBovine = animal.species === 'cow' || animal.species === 'buffalo';
              const isAquaculture = animal.species === 'fishery';
              const activeWithdrawal = animal.withdrawals?.find(
                (w) => w.status === 'active' && new Date(w.end_date) > new Date()
              );

              return (
                <tr key={animal.id} className="hover:bg-teal-50/40 transition-colors">
                  {/* Ear-Tag RFID & QR */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/qr/${animal.qr_token || animal.animal_code}`}
                        className="font-mono font-bold text-teal-800 hover:text-teal-900 hover:underline flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span>{animal.animal_code}</span>
                      </Link>
                    </div>
                  </td>

                  {/* Species & Breed */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="font-bold text-slate-900 capitalize">
                        {animal.breed || 'Indigenous'}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {animal.species} • {animal.purpose}
                      </div>
                    </div>
                  </td>

                  {/* Sex / Unit */}
                  <td className="py-3.5 px-4 capitalize">
                    {animal.sex || (isAquaculture ? 'Collective' : 'Female')}
                  </td>

                  {/* Weight / Biomass */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {isAquaculture
                      ? `${animal.fishery_details?.biomass_kg ?? animal.weight ?? 0} kg (Pond)`
                      : `${animal.weight_kg ?? animal.weight ?? 0} kg`}
                  </td>

                  {/* Health Status */}
                  <td className="py-3.5 px-4">
                    {animal.health_status === 'healthy' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Healthy
                      </span>
                    )}
                    {animal.health_status === 'under_treatment' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                        Under Care
                      </span>
                    )}
                    {animal.health_status === 'sick' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                        Clinical
                      </span>
                    )}
                    {animal.health_status === 'quarantine' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        Quarantine
                      </span>
                    )}
                  </td>

                  {/* Food Safety Compliance */}
                  <td className="py-3.5 px-4">
                    {isBovine ? (
                      activeWithdrawal ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Milk Hold Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <Milk className="w-3.5 h-3.5 shrink-0" />
                          <span>Milk Safe</span>
                        </span>
                      )
                    ) : isAquaculture ? (
                      activeWithdrawal ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Biomass Hold</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700">
                          <Fish className="w-3.5 h-3.5 shrink-0" />
                          <span>Food Grade Safe</span>
                        </span>
                      )
                    ) : activeWithdrawal ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>Meat Withheld</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <Beef className="w-3.5 h-3.5 shrink-0" />
                        <span>Meat Safe</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/qr/${animal.qr_token || animal.animal_code}`}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 text-teal-800 transition"
                        title="Open QR Passport"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/treatments?animal=${encodeURIComponent(animal.animal_code)}`}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
                        title="Treatment Record"
                      >
                        <Pill className="w-3.5 h-3.5" />
                      </Link>
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(animal)}
                          className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-100 transition cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
