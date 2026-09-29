'use client';

/**
 * FarmShield Role-Based Access Control (RBAC) Module
 * Enforces role definitions, statutory permissions, and security guards
 * across the Ministry of Fisheries, Animal Husbandry & Dairying (DAHD) portal.
 */

import React from 'react';

export type UserRole = 'farmer' | 'vet' | 'government' | 'public';

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
 * Normalizes role string variations to standardized values: 'farmer' | 'vet' | 'government'
 */
export function normalizeRole(role?: string | null): UserRole {
  if (!role) return 'public';
  const clean = role.toLowerCase().trim();
  if (clean === 'government' || clean === 'admin' || clean === 'authority' || clean === 'administrator' || clean === 'govt') return 'government';
  if (clean === 'vet' || clean === 'veterinarian' || clean === 'doctor') return 'vet';
  if (clean === 'farmer' || clean === 'dairy_farmer' || clean === 'aquaculturist') return 'farmer';
  return 'public';
}

/**
 * Statutory RBAC Permissions Matrix
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  government: {
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

  // Government has universal access
  if (norm === 'government') return true;

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
  if (pathname.startsWith('/treatments/new') || pathname.startsWith('/lab-results') || pathname.startsWith('/vet')) {
    return norm === 'vet';
  }

  // Admin/Government-only features (since government returned early on line 119, non-government cannot access)
  if (pathname.startsWith('/admin') || pathname.startsWith('/audit')) {
    return false;
  }

  // General authenticated routes (farmer, vet, government)
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
