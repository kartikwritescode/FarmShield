'use client';

/**
 * FarmShield Role-Based Access Control (RBAC) Module
 * Enforces role definitions, statutory permissions, and security guards
 * across the Ministry of Fisheries, Animal Husbandry & Dairying (DAHD) portal.
 */

import React from 'react';

export type UserRole = 'farmer' | 'veterinarian' | 'vet' | 'admin' | 'public';

export interface RolePermissions {
  canPrescribe: boolean;
  canVerifyLab: boolean;
  canSubmitSyndromic: boolean;
  canAssessRisk: boolean;
  canManageHerd: boolean;
  canExportReports: boolean;
  canAccessSurveillance: boolean;
  canManageMedicines: boolean;
  canAuditSystem: boolean;
}

/**
 * Normalizes role string variations (e.g. 'vet' -> 'veterinarian')
 */
export function normalizeRole(role?: string | null): UserRole {
  if (!role) return 'public';
  const clean = role.toLowerCase().trim();
  if (clean === 'admin' || clean === 'administrator') return 'admin';
  if (clean === 'veterinarian' || clean === 'vet' || clean === 'doctor') return 'veterinarian';
  if (clean === 'farmer' || clean === 'dairy_farmer' || clean === 'aquaculturist') return 'farmer';
  return 'public';
}

/**
 * Statutory RBAC Permissions Matrix
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canPrescribe: true,
    canVerifyLab: true,
    canSubmitSyndromic: true,
    canAssessRisk: true,
    canManageHerd: true,
    canExportReports: true,
    canAccessSurveillance: true,
    canManageMedicines: true,
    canAuditSystem: true,
  },
  veterinarian: {
    canPrescribe: true,
    canVerifyLab: true,
    canSubmitSyndromic: true,
    canAssessRisk: true,
    canManageHerd: true,
    canExportReports: true,
    canAccessSurveillance: true,
    canManageMedicines: true,
    canAuditSystem: false,
  },
  vet: {
    canPrescribe: true,
    canVerifyLab: true,
    canSubmitSyndromic: true,
    canAssessRisk: true,
    canManageHerd: true,
    canExportReports: true,
    canAccessSurveillance: true,
    canManageMedicines: true,
    canAuditSystem: false,
  },
  farmer: {
    canPrescribe: false, // Farmers cannot administer restricted CIAs without vet prescription
    canVerifyLab: false,
    canSubmitSyndromic: true,
    canAssessRisk: true,
    canManageHerd: true,
    canExportReports: true,
    canAccessSurveillance: true,
    canManageMedicines: false,
    canAuditSystem: false,
  },
  public: {
    canPrescribe: false,
    canVerifyLab: false,
    canSubmitSyndromic: false,
    canAssessRisk: false,
    canManageHerd: false,
    canExportReports: false,
    canAccessSurveillance: false,
    canManageMedicines: false,
    canAuditSystem: false,
  },
};

/**
 * Retrieve permissions object for a specific role
 */
export function getPermissionsForRole(role?: string | null): RolePermissions {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS[norm] || ROLE_PERMISSIONS.public;
}

/**
 * Checks if a role has a specific permission
 */
export function hasPermission(role: string | null | undefined, permission: keyof RolePermissions): boolean {
  const permissions = getPermissionsForRole(role);
  return Boolean(permissions[permission]);
}

/**
 * Checks if user's role matches one of the allowed roles
 */
export function hasRole(userRole: string | null | undefined, allowedRoles: UserRole[]): boolean {
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedAllowed = allowedRoles.map(normalizeRole);
  return normalizedAllowed.includes(normalizedUserRole);
}

/**
 * Validates route access against RBAC rules
 */
export function canAccessRoute(role: string | null | undefined, pathname: string): boolean {
  const norm = normalizeRole(role);

  // Admin has universal access
  if (norm === 'admin') return true;

  // Public routes
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/unauthorized') ||
    pathname.startsWith('/qr/') ||
    pathname.startsWith('/models-info')
  ) {
    return true;
  }

  // Veterinarian-restricted features
  if (pathname.startsWith('/treatments/new') || pathname.startsWith('/lab-results')) {
    return norm === 'veterinarian';
  }

  // Admin-only features (admin already returned true above)
  if (pathname.startsWith('/admin') || pathname.startsWith('/audit')) {
    return false;
  }

  // General authenticated routes (farmer, veterinarian)
  return norm !== 'public';
}

/**
 * Reusable RoleGuard Component for declarative UI authorization
 */
export interface RoleGuardProps {
  allowedRoles?: UserRole[];
  requiredPermission?: keyof RolePermissions;
  userRole?: string | null;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  requiredPermission,
  userRole,
  fallback = null,
  children,
}) => {
  const role = normalizeRole(userRole);

  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasRole(role, allowedRoles)) {
      return React.createElement(React.Fragment, null, fallback);
    }
  }

  if (requiredPermission) {
    if (!hasPermission(role, requiredPermission)) {
      return React.createElement(React.Fragment, null, fallback);
    }
  }

  return React.createElement(React.Fragment, null, children);
};

export default RoleGuard;
