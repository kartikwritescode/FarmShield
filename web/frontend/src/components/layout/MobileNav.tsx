'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderHeart,
  QrCode,
  Calendar,
  User,
  Stethoscope,
  Syringe,
  FlaskConical,
  ShieldAlert,
  Building2,
  MapPin,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const rawRole = (user?.role || '').toLowerCase().trim();
  const role = (rawRole === 'veterinarian' || rawRole === 'vet')
    ? 'veterinarian'
    : (rawRole === 'admin' || rawRole === 'authority' || rawRole === 'government')
    ? 'admin'
    : 'farmer';

  // Role-specific bottom mobile nav configurations
  const getNavItems = () => {
    switch (role) {
      case 'veterinarian':
        return [
          {
            name: 'Clinical',
            href: '/dashboard',
            icon: Stethoscope,
          },
          {
            name: 'Triage',
            href: '/surveillance/triage',
            icon: ShieldAlert,
          },
          {
            name: 'Prescribe',
            href: '/treatments/new',
            isCenter: true,
            icon: Syringe,
          },
          {
            name: 'Lab Tests',
            href: '/lab-results',
            icon: FlaskConical,
          },
          {
            name: 'Profile',
            href: '/profile',
            icon: User,
          },
        ];

      case 'admin':
        return [
          {
            name: 'National',
            href: '/dashboard',
            icon: Building2,
          },
          {
            name: 'Surveillance',
            href: '/surveillance',
            icon: Eye,
          },
          {
            name: 'GIS Radar',
            href: '/surveillance/map',
            isCenter: true,
            icon: MapPin,
          },
          {
            name: 'MRL Lab',
            href: '/lab-results',
            icon: FlaskConical,
          },
          {
            name: 'Profile',
            href: '/profile',
            icon: User,
          },
        ];

      default:
        // Farmer Navigation
        return [
          {
            name: 'Home',
            href: '/dashboard',
            icon: LayoutDashboard,
          },
          {
            name: 'Livestock',
            href: '/livestock',
            icon: FolderHeart,
          },
          {
            name: 'Scan Tag',
            href: '/scan',
            isCenter: true,
            icon: QrCode,
          },
          {
            name: 'Calendar',
            href: '/calendar',
            icon: Calendar,
          },
          {
            name: 'Profile',
            href: '/profile',
            icon: User,
          },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleColor = () => {
    switch (role) {
      case 'veterinarian':
        return {
          activeText: 'text-blue-700',
          centerBg: 'bg-blue-700',
        };
      case 'admin':
        return {
          activeText: 'text-emerald-800',
          centerBg: 'bg-emerald-800',
        };
      default:
        return {
          activeText: 'text-teal-700',
          centerBg: 'bg-teal-700',
        };
    }
  };

  const colors = getRoleColor();

  return (
    <nav
      role="navigation"
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/dashboard' && pathname === '/');
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.name}
                className="flex flex-col items-center justify-center -mt-5 transition-transform active:scale-90"
              >
                <div
                  className={`w-12 h-12 rounded-full ${colors.centerBg} text-white flex items-center justify-center shadow-lg border-2 border-white`}
                >
                  <Icon className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] mt-1 font-bold text-slate-700 tracking-tight">
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.name}
              aria-current={isActive ? 'page' : undefined}
              className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 transition-transform active:scale-95 focus:outline-none"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? `${colors.activeText} stroke-[2.5]` : 'text-slate-400 stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? `${colors.activeText} font-black` : 'text-slate-500 font-medium'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
