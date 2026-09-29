'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ShieldCheck,
  Wheat,
  Stethoscope,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuthStore, UserRole } from '../../stores/authStore';

// Zod Validation Schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email or identifier is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type RoleType = 'farmer' | 'vet' | 'government';

interface RoleCardConfig {
  id: RoleType;
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  demoEmail: string;
  features: string[];
}

const roleCards: RoleCardConfig[] = [
  {
    id: 'farmer',
    title: '🐄 Farmer',
    badge: 'Livestock Care',
    icon: <Wheat className="w-6 h-6" />,
    description: 'Manage livestock and farm health.',
    demoEmail: 'farmer.demo@farmshield.gov.in',
    features: ['Livestock Health Records', 'Withdrawal Period Timers', 'Ear-Tag Animal Passports'],
  },
  {
    id: 'vet',
    title: '🩺 Veterinarian',
    badge: 'Clinical Care',
    icon: <Stethoscope className="w-6 h-6" />,
    description: 'Monitor animal health and veterinary care.',
    demoEmail: 'dr.ananya@farmshield.gov.in',
    features: ['Veterinary Prescriptions', 'AMU & MRL Auditing', 'Lab Diagnostics'],
  },
  {
    id: 'government',
    title: '🏛 Government',
    badge: 'Regulatory Clearance',
    icon: <Building2 className="w-6 h-6" />,
    description: 'Monitor population-level livestock health and compliance.',
    demoEmail: 'admin.dahd@gov.in',
    features: ['National Disease Surveillance', 'GIS Outbreak Containment', 'Regulatory Compliance'],
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const roleParam = searchParams.get('role');

  const initialRole: RoleType =
    roleParam === 'vet' || roleParam === 'veterinarian'
      ? 'vet'
      : roleParam === 'government' || roleParam === 'admin'
      ? 'government'
      : 'farmer';

  const [selectedRole, setSelectedRole] = useState<RoleType>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const { login, demoLogin, loginWithGoogle, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    setFormNotice(null);
    setFormSuccess(null);

    const result = await login(values.email, values.password);

    if (result.error) {
      setFormError(result.error);
    } else {
      const authorizedRole = useAuthStore.getState().role;
      const targetDashboard =
        redirectUrl && redirectUrl !== '/dashboard'
          ? redirectUrl
          : authorizedRole === 'government'
          ? '/admin/dashboard'
          : authorizedRole === 'vet'
          ? '/vet/dashboard'
          : '/farmer/dashboard';

      if (authorizedRole !== selectedRole) {
        setFormNotice(
          `Logged in successfully. Notice: Your account is authorized as ${authorizedRole.toUpperCase()}. Routing to your authorized dashboard...`
        );
      } else {
        setFormSuccess(`Authenticated as ${selectedRole.toUpperCase()}! Loading workspace...`);
      }

      setTimeout(() => {
        router.push(targetDashboard);
      }, 700);
    }
  };

  const handleSelectRole = (role: RoleType) => {
    setSelectedRole(role);
    setFormError(null);
    setFormNotice(null);
  };

  const handleApplyDemoAccount = (role: RoleType) => {
    const card = roleCards.find((c) => c.id === role);
    if (card) {
      setSelectedRole(role);
      setValue('email', card.demoEmail);
      setValue('password', 'FarmShield@2026');
      setFormError(null);
      setFormNotice(`Loaded credentials for Demo ${card.title}. Click "Sign In" or "Fast Demo Login".`);
    }
  };

  const handleQuickDemoLogin = (role: RoleType) => {
    setFormError(null);
    setFormNotice(null);
    demoLogin(role);
    const targetDashboard =
      redirectUrl && redirectUrl !== '/dashboard'
        ? redirectUrl
        : role === 'government'
        ? '/admin/dashboard'
        : role === 'vet'
        ? '/vet/dashboard'
        : '/farmer/dashboard';

    setFormSuccess(`Fast-signing into ${role.toUpperCase()} Workspace...`);
    setTimeout(() => {
      router.push(targetDashboard);
    }, 400);
  };

  const currentRoleCard = roleCards.find((c) => c.id === selectedRole) || roleCards[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col justify-between selection:bg-teal-700 selection:text-white">
      {/* Top Header Bar */}
      <header className="px-4 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-800 to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/15 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              FarmShield
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block -mt-0.5">
              Authorized Portal Access
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Public Site</span>
          <span className="sm:hidden">Home</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        {/* Title & Introduction */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            Role-Based Authentication & Verification
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Welcome to FarmShield
          </h1>
          <p className="text-base sm:text-lg text-teal-900 font-bold tracking-wide">
            Choose your workspace
          </p>
        </div>

        {/* STEP 1: ROLE SELECTION CARDS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            <span>Step 1: Choose Your Role</span>
            <span className="text-teal-800 font-bold lowercase">
              Selected: <strong className="uppercase font-black">{selectedRole}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleCards.map((card) => {
              const isSelected = selectedRole === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectRole(card.id)}
                  className={`text-left p-5 rounded-3xl border transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'bg-teal-50/50 border-teal-600 ring-2 ring-teal-600/20 shadow-md shadow-teal-900/5'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-teal-800 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {card.icon}
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        isSelected
                          ? 'bg-teal-800 text-white border-teal-800'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900">{card.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                    <span className={isSelected ? 'text-teal-900' : 'text-slate-400'}>
                      {isSelected ? '✓ Role Selected' : 'Click to select'}
                    </span>
                    <span className="text-slate-400">→</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: CREDENTIALS AUTHENTICATION FORM */}
        <div className="max-w-xl mx-auto w-full bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                Step 2: Authenticate
              </span>
              <h2 className="text-lg font-black text-slate-900">
                {currentRoleCard.title} Credentials
              </h2>
            </div>
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
              {currentRoleCard.icon}
            </div>
          </div>

          {/* Feedback Messages */}
          {formError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {formNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{formNotice}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Email Address / Registered Identifier
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder={currentRoleCard.demoEmail}
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15 transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] font-bold text-rose-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Secret Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-teal-800 hover:text-teal-900 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your account password"
                  {...register('password')}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-bold text-rose-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-teal-900/15 hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {currentRoleCard.title}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-slate-400 font-extrabold tracking-wider">
                  or continue with
                </span>
              </div>
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={async () => {
                setFormError(null);
                setFormNotice(null);
                setFormSuccess('Connecting to Google...');
                await loginWithGoogle(selectedRole);
              }}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-teal-50/50 border border-slate-300 hover:border-teal-600 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-2xs hover:shadow transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </span>
            </button>
          </form>

          {/* Quick Demo Credentials Bar */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Evaluation Shortcut Credentials
              </span>
              <span className="text-slate-400">1-Click Test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('farmer')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-left text-[11px] transition-colors cursor-pointer group"
              >
                <strong className="block text-slate-900 font-bold group-hover:text-teal-900">
                  Demo Farmer
                </strong>
                <span className="text-slate-500 text-[10px] block truncate">
                  farmer.demo@farmshield
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('vet')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-left text-[11px] transition-colors cursor-pointer group"
              >
                <strong className="block text-slate-900 font-bold group-hover:text-teal-900">
                  Demo Vet
                </strong>
                <span className="text-slate-500 text-[10px] block truncate">
                  dr.ananya@farmshield
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('government')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 text-left text-[11px] transition-colors cursor-pointer group"
              >
                <strong className="block text-slate-900 font-bold group-hover:text-teal-900">
                  Demo Govt
                </strong>
                <span className="text-slate-500 text-[10px] block truncate">
                  admin.dahd@gov.in
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Footer Bar */}
      <footer className="px-4 py-6 border-t border-slate-100 text-center text-xs text-slate-500">
        <p>
          FarmShield Digital Livestock Health & Surveillance Platform • Confidential & Role-Governed
          Access
        </p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center font-sans text-xs font-bold text-teal-800">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-teal-700" />
          <span>Initializing Secure Portal Access...</span>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
