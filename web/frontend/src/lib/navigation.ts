import React from 'react';
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
} from 'lucide-react';
import { UserRole } from './rbac';

export interface NavigationItem {
  id: string;
  name: string;
  nameHi?: string;
  href: string;
  iconName: string;
  badge?: string;
  badgeColor?: 'green' | 'amber' | 'blue' | 'red';
  description?: string;
}

export interface NavigationSection {
  title: string;
  titleHi?: string;
  items: NavigationItem[];
}

export interface RoleNavigation {
  role: UserRole;
  roleTitle: string;
  roleSubtitle: string;
  sections: NavigationSection[];
}

/**
 * 1. FARMER NAVIGATION SPECIFICATION
 * Focused on farm-level operations: Livestock census, animal health, treatments,
 * statutory withdrawal tickers, QR passport scanning, and milk safety checks.
 */
export const farmerNavigation: RoleNavigation = {
  role: 'farmer',
  roleTitle: 'Farmer Workspace',
  roleSubtitle: 'Livestock Health & MRL Safety',
  sections: [
    {
      title: 'Operations',
      titleHi: 'दैनिक कार्य',
      items: [
        {
          id: 'farmer-dashboard',
          name: 'Farm Dashboard',
          nameHi: 'फ़ार्म डैशबोर्ड',
          href: '/dashboard',
          iconName: 'LayoutDashboard',
        },
        {
          id: 'farmer-livestock',
          name: 'Livestock Directory',
          nameHi: 'पशुधन सूची',
          href: '/livestock',
          badge: 'Herd',
          badgeColor: 'blue',
          iconName: 'FolderHeart',
        },
        {
          id: 'farmer-health',
          name: 'Herd Health Status',
          nameHi: 'झुंड स्वास्थ्य',
          href: '/herd-health',
          iconName: 'Activity',
        },
        {
          id: 'farmer-treatments',
          name: 'Treatments & Records',
          nameHi: 'उपचार रिकॉर्ड',
          href: '/treatments/new',
          iconName: 'Syringe',
        },
        {
          id: 'farmer-withdrawals',
          name: 'Withdrawal Calendar',
          nameHi: 'निकासी कैलेंडर',
          href: '/calendar',
          badge: 'MRL Guard',
          badgeColor: 'green',
          iconName: 'Calendar',
        },
      ],
    },
    {
      title: 'Safety & Tools',
      titleHi: 'सुरक्षा एवं उपकरण',
      items: [
        {
          id: 'farmer-alerts',
          name: 'Syndromic Alerts',
          nameHi: 'लक्षण चेतावनी',
          href: '/syndromic-report',
          badge: 'Report',
          badgeColor: 'amber',
          iconName: 'ShieldAlert',
        },
        {
          id: 'farmer-scan',
          name: 'Scan Passport QR',
          nameHi: 'पासपोर्ट स्कैन',
          href: '/scan',
          iconName: 'QrCode',
        },
        {
          id: 'farmer-medicines',
          name: 'Approved Medicines',
          nameHi: 'स्वीकृत दवाएं',
          href: '/medicines',
          iconName: 'Pill',
        },
        {
          id: 'farmer-reports',
          name: 'Certificates & Exports',
          nameHi: 'प्रमाणपत्र',
          href: '/reports',
          iconName: 'FileText',
        },
      ],
    },
  ],
};

/**
 * 2. VETERINARIAN NAVIGATION SPECIFICATION
 * Focused on clinical decision support: Herd surveillance, antimicrobial stewardship,
 * syndromic triage rules, lab residue testing, and dual AI risk evaluation.
 */
export const vetNavigation: RoleNavigation = {
  role: 'veterinarian',
  roleTitle: 'Veterinary Clinical Intelligence',
  roleSubtitle: 'Clinical Triage & AMU Stewardship',
  sections: [
    {
      title: 'Clinical Practice',
      titleHi: 'चिकित्सीय अभ्यास',
      items: [
        {
          id: 'vet-dashboard',
          name: 'Clinical Dashboard',
          nameHi: 'क्लिनिकल डैशबोर्ड',
          href: '/dashboard',
          iconName: 'Stethoscope',
        },
        {
          id: 'vet-herd-health',
          name: 'Herd Patients & Quarantine',
          nameHi: 'रोगी पशु एवं संगरोध',
          href: '/herd-health',
          badge: 'Active Cases',
          badgeColor: 'amber',
          iconName: 'Activity',
        },
        {
          id: 'vet-prescribe',
          name: 'Prescribe Treatment',
          nameHi: 'दवा परामर्श',
          href: '/treatments/new',
          iconName: 'Syringe',
        },
        {
          id: 'vet-triage',
          name: 'Syndromic Triage',
          nameHi: 'सिंड्रोमिक ट्राइएज',
          href: '/surveillance/triage',
          badge: 'WOAH Rules',
          badgeColor: 'red',
          iconName: 'ShieldAlert',
        },
      ],
    },
    {
      title: 'Diagnostics & Risk',
      titleHi: 'निदान एवं जोखिम',
      items: [
        {
          id: 'vet-lab-results',
          name: 'Lab Residue Assays',
          nameHi: 'प्रयोगशाला परीक्षण',
          href: '/lab-results',
          iconName: 'FlaskConical',
        },
        {
          id: 'vet-medicines',
          name: 'MRL Formulary & Drugs',
          nameHi: 'औषधि निर्देशिका',
          href: '/medicines',
          iconName: 'Pill',
        },
        {
          id: 'vet-calendar',
          name: 'Withdrawal Clearance',
          nameHi: 'निकासी निगरानी',
          href: '/calendar',
          iconName: 'Calendar',
        },
        {
          id: 'vet-ai-risk',
          name: 'AI Overuse & MRL Risk',
          nameHi: 'एआई जोखिम विश्लेषण',
          href: '/analytics/ml-risk',
          badge: 'Dual ML',
          badgeColor: 'blue',
          iconName: 'Cpu',
        },
        {
          id: 'vet-models-info',
          name: 'Model Benchmarks',
          nameHi: 'मॉडल मानक',
          href: '/analytics/models-info',
          iconName: 'BarChart3',
        },
      ],
    },
    {
      title: 'Regional Surveillance',
      titleHi: 'क्षेत्रीय निगरानी',
      items: [
        {
          id: 'vet-gis-map',
          name: 'Outbreak GIS Map',
          nameHi: 'प्रकोप जीआईएस मानचित्र',
          href: '/surveillance/map',
          iconName: 'MapPin',
        },
        {
          id: 'vet-reports',
          name: 'Statutory Reports',
          nameHi: 'वैधानिक रिपोर्ट',
          href: '/reports',
          iconName: 'FileText',
        },
      ],
    },
  ],
};

