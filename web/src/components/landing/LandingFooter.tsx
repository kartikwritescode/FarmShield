'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          {/* LEFT: Brand Information */}
          <div className="lg:col-span-2 space-y-3">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-teal-800 border border-teal-700/80 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-5 h-5 text-teal-300" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                FarmShield
              </span>
            </Link>

            <p className="text-sm text-slate-400 font-medium max-w-xs leading-relaxed">
              Digital Livestock Health &amp; Surveillance Platform
            </p>
          </div>

          {/* COLUMN 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition-colors">
                  Solutions
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 2: Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Solutions
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login?role=farmer" className="hover:text-white transition-colors">
                  Farmers
                </Link>
              </li>
              <li>
                <Link href="/login?role=veterinarian" className="hover:text-white transition-colors">
                  Veterinarians
                </Link>
              </li>
              <li>
                <Link href="/login?role=admin" className="hover:text-white transition-colors">
                  Government
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="hover:text-white transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM: Copyright & Subtitle */}
        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FarmShield</p>
          <p>Digital Livestock Health &amp; Surveillance Platform</p>
        </div>
      </div>
    </footer>
  );
};
