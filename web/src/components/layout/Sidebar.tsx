'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderHeart,
  Activity,
  Calendar,
  ShieldAlert,
  QrCode,
  Pill,
  FlaskConical,
  Cpu,
  FileText,
  MapPin,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Building2,
  Syringe,
  BarChart3,
  Bell,
  Eye,
  SlidersHorizontal,
  CloudSun,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { useLanguage } from '../../providers/LanguageProvider';
import { getNavigationForRole, NavigationItem } from '../../lib/navigation';
import { useUIStore } from '../../stores/uiStore';

// Icon lookup dictionary
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  LayoutDashboard,
  FolderHeart,
  Activity,
  Calendar,
  ShieldAlert,
  QrCode,
  Pill,
  FlaskConical,
  Cpu,
  FileText,
  MapPin,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Building2,
  Syringe,
  BarChart3,
  Bell,
  Eye,
  SlidersHorizontal,
  CloudSun,
};

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const { isMobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navConfig = getNavigationForRole(user?.role);

  const getRoleTheme = () => {
    switch (navConfig.role) {
      case 'vet':
        return {
          activeClass: 'bg-blue-50 text-blue-900 font-bold border-r-4 border-blue-600 shadow-xs',
          iconActive: 'text-blue-700',
          roleBadge: 'bg-blue-100 text-blue-800 border-blue-200',
          hoverClass: 'hover:bg-slate-50 text-slate-700 hover:text-slate-900',
        };
      case 'government':
        return {
          activeClass: 'bg-emerald-50 text-emerald-950 font-bold border-r-4 border-emerald-700 shadow-xs',
          iconActive: 'text-emerald-700',
          roleBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          hoverClass: 'hover:bg-slate-50 text-slate-700 hover:text-slate-900',
        };
      default:
        return {
          activeClass: 'bg-teal-50 text-teal-950 font-bold border-r-4 border-teal-700 shadow-xs',
          iconActive: 'text-teal-700',
          roleBadge: 'bg-teal-100 text-teal-800 border-teal-200',
          hoverClass: 'hover:bg-slate-50 text-slate-700 hover:text-slate-900',
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <>
      <aside
      className={`hidden lg:flex flex-col bg-white border-r border-slate-200 h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* 1. Sidebar Top Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
        {!collapsed ? (
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-black text-slate-900 truncate">
              {navConfig.roleTitle}
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {navConfig.roleSubtitle}
            </span>
          </div>
        ) : (
          <div className="mx-auto">
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${theme.roleBadge}`}>
              {navConfig.role.slice(0, 3)}
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 2. Grouped Role-Specific Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {navConfig.sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {language === 'hi' && section.titleHi ? section.titleHi : section.title}
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item: NavigationItem) => {
                const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && item.href !== '/dashboard' && pathname?.startsWith(item.href));

                const itemName = language === 'hi' && item.nameHi ? item.nameHi : item.name;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={collapsed ? itemName : undefined}
                    className={`flex items-center px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group relative ${
                      isActive ? theme.activeClass : theme.hoverClass
                    } ${collapsed ? 'justify-center' : 'justify-between'}`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? theme.iconActive : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{itemName}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                          item.badgeColor === 'red'
                            ? 'bg-red-100 text-red-700'
                            : item.badgeColor === 'amber'
                            ? 'bg-amber-100 text-amber-700'
                            : item.badgeColor === 'blue'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed Tooltip */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 hidden group-hover:flex items-center bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-xl whitespace-nowrap z-50 shadow-xl border border-slate-700">
                        {itemName}
                        {item.badge && (
                          <span className="ml-1.5 px-1 py-0.2 rounded text-[9px] bg-white/20">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Bottom User Profile & Sign Out Footer */}
      <div className="p-3 border-t border-slate-100 bg-white">
        {user ? (
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-2.5'}`}>
            <Link
              href="/profile"
              className="relative shrink-0 group"
              title="Account Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-800 to-emerald-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            </Link>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <Link href="/profile" className="block hover:underline truncate">
                  <p className="text-xs font-black text-slate-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate">
                    {user.role} • {user.district || user.state || 'IN'}
                  </p>
                </Link>
              </div>
            )}

            {!collapsed && (
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {!collapsed ? (
              <Link
                href="/login"
                className="block w-full text-center py-2 px-3 text-xs font-black text-white bg-teal-800 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <Link
                href="/login"
                title="Sign In"
                className="flex items-center justify-center p-2 text-white bg-teal-800 hover:bg-teal-700 rounded-xl shadow-xs"
              >
                <User className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>

    {/* Responsive Mobile / Tablet Drawer */}
    {isMobileSidebarOpen && (
      <div className="lg:hidden fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />

        {/* Slide-out Drawer Panel */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
          {/* Drawer Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-black text-slate-900 truncate">
                {navConfig.roleTitle}
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate">
                {navConfig.roleSubtitle}
              </span>
            </div>
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
            {navConfig.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {language === 'hi' && section.titleHi ? section.titleHi : section.title}
                </div>

                <div className="space-y-1">
                  {section.items.map((item: NavigationItem) => {
                    const IconComponent = ICON_MAP[item.iconName] || LayoutDashboard;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/' && item.href !== '/dashboard' && pathname?.startsWith(item.href));
                    const itemName = language === 'hi' && item.nameHi ? item.nameHi : item.name;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={closeMobileSidebar}
                        className={`flex items-center px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group relative justify-between ${
                          isActive ? theme.activeClass : theme.hoverClass
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <IconComponent
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? theme.iconActive : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          <span className="truncate">{itemName}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                              item.badgeColor === 'red'
                                ? 'bg-red-100 text-red-700'
                                : item.badgeColor === 'amber'
                                ? 'bg-amber-100 text-amber-700'
                                : item.badgeColor === 'blue'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Drawer User Footer */}
          <div className="p-3 border-t border-slate-100 bg-white">
            {user ? (
              <div className="flex items-center space-x-2.5">
                <Link
                  href="/profile"
                  onClick={closeMobileSidebar}
                  className="relative shrink-0 group"
                  title="Account Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-800 to-emerald-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href="/profile"
                    onClick={closeMobileSidebar}
                    className="block hover:underline truncate"
                  >
                    <p className="text-xs font-black text-slate-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold truncate">
                      {user.role} • {user.district || user.state || 'IN'}
                    </p>
                  </Link>
                </div>

                <button
                  onClick={() => {
                    closeMobileSidebar();
                    handleLogout();
                  }}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/login"
                  onClick={closeMobileSidebar}
                  className="block w-full text-center py-2 px-3 text-xs font-black text-white bg-teal-800 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </>
  );
};
