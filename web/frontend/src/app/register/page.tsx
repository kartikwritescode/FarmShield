'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ShieldCheck,
  Stethoscope,
  Building2,
  Wheat,
  Activity,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Lock,
  User as UserIcon,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

import { useAuthStore, UserRole } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

// Comprehensive Zod Registration Schema
const registerSchema = z.object({
  name: z.string().min(2, 'Full Name is required (minimum 2 characters)'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z
    .string()
    .min(10, 'Mobile phone number must be 10 digits')
    .max(10, 'Mobile phone number must be 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit mobile number starting with 6-9'),
  farmName: z.string().min(2, 'Farm or Facility Name is required'),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  licenseNo: z.string().optional(),
  farmType: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type RoleTab = 'farmer' | 'veterinarian' | 'admin';

const INDIAN_STATES = [
  'Punjab',
  'Haryana',
  'Gujarat',
  'Maharashtra',
  'Uttar Pradesh',
  'Rajasthan',
  'Karnataka',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
  'Madhya Pradesh',
  'Kerala',
  'Bihar',
  'West Bengal',
  'Odisha',
  'Assam',
];

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role');
  const initialRole: RoleTab =
    initialRoleParam === 'veterinarian' || initialRoleParam === 'admin'
      ? initialRoleParam
      : 'farmer';

  const [activeRole, setActiveRole] = useState<RoleTab>(initialRole);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const { register: registerAuth, demoLogin, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      farmName: '',
      state: 'Punjab',
      district: 'Ludhiana',
      licenseNo: '',
      farmType: 'Dairy Cattle & Buffalo',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    setFormSuccess(null);

    const result = await registerAuth({
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone,
      role: activeRole,
      state: values.state,
      district: values.district,
      farmId: values.farmName,
      farmType: values.farmType || 'Dairy Herd',
      licenseNo: values.licenseNo,
    });

    if (result.error) {
      setFormError(result.error);
    } else {
      setFormSuccess('Account created and verified! Redirecting to portal...');
      setTimeout(() => {
        if (activeRole === 'admin') router.push('/surveillance');
        else if (activeRole === 'veterinarian') router.push('/treatments');
        else router.push('/livestock');
      }, 500);
    }
  };

  const handleDemoPreset = (role: UserRole) => {
    demoLogin(role);
    setFormSuccess(`Registered & logged in as Demo ${role.toUpperCase()}! Redirecting...`);
    setTimeout(() => {
      if (role === 'admin') router.push('/surveillance');
      else if (role === 'veterinarian') router.push('/treatments');
      else router.push('/');
    }, 300);
  };

  const roleConfigs = {
    farmer: {
      title: 'Farmer / Producer',
      icon: <Wheat className="w-4 h-4" />,
      facilityLabel: 'Dairy Farm / Aquaculture Pond Unit Name',
      tagline: 'Register herds, request veterinary prescriptions & download QR ear tags',
    },
    veterinarian: {
      title: 'Field Veterinarian',
      icon: <Stethoscope className="w-4 h-4" />,
      facilityLabel: 'Veterinary Clinic / Mobile Dispensary Name',
      tagline: 'Prescribe statutory treatments, calculate withdrawal days & audit CIAs',
    },
    admin: {
      title: 'Dairy Safety Inspector',
      icon: <Building2 className="w-4 h-4" />,
      facilityLabel: 'Chilling Plant / Processing Authority / DAHD Office',
      tagline: 'FSSAI MRL surveillance, district compliance audits & outbreak triage',
    },
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-900 font-sans">
      {/* ========================================================================= */}
      {/* LEFT SPLIT: TEAL GRADIENT BACKDROP & AGRICULTURAL VECTOR MOTIFS           */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-5/12 min-h-[360px] lg:min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 p-8 lg:p-12 flex flex-col justify-between overflow-hidden text-white select-none">
        {/* Background ambient radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-800/80 border border-teal-500/40 backdrop-blur-md flex items-center justify-center shadow-lg shadow-teal-950/40 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-7 h-7 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">FarmShield</span>
                <Badge variant="teal" size="sm">SIH25007</Badge>
              </div>
              <p className="text-xs text-teal-200 font-medium tracking-wide">
                DAHD • Central Food Safety Registration
              </p>
            </div>
          </Link>
        </div>

        {/* Centerpiece Hero Content */}
        <div className="relative z-10 my-8 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-900/80 border border-teal-700/60 backdrop-blur-md text-xs font-semibold text-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            Empowering 80M+ Dairy Farmers & Aquaculture Units
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Register for Statutory MRL & Antibiotic Governance.
          </h1>

          <p className="text-xs sm:text-sm text-teal-100/90 max-w-md leading-relaxed font-normal">
            Gain immediate access to automated withdrawal period counters, instant FSSAI safety passports, and dual-model ML disease risk triage.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-teal-100 font-medium">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
                ✓
              </div>
              <span>Compliant with FSSAI & National Action Plan on AMR (NAP-AMR)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-teal-100 font-medium">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
                ✓
              </div>
              <span>Digital ear-tag QR verification for milk chilling centers</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-teal-100 font-medium">
              <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
                ✓
              </div>
              <span>Instant offline-sync capabilities for remote rural districts</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 border-t border-teal-800/80 flex items-center justify-between text-[11px] text-teal-300/80">
          <span>Digital India • DAHD Portal</span>
          <span className="font-mono">Secure 256-Bit SSL</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SPLIT: REGISTRATION FORM WITH ZOD VALIDATION                       */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-7/12 bg-slate-900 lg:bg-white text-slate-900 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-10 overflow-y-auto">
        <div className="max-w-xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white lg:text-slate-900">
              Create Accredited Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 lg:text-slate-600">
              Complete the verification details below to activate your digital farm shield.
            </p>
          </div>

          {/* ===================================================================== */}
          {/* MULTI-ROLE TAB SWITCHER                                               */}
          {/* ===================================================================== */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 lg:text-slate-700 uppercase tracking-wider">
              Select Registration Role
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800 lg:bg-slate-100 rounded-xl border border-slate-700 lg:border-slate-200">
              {(['farmer', 'veterinarian', 'admin'] as RoleTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveRole(tab)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    activeRole === tab
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-400 lg:text-slate-600 hover:text-white lg:hover:text-slate-900'
                  }`}
                >
                  {roleConfigs[tab].icon}
                  <span className="truncate">
                    {tab === 'farmer' ? 'Farmer' : tab === 'veterinarian' ? 'Vet' : 'Inspector'}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-teal-400 lg:text-teal-700 font-medium">
              {roleConfigs[activeRole].tagline}
            </p>
          </div>

          {/* Fast 1-Click Evaluator Presets */}
          <div className="p-3 rounded-2xl bg-teal-950/40 lg:bg-teal-50/80 border border-teal-800/40 lg:border-teal-200/80 flex items-center justify-between">
            <span className="text-xs font-bold text-teal-300 lg:text-teal-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 lg:text-teal-600" />
              Testing Hackathon Demo?
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoPreset('farmer')}
                className="py-1 px-2.5 rounded-lg bg-teal-700 text-white text-[11px] font-bold hover:bg-teal-800 transition"
              >
                Instant Farmer Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoPreset('veterinarian')}
                className="py-1 px-2.5 rounded-lg bg-teal-700 text-white text-[11px] font-bold hover:bg-teal-800 transition"
              >
                Instant Vet Demo
              </button>
            </div>
          </div>

          {/* Alert Banners */}
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/60 lg:bg-rose-50 border border-rose-800/60 lg:border-rose-200 flex items-start gap-2.5 text-xs text-rose-300 lg:text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 lg:text-rose-600 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}
          {formSuccess && (
            <div className="p-3 rounded-xl bg-teal-950/60 lg:bg-teal-50 border border-teal-800/60 lg:border-teal-200 flex items-start gap-2.5 text-xs text-teal-300 lg:text-teal-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-400 lg:text-teal-600 mt-0.5" />
              <span>{formSuccess}</span>
            </div>
          )}

          {/* ===================================================================== */}
          {/* REACT HOOK FORM + ZOD VALIDATION                                      */}
          {/* ===================================================================== */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Full Name */}
              <Input
                {...register('name')}
                label="Full Legal Name"
                placeholder="Ramesh Patel"
                leftIcon={<UserIcon className="w-4 h-4" />}
                error={errors.name?.message}
              />

              {/* 10-Digit Mobile Phone */}
              <Input
                {...register('phone')}
                label="Mobile Phone (10 Digits)"
                type="tel"
                placeholder="9825012345"
                prefixText="+91"
                leftIcon={<Phone className="w-4 h-4" />}
                error={errors.phone?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Email Address */}
              <Input
                {...register('email')}
                label="Email Address"
                type="email"
                placeholder="name@farmshield.in"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
              />

              {/* Password */}
              <Input
                {...register('password')}
                label="Security Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
              />
            </div>

            {/* Farm / Facility Name */}
            <Input
              {...register('farmName')}
              label={roleConfigs[activeRole].facilityLabel}
              placeholder="e.g. Ludhiana Model Dairy Farm / District Chilling Plant"
              leftIcon={<Building2 className="w-4 h-4" />}
              error={errors.farmName?.message}
            />

            {/* State and District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5 font-sans">
                <label className="block text-xs font-bold text-slate-300 lg:text-slate-700">
                  State / Union Territory
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    {...register('state')}
                    className="w-full rounded-xl border border-slate-700 lg:border-slate-200 bg-slate-800 lg:bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-white lg:text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                  >
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state} className="bg-slate-900 lg:bg-white text-white lg:text-slate-900">
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.state?.message && (
                  <p className="text-xs font-medium text-rose-600">{errors.state.message}</p>
                )}
              </div>

              <Input
                {...register('district')}
                label="District"
                placeholder="Ludhiana"
                leftIcon={<MapPin className="w-4 h-4" />}
                error={errors.district?.message}
              />
            </div>

            {/* Role-Specific Conditional Fields */}
            {activeRole === 'veterinarian' && (
              <Input
                {...register('licenseNo')}
                label="Veterinary Council Registration No."
                placeholder="VET-PB-2024-891"
                leftIcon={<FileCheck className="w-4 h-4" />}
                helperText="Required for prescribing restricted Critically Important Antibiotics (CIAs)"
              />
            )}

            {activeRole === 'farmer' && (
              <div className="space-y-1.5 font-sans">
                <label className="block text-xs font-bold text-slate-300 lg:text-slate-700">
                  Primary Production Type
                </label>
                <select
                  {...register('farmType')}
                  className="w-full rounded-xl border border-slate-700 lg:border-slate-200 bg-slate-800 lg:bg-white px-3.5 py-2.5 text-sm font-medium text-white lg:text-slate-900 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15"
                >
                  <option value="Dairy Cattle">Dairy Cattle (Cow)</option>
                  <option value="Buffalo Herd">Buffalo Herd</option>
                  <option value="Mixed Dairy">Mixed Cattle & Buffalo</option>
                  <option value="Goat & Sheep">Goat & Sheep Unit</option>
                  <option value="Poultry Broiler">Poultry (Broiler)</option>
                  <option value="Poultry Layer">Poultry (Layer)</option>
                  <option value="Aquaculture Fishery">Aquaculture (Freshwater Fish & Shrimp)</option>
                </select>
              </div>
            )}

            {activeRole === 'admin' && (
              <Input
                {...register('licenseNo')}
                label="Official Designation / Employee ID"
                placeholder="DAHD-INSP-9081"
                leftIcon={<FileCheck className="w-4 h-4" />}
              />
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration as {roleConfigs[activeRole].title}
            </Button>
          </form>

          {/* Login Link */}
          <div className="pt-2 text-center text-xs text-slate-400 lg:text-slate-600">
            Already registered on FarmShield?{' '}
            <Link
              href="/login"
              className="font-bold text-teal-400 lg:text-teal-700 hover:underline"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      }
    >
      <RegisterFormContent />
    </Suspense>
  );
}
