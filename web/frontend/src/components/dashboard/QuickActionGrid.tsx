'use client';

import React from 'react';
import Link from 'next/link';
import {
  Pill,
  QrCode,
  AlertTriangle,
  FlaskConical,
  MapPin,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const QuickActionGrid: React.FC = () => {
  const actions = [
    {
      title: 'Administer Treatment',
      description: 'Prescribe medicine, record dosage & calculate withdrawal',
      href: '/treatments/new',
      icon: <Pill className="w-5 h-5 text-teal-700" />,
      badge: 'Statutory MRL',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      title: 'Scan QR Ear-Tag',
      description: 'Instant food safety passport & animal health history',
      href: '/scan',
      icon: <QrCode className="w-5 h-5 text-teal-600" />,
      badge: 'Public Passport',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      title: 'Report Disease Outbreak',
      description: 'Syndromic reporting for Mastitis, FMD & mortality',
      href: '/syndromic-report',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      badge: 'Epidemic Triage',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      title: 'Upload Lab Assay',
      description: 'Certify MRL residue lab results & microbial culture',
      href: '/lab-results',
      icon: <FlaskConical className="w-5 h-5 text-sky-600" />,
      badge: 'Lab Assays',
      badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    {
      title: 'Geospatial AMR Map',
      description: 'District heatmaps, vector hotspots & cluster alerts',
      href: '/surveillance/map',
      icon: <MapPin className="w-5 h-5 text-indigo-600" />,
      badge: 'GIS Heatmap',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
  ];

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
          Field Operations & Rapid Action Grid
        </h2>
        <span className="text-xs text-slate-500 font-medium">Quick Navigation</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {actions.map((act) => (
          <Link
            key={act.title}
            href={act.href}
            className="group relative rounded-2xl border border-teal-100/90 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg flex flex-col justify-between min-h-[136px]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {act.icon}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${act.badgeColor}`}>
                  {act.badge}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {act.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                  {act.description}
                </p>
              </div>
            </div>

            <div className="flex items-center text-[11px] font-bold text-teal-700 pt-2 border-t border-slate-100 mt-2">
              <span>Open Tool</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
