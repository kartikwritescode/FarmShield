'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { Button } from '../../components/ui/Button';

function UnauthorizedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, switchRole } = useAuth();

  const reason = searchParams.get('reason');
  const requestedRole = searchParams.get('requestedRole') || 'requested';
  const actualRole = searchParams.get('actualRole') || user?.role || 'authorized';
  
  const isGovPending = reason === 'government_pending' || user?.status === 'pending';
  const isWorkspaceUnauthorized = reason === 'workspace_unauthorized';
  const isExpired = reason === 'expired';

  let title = "Access Restricted";
  let subtitle = "HTTP 403 • Role Authorization Required";
  let message = "You don't have access to this workspace.";

  if (isGovPending) {
    title = "Authorization Pending";
    subtitle = "Government Clearance Required";
    message = "Your government account is awaiting approval.";
  } else if (isWorkspaceUnauthorized) {
    title = "Workspace Access Denied";
    subtitle = "Role Mismatch Clearance Error";
    message = "Your account is not authorized for this workspace.";
  } else if (isExpired) {
    title = "Session Expired";
    subtitle = "Authentication Timeout";
    message = "Your session has expired. Please sign in again.";
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl shadow-slate-200/50 space-y-6">
        <div className={`w-20 h-20 rounded-3xl ${isGovPending ? 'bg-amber-100 text-amber-700' : isWorkspaceUnauthorized ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'} flex items-center justify-center text-4xl mx-auto shadow-inner`}>
          {isGovPending ? '🏛️' : isWorkspaceUnauthorized ? '🚫' : '⛔'}
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs font-semibold text-teal-800 uppercase tracking-widest mt-1">
            {subtitle}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2">
          <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            {message}
          </p>
          {isWorkspaceUnauthorized && (
            <p className="text-xs text-slate-600 leading-relaxed">
              Your account is officially registered as <strong className="uppercase text-slate-900">{actualRole}</strong> and cannot access the <strong className="uppercase text-slate-900">{requestedRole}</strong> portal.
            </p>
          )}
          {isGovPending && (
            <p className="text-xs text-slate-600 leading-relaxed">
              Your Google login succeeded, but access to the Government / Admin portal is pending administrative clearance.
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 text-left space-y-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Go to your authorized portal:
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                switchRole('farmer');
                router.push('/farmer/dashboard');
              }}
              className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-teal-800 text-white hover:bg-teal-900 transition-colors text-center shadow-2xs"
            >
              Farmer Portal
            </button>
            <button
              onClick={() => {
                switchRole('vet');
                router.push('/vet/dashboard');
              }}
              className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition-colors text-center shadow-2xs"
            >
              Vet Portal
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button variant="outline" fullWidth onClick={() => router.push('/login')}>
            Sign in with Another Account
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <UnauthorizedContent />
    </Suspense>
  );
}
