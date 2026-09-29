'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Stethoscope,
  Building2,
  LogIn,
  LogOut,
  ChevronDown,
  User,
  Settings,
  FileText,
  Check,
  Store,
  Sparkles,
  Layers,
  Activity,
  Menu,
} from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { useLanguage } from '../../providers/LanguageProvider';
import { useAuth } from '../../providers/AuthProvider';
import { useUIStore } from '../../stores/uiStore';

export type UserRoleMode = 'farmer' | 'vet' | 'veterinarian' | 'admin' | 'qr_scanner';

interface NavbarProps {
  currentRole?: UserRoleMode;
  onRoleChange?: (role: UserRoleMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole: propRole,
  onRoleChange,
}) => {
  const router = useRouter();
  const { language, t } = useLanguage();
  const { user, isAuthenticated, logout, openAuthModal, switchRole } = useAuth();
  const { toggleMobileSidebar } = useUIStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rawRole = (propRole || user?.role || 'farmer') as string;
  const effectiveRole = (rawRole === 'veterinarian' || rawRole === 'vet' || rawRole === 'doctor')
    ? 'veterinarian'
    : (rawRole === 'admin' || rawRole === 'authority' || rawRole === 'government')
    ? 'admin'
    : 'farmer';

  // Close dropdown on outside click or Esc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleRoleSwitch = (targetRole: UserRoleMode) => {
    const normalized = targetRole === 'vet' ? 'veterinarian' : targetRole;
    switchRole(normalized as UserRoleMode);
    onRoleChange?.(normalized as UserRoleMode);
    setIsDropdownOpen(false);
  };

  const getRoleBadge = () => {
    switch (effectiveRole) {
      case 'veterinarian':
        return {
          label: language === 'en' ? 'Veterinary Portal' : 'पशु चिकित्सक पोर्टल',
          icon: Stethoscope,
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80',
          dotClass: 'bg-blue-500',
        };
      case 'admin':
        return {
          label: language === 'en' ? 'National Authority' : 'राष्ट्रीय प्राधिकरण',
          icon: Building2,
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dotClass: 'bg-emerald-500',
        };
      default:
        return {
          label: language === 'en' ? 'Farmer Workspace' : 'किसान कार्यक्षेत्र',
          icon: ShieldCheck,
          badgeClass: 'bg-teal-50 text-teal-800 border-teal-200/80',
          dotClass: 'bg-teal-600',
        };
    }
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo.icon;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Hamburger (Mobile) + Brand Logo + Active Panel Tag */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer shrink-0"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          <Link
            href="/"
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-800 to-emerald-950 group-hover:from-teal-700 group-hover:to-emerald-900 transition-all flex items-center justify-center shadow-md text-white shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                  FarmShield
                </span>
                {/* <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200">
                  SIH25007
                </span> */}
              </div>
              <p className="hidden md:block text-[10px] text-slate-500 font-semibold leading-tight">
                {language === 'en'
                  ? 'Digital Livestock Health & Surveillance Platform'
                  : 'डिजिटल पशुधन स्वास्थ्य एवं निगरानी मंच'}
              </p>
            </div>
          </Link>

          {/* Active Workspace / Role Pill */}
          <div className="hidden sm:flex items-center ml-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${roleInfo.badgeClass}`}
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{roleInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Center: Subtle Ministry Sentinel status or search indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-700">Gov Sentinel Grid:</span>
          <span>Active (FSSAI & DAHD Synced)</span>
        </div>

        {/* Right: Notifications + Language + Circular Avatar Button with Dropdown */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Farm Switcher for Farmers */}
          {effectiveRole === 'farmer' && (
            <div className="hidden xl:flex items-center bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 gap-1.5">
              <Store className="w-3.5 h-3.5 text-teal-700" />
              <select
                aria-label="Select Farm Unit"
                defaultValue="farm-pb-01"
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
              >
                <option value="farm-pb-01">Punjab Dairy Unit #1 (Ludhiana)</option>
                <option value="farm-pb-02">Malwa Commercial Dairy #2</option>
                <option value="farm-aqua-01">Sutlej Freshwater Fishery Pond #1</option>
                <option value="farm-pl-01">Doaba Broiler & Layer Farm</option>
              </select>
            </div>
          )}

          {/* Realtime Notification Drawer */}
          <NotificationDrawer />

          {/* Language Selector */}
          <LanguageSelector />

          {/* User Profile Avatar Popover or Sign In */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-teal-700/30 cursor-pointer"
                aria-expanded={isDropdownOpen}
                aria-label="User Account Menu"
              >
                <div className="relative">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-teal-800 to-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-md border-2 border-white">
                    {userInitial}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${roleInfo.dotClass}`} />
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform hidden sm:block ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Floating Profile Popover Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 px-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Header */}
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-teal-800 text-white font-black text-base flex items-center justify-center shadow-sm shrink-0">
                        {userInitial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {user.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {user.email || user.phone || 'Authenticated User'}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${roleInfo.badgeClass}`}>
                            {effectiveRole}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold truncate">
                            {user.state ? `${user.district || ''}, ${user.state}` : 'National Service'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Switch Workspace / Role Section */}
                  <div className="space-y-1 mb-3">
                    <div className="px-2 py-1 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400">
                      <span>Switch Workspace Panel</span>
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Role Option 1: Farmer */}
                    <button
                      onClick={() => handleRoleSwitch('farmer')}
                      className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                        effectiveRole === 'farmer'
                          ? 'bg-teal-50 border border-teal-200/80 text-teal-950 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-teal-100/80 text-teal-800 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black">Farmer Workspace</p>
                          <p className="text-[10px] text-slate-500">Livestock, treatments, withdrawal timers</p>
                        </div>
                      </div>
                      {effectiveRole === 'farmer' && (
                        <Check className="w-4 h-4 text-teal-700 shrink-0" />
                      )}
                    </button>

                    {/* Role Option 2: Veterinarian */}
                    <button
                      onClick={() => handleRoleSwitch('veterinarian')}
                      className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                        effectiveRole === 'veterinarian'
                          ? 'bg-blue-50 border border-blue-200/80 text-blue-950 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-blue-100/80 text-blue-800 flex items-center justify-center">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black">Veterinary Portal</p>
                          <p className="text-[10px] text-slate-500">Clinical triage, AMU stewardship, AI risk</p>
                        </div>
                      </div>
                      {effectiveRole === 'veterinarian' && (
                        <Check className="w-4 h-4 text-blue-700 shrink-0" />
                      )}
                    </button>

                    {/* Role Option 3: Admin / Government */}
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                        effectiveRole === 'admin'
                          ? 'bg-emerald-50 border border-emerald-200/80 text-emerald-950 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black">Admin / Government Body</p>
                          <p className="text-[10px] text-slate-500">DAHD biosecurity & FSSAI MRL audits</p>
                        </div>
                      </div>
                      {effectiveRole === 'admin' && (
                        <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      )}
                    </button>
                  </div>

                  {/* Navigation Links inside Dropdown */}
                  <div className="pt-2 border-t border-slate-100 space-y-0.5 text-xs font-bold text-slate-700">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Account Profile & Farm Credentials</span>
                    </Link>

                    <Link
                      href="/reports"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Statutory Audits & PDF Exports</span>
                    </Link>

                    <button
                      onClick={async () => {
                        setIsDropdownOpen(false);
                        await logout();
                        router.push('/');
                      }}
                      className="w-full text-left flex items-center gap-2.5 p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-700 text-white rounded-2xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Sign In' : 'लॉग इन'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
