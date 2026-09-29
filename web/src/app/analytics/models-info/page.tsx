'use client';

import React from 'react';
import Link from 'next/link';
import {
  BarChart3,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { GovHeader } from '../../../components/ui/GovHeader';
import { Navbar } from '../../../components/ui/Navbar';
import { Sidebar } from '../../../components/layout/Sidebar';
import { MobileNav } from '../../../components/layout/MobileNav';
import { PageHeader } from '../../../components/ui/PageHeader';
import { useAuth } from '../../../providers/AuthProvider';
import { ModelsInfoCard } from '../../../components/analytics/ModelsInfoCard';

export default function AnalyticsModelsInfoPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <GovHeader />
      <Navbar currentRole={user?.role || 'admin'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-12 space-y-6">
          <PageHeader
            badge="AI INTELLIGENCE & AUDIT BENCHMARKS"
            title="Model Transparency & Benchmarks"
            subtitle="Production Machine Learning Architecture, Macro F1 Scores, ROC-AUC Curves, and Pharmacokinetic Degradation Kinetics"
            icon={BarChart3}
            actions={
              <Link
                href="/analytics/ml-risk"
                className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span>Test Live AMU Predictor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            }
          />

          {/* Model Benchmarking Component */}
          <ModelsInfoCard />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