/**
 * 3. ADMIN / GOVERNMENT NAVIGATION SPECIFICATION
 * Focused on national/state disease surveillance, geospatial epidemiology,
 * statutory AMU/MRL compliance auditing, regulatory rules, and system oversight.
 */
export const adminNavigation: RoleNavigation = {
  role: 'admin',
  roleTitle: 'National Livestock Authority',
  roleSubtitle: 'DAHD & FSSAI Biosecurity Console',
  sections: [
    {
      title: 'National Surveillance',
      titleHi: 'राष्ट्रीय निगरानी',
      items: [
        {
          id: 'admin-dashboard',
          name: 'National Overview',
          nameHi: 'राष्ट्रीय अवलोकन',
          href: '/dashboard',
          iconName: 'Building2',
        },
        {
          id: 'admin-surveillance',
          name: 'Biosecurity Surveillance',
          nameHi: 'जैव सुरक्षा निगरानी',
          href: '/surveillance',
          badge: 'National',
          badgeColor: 'blue',
          iconName: 'Eye',
        },
        {
          id: 'admin-gis-map',
          name: 'GIS Outbreak Hotspots',
          nameHi: 'जीआईएस प्रकोप मानचित्र',
          href: '/surveillance/map',
          badge: 'Live',
          badgeColor: 'red',
          iconName: 'MapPin',
        },
        {
          id: 'admin-triage-queue',
          name: 'Syndromic Triage Queue',
          nameHi: 'ट्राइएज कतार',
          href: '/surveillance/triage-queue',
          iconName: 'ClipboardList',
        },
        {
          id: 'admin-vaccination',
          name: 'Vaccination Coverage',
          nameHi: 'टीकाकरण कवरेज',
          href: '/surveillance/vaccination-coverage',
          iconName: 'Activity',
        },
      ],
    },
    {
      title: 'Compliance & Audits',
      titleHi: 'अनुपालन एवं ऑडिट',
      items: [
        {
          id: 'admin-lab-results',
          name: 'MRL Residue Laboratory Log',
          nameHi: 'एमआरएल अवशेष रिकॉर्ड',
          href: '/lab-results',
          badge: 'NABL',
          badgeColor: 'green',
          iconName: 'FlaskConical',
        },
        {
          id: 'admin-medicines',
          name: 'Regulatory Formulary Rules',
          nameHi: 'नियामक औषधि नियम',
          href: '/medicines',
          iconName: 'Pill',
        },
        {
          id: 'admin-reports',
          name: 'Statutory Reports & Audit',
          nameHi: 'सरकारी रिपोर्ट व ऑडिट',
          href: '/reports',
          iconName: 'FileText',
        },
        {
          id: 'admin-advisories',
          name: 'Ministry Advisories',
          nameHi: 'मंत्रालय परामर्श',
          href: '/surveillance/advisories',
          iconName: 'ShieldAlert',
        },
      ],
    },
    {
      title: 'AI Intelligence & Models',
      titleHi: 'एआई एवं मॉडल',
      items: [
        {
          id: 'admin-ml-risk',
          name: 'AMU Overuse Risk Engine',
          nameHi: 'एआई जोखिम इंजन',
          href: '/analytics/ml-risk',
          iconName: 'Cpu',
        },
        {
          id: 'admin-models-info',
          name: 'Model Transparency & Benchmarks',
          nameHi: 'मॉडल बेंचमार्क',
          href: '/analytics/models-info',
          iconName: 'BarChart3',
        },
      ],
    },
  ],
};

/**
 * Returns role navigation configuration based on authenticated role.
 */
export function getNavigationForRole(rawRole?: string | null): RoleNavigation {
  const role = (rawRole || '').toLowerCase().trim();
  if (role === 'admin' || role === 'authority' || role === 'government') {
    return adminNavigation;
  }
  if (role === 'vet' || role === 'veterinarian' || role === 'doctor') {
    return vetNavigation;
  }
  return farmerNavigation;
}
