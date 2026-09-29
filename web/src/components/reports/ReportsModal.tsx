'use client';

import React, { useState } from 'react';
import {
  FileText,
  ArrowLeft,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  Scale,
  FileSpreadsheet,
  AlertTriangle,
  QrCode,
  Share2,
} from 'lucide-react';
import {
  ReportExportService,
  AnimalPassportData,
  AmuAuditData,
  LabResidueLogItem,
} from '../../lib/services/report_export.service';
import { PageHeader } from '../ui/PageHeader';

interface ReportsProps {
  onBack?: () => void;
}

export const ReportsModal: React.FC<ReportsProps> = ({ onBack }) => {
  const [selectedReportType, setSelectedReportType] = useState<
    'animal_passport' | 'amu_audit' | 'lab_surveillance'
  >('animal_passport');

  // Animal Passport State
  const [selectedAnimalTag, setSelectedAnimalTag] = useState<string>('COW-101');
  const [passportData, setPassportData] = useState<AnimalPassportData>({
    tag_id: 'COW-101',
    species: 'cow',
    breed: 'Sahiwal Dairy Cattle',
    weight_kg: 420,
    dob: '2021-03-15',
    farm_name: 'Patil Dairy & Livestock Farm',
    district: 'Pune, Maharashtra',
    qr_token: 'SHW-9102-MRL-SECURE',
    is_withholding_active: false,
    withholding_hours_remaining: 0,
    fssai_compliance_score: 99.2,
    latest_lab_assay: 'Amoxicillin < 2.1 ug/kg (NDRI Certified)',
    verification_timestamp: new Date().toISOString(),
  });

  // Mock AMU Audit Data
  const amuAuditData: AmuAuditData = {
    farm_id: 'FARM-MH-PUNE-01',
    farm_name: 'Patil Dairy & Livestock Farm',
    period: 'Current 30-Day Cycle (Sept 2024)',
    total_biomass_treated_kg: 1850,
    cia_index: 14.2,
    compliance_rate: 98.4,
    total_treatments: 12,
    active_withdrawals: 1,
    herd_details: [
      { animal_code: 'COW-101', species: 'cow', treatments_count: 1, amu_mg: 4500, status: 'CLEARED' },
      { animal_code: 'BUF-201', species: 'buffalo', treatments_count: 2, amu_mg: 8000, status: 'CLEARED' },
      { animal_code: 'COW-102', species: 'cow', treatments_count: 1, amu_mg: 2000, status: 'WITHHOLDING' },
      { animal_code: 'BUF-202', species: 'buffalo', treatments_count: 1, amu_mg: 3500, status: 'CLEARED' },
      { animal_code: 'COW-103', species: 'cow', treatments_count: 0, amu_mg: 0, status: 'CLEARED' },
    ],
  };

  // Mock Lab Residue Data
  const labResidueData: LabResidueLogItem[] = [
    {
      id: 'LAB-001',
      animal_code: 'COW-101',
      product: 'milk',
      analyte: 'Amoxicillin Residue',
      result: 2.1,
      unit: 'ug/kg',
      mrl_threshold: 4.0,
      status: 'COMPLIANT',
      laboratory: 'NDRI Analytical Lab, Karnal',
      test_date: '2024-09-15',
    },
    {
      id: 'LAB-002',
      animal_code: 'BUF-201',
      product: 'milk',
      analyte: 'Oxytetracycline LA Residue',
      result: 145.0,
      unit: 'ug/kg',
      mrl_threshold: 100.0,
      status: 'NON-COMPLIANT',
      laboratory: 'State Veterinary Diagnostic Lab, Pune',
      test_date: '2024-09-12',
    },
    {
      id: 'LAB-003',
      animal_code: 'COW-101',
      product: 'milk',
      analyte: 'Somatic Cell Count (SCC)',
      result: 180000,
      unit: 'cells/ml',
      mrl_threshold: 400000,
      status: 'COMPLIANT',
      laboratory: 'District Veterinary Polyclinic Lab',
      test_date: '2024-09-10',
    },
    {
      id: 'LAB-004',
      animal_code: 'COW-102',
      product: 'milk',
      analyte: 'Ceftiofur Metabolites',
      result: 22.0,
      unit: 'ug/kg',
      mrl_threshold: 100.0,
      status: 'COMPLIANT',
      laboratory: 'FSSAI Referral Food Laboratory',
      test_date: '2024-09-08',
    },
  ];

  // Animal switch handler
  const handleAnimalSelect = (tag: string) => {
    setSelectedAnimalTag(tag);
    if (tag === 'COW-101') {
      setPassportData({
        tag_id: 'COW-101',
        species: 'cow',
        breed: 'Sahiwal Dairy Cattle',
        weight_kg: 420,
        dob: '2021-03-15',
        farm_name: 'Patil Dairy & Livestock Farm',
        district: 'Pune, Maharashtra',
        qr_token: 'SHW-9102-MRL-SECURE',
        is_withholding_active: false,
        withholding_hours_remaining: 0,
        fssai_compliance_score: 99.2,
        latest_lab_assay: 'Amoxicillin < 2.1 ug/kg (Compliant)',
        verification_timestamp: new Date().toISOString(),
      });
    } else if (tag === 'BUF-201') {
      setPassportData({
        tag_id: 'BUF-201',
        species: 'buffalo',
        breed: 'Murrah Milking Buffalo',
        weight_kg: 580,
        dob: '2020-07-22',
        farm_name: 'Patil Dairy & Livestock Farm',
        district: 'Pune, Maharashtra',
        qr_token: 'MRH-8841-MRL-SECURE',
        is_withholding_active: false,
        withholding_hours_remaining: 0,
        fssai_compliance_score: 97.8,
        latest_lab_assay: 'Oxytetracycline Cleared (7 Days Met)',
        verification_timestamp: new Date().toISOString(),
      });
    } else if (tag === 'COW-102') {
      setPassportData({
        tag_id: 'COW-102',
        species: 'cow',
        breed: 'Gir Indigenous Cattle',
        weight_kg: 395,
        dob: '2022-01-10',
        farm_name: 'Patil Dairy & Livestock Farm',
        district: 'Pune, Maharashtra',
        qr_token: 'GIR-4412-MRL-ACTIVE',
        is_withholding_active: true,
        withholding_hours_remaining: 36,
        fssai_compliance_score: 94.0,
        latest_lab_assay: 'Pending Post-Withdrawal Assay',
        verification_timestamp: new Date().toISOString(),
      });
    }
  };

  const handleExportPdf = () => {
    if (selectedReportType === 'animal_passport') {
      ReportExportService.generateAnimalPassportPdf(passportData);
    } else if (selectedReportType === 'amu_audit') {
      ReportExportService.generateAmuAuditPdf(amuAuditData);
    } else if (selectedReportType === 'lab_surveillance') {
      ReportExportService.generateLabResiduePdf(labResidueData);
    }
  };

  const handleExportCsv = () => {
    if (selectedReportType === 'animal_passport') {
      ReportExportService.exportToCsv(`Passport_${passportData.tag_id}`, [
        {
          'Tag ID': passportData.tag_id,
          'Species': passportData.species,
          'Breed': passportData.breed,
          'Weight (kg)': passportData.weight_kg,
          'Farm Name': passportData.farm_name,
          'District': passportData.district,
          'Withholding Active': passportData.is_withholding_active ? 'YES' : 'NO',
          'Withholding Hours Left': passportData.withholding_hours_remaining,
          'Compliance Score (%)': passportData.fssai_compliance_score,
          'Latest Lab Assay': passportData.latest_lab_assay,
          'QR Token': passportData.qr_token,
        },
      ]);
    } else if (selectedReportType === 'amu_audit') {
      const csvItems = amuAuditData.herd_details.map((h) => ({
        'Farm ID': amuAuditData.farm_id,
        'Farm Name': amuAuditData.farm_name,
        'Period': amuAuditData.period,
        'Biomass Treated (kg)': amuAuditData.total_biomass_treated_kg,
        'CIA Index (%)': amuAuditData.cia_index,
        'Animal Code': h.animal_code,
        'Species': h.species,
        'Treatments Count': h.treatments_count,
        'AMU (mg)': h.amu_mg,
        'Status': h.status,
      }));
      ReportExportService.exportToCsv('FarmShield_National_AMU_Audit', csvItems);
    } else if (selectedReportType === 'lab_surveillance') {
      const csvItems = labResidueData.map((l) => ({
        'Test ID': l.id,
        'Date': l.test_date,
        'Animal Code': l.animal_code,
        'Commodity': l.product.toUpperCase(),
        'Analyte': l.analyte,
        'Measured Result': l.result,
        'MRL Threshold': l.mrl_threshold,
        'Unit': l.unit,
        'Status': l.status,
        'Testing Laboratory': l.laboratory,
      }));
      ReportExportService.exportToCsv('FarmShield_MRL_Residue_Surveillance', csvItems);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <PageHeader
        onBack={onBack}
        badge="Official DAHD & FSSAI Framework"
        icon={<FileText className="w-5 h-5 text-teal-700" />}
        title="Statutory Regulatory Reports & Audit Certificates"
        description="Ministry of Fisheries, Animal Husbandry & Dairying • Official compliance dossiers and lab surveillance exports."
        actions={
          <div className="flex items-center gap-2 print:hidden flex-wrap">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-700" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-black text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Official PDF</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        }
      />

      {/* Report Type Selector Tabs */}
      <div className="flex flex-col sm:flex-row border border-slate-200/80 bg-white rounded-2xl p-1.5 gap-2 text-xs font-black shadow-xs print:hidden">
        <button
          onClick={() => setSelectedReportType('animal_passport')}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            selectedReportType === 'animal_passport'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          1. Animal Food Safety Passport (Individual)
        </button>

        <button
          onClick={() => setSelectedReportType('amu_audit')}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            selectedReportType === 'amu_audit'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          2. Farm AMU &amp; AMR Compliance Audit
        </button>

        <button
          onClick={() => setSelectedReportType('lab_surveillance')}
          className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
            selectedReportType === 'lab_surveillance'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          3. MRL Residue Laboratory Surveillance Log
        </button>
      </div>

      {/* Interactive Selectors for Passport */}
      {selectedReportType === 'animal_passport' && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-500 uppercase text-[11px]">Select Animal Profile:</span>
            {['COW-101', 'BUF-201', 'COW-102'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleAnimalSelect(tag)}
                className={`px-3 py-1.5 rounded-xl font-black transition cursor-pointer ${
                  selectedAnimalTag === tag
                    ? 'bg-teal-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {tag} {tag === 'COW-102' ? '(Withholding Active)' : '(Cleared)'}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-bold text-gray-500">
            QR Token: <code className="bg-gray-100 px-2 py-0.5 rounded text-teal-800">{passportData.qr_token}</code>
          </div>
        </div>
      )}

      {/* REPORT 1 PREVIEW: Animal Safety Passport */}
      {selectedReportType === 'animal_passport' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-gray-300 shadow-xl space-y-8 font-sans print:border-none print:shadow-none print:p-0">
          {/* Letterhead */}
          <div className="text-center space-y-2 border-b-2 border-teal-800/40 pb-6">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-teal-800 text-white flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
              </div>
            </div>
            <div className="text-sm font-black tracking-widest text-teal-800 uppercase">
              Government of India • Ministry of Fisheries, Animal Husbandry &amp; Dairying
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Official Animal Health &amp; Food Safety Passport
            </h2>
            <p className="text-xs text-gray-600 font-bold">
              Certified under National Residue Monitoring &amp; Livestock Traceability Network • FSSAI Regulated
            </p>
          </div>

          {/* Status Clearance Banner */}
          <div
            className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 ${
              !passportData.is_withholding_active
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {!passportData.is_withholding_active ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-700 shrink-0 animate-pulse" />
              )}
              <div>
                <h3 className="text-base font-black tracking-tight uppercase">
                  {!passportData.is_withholding_active
                    ? 'CLEARED FOR FOOD / MILK COLLECTION'
                    : 'STATUTORY WITHHOLDING MANDATE ACTIVE'}
                </h3>
                <p className="text-xs font-semibold">
                  {!passportData.is_withholding_active
                    ? 'Residue Compliant • Zero Active Withdrawal Embargo • Milk Collection Approved'
                    : `ZERO-SALE MANDATE: ${passportData.withholding_hours_remaining} Hours Remaining Before Clearance`}
                </p>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block">FSSAI Score</span>
              <span className="text-xl font-black font-mono">{passportData.fssai_compliance_score}%</span>
            </div>
          </div>

          {/* Animal Details Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
              1. Biometric Identification &amp; Facility Ownership
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div>
                <span className="text-gray-500 font-bold block">Tag ID:</span>
                <span className="text-sm font-black text-gray-900">{passportData.tag_id}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Commodity / Species:</span>
                <span className="text-sm font-black text-gray-900 uppercase">{passportData.species}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Breed:</span>
                <span className="text-sm font-black text-gray-900">{passportData.breed}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Body Weight:</span>
                <span className="text-sm font-black text-gray-900">{passportData.weight_kg} kg</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Facility Name:</span>
                <span className="text-sm font-black text-gray-900">{passportData.farm_name}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">District:</span>
                <span className="text-sm font-black text-gray-900">{passportData.district}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">Latest Assay:</span>
                <span className="text-sm font-black text-emerald-800">{passportData.latest_lab_assay}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold block">QR Verification Token:</span>
                <span className="text-xs font-mono font-bold text-teal-800">{passportData.qr_token}</span>
              </div>
            </div>
          </div>

          {/* Declarations */}
          <div className="space-y-2 text-xs text-gray-600">
            <h4 className="font-black uppercase tracking-wider text-gray-500">
              2. Traceability &amp; Safety Directives
            </h4>
            <p>• Bovine milk from this animal complies with Codex Alimentarius and FSSAI maximum residue standards.</p>
            <p>• Dairy cooperatives and chilling units must scan the digital QR stamp prior to bulk reception.</p>
            <p>• Under Section 21 of the Food Safety &amp; Standards Act, supply of contaminated milk carries legal penalties.</p>
          </div>

          {/* Seals & Signatures */}
          <div className="pt-8 border-t-2 border-gray-200 flex items-end justify-between text-xs">
            <div className="space-y-1">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-teal-800 flex items-center justify-center text-[10px] text-teal-800 font-black text-center p-2">
                OFFICIAL FSSAI VALIDATED
              </div>
              <p className="text-[10px] text-gray-400 font-mono">HASH: 98AB-24FF-DAHD</p>
            </div>

            <div className="text-right space-y-1">
              <div className="w-36 border-b border-gray-400 ml-auto mb-1" />
              <span className="font-black text-gray-900 block">Authorized Field Veterinarian</span>
              <span className="text-gray-500 text-[11px] block">BVSc &amp; AH • State Veterinary Service</span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2 PREVIEW: National AMU & AMR Compliance Audit */}
      {selectedReportType === 'amu_audit' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-gray-300 shadow-xl space-y-8 font-sans print:border-none print:shadow-none print:p-0">
          <div className="text-center space-y-2 border-b-2 border-blue-900/40 pb-6">
            <div className="text-sm font-black tracking-widest text-blue-900 uppercase">
              Ministry of Fisheries, Animal Husbandry &amp; Dairying
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              National Antimicrobial Usage (AMU) &amp; AMR Audit Certificate
            </h2>
            <p className="text-xs text-gray-600 font-bold">
              Entity: {amuAuditData.farm_name} ({amuAuditData.farm_id}) • {amuAuditData.period}
            </p>
          </div>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Biomass Treated</span>
              <span className="text-2xl font-black text-gray-900">{amuAuditData.total_biomass_treated_kg} kg</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">CIA Index</span>
              <span className="text-2xl font-black text-amber-600">{amuAuditData.cia_index}%</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Compliance Rate</span>
              <span className="text-2xl font-black text-emerald-700">{amuAuditData.compliance_rate}%</span>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Total Treatments</span>
              <span className="text-2xl font-black text-gray-900">{amuAuditData.total_treatments}</span>
            </div>
          </div>

          {/* Herd Treatment Ledger Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
              Herd Antimicrobial Treatment Ledger
            </h4>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-blue-900 text-white font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Animal Tag</th>
                    <th className="p-3">Species</th>
                    <th className="p-3">Courses (30d)</th>
                    <th className="p-3">Cumulative AMU (mg)</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {amuAuditData.herd_details.map((item) => (
                    <tr key={item.animal_code} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{item.animal_code}</td>
                      <td className="p-3 uppercase text-gray-600">{item.species}</td>
                      <td className="p-3 font-mono">{item.treatments_count}</td>
                      <td className="p-3 font-mono font-bold">{item.amu_mg} mg</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.status === 'CLEARED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <span>Issued under DAHD AMR Stewardship Guideline V2.4</span>
            <span className="font-mono">Cert ID: DAHD-AMU-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>
      )}

      {/* REPORT 3 PREVIEW: MRL Residue Surveillance Log */}
      {selectedReportType === 'lab_surveillance' && (
        <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-gray-300 shadow-xl space-y-8 font-sans print:border-none print:shadow-none print:p-0">
          <div className="text-center space-y-2 border-b-2 border-amber-600/40 pb-6">
            <div className="text-sm font-black tracking-widest text-amber-700 uppercase">
              Food Safety &amp; Standards Authority of India (FSSAI)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              National Residue Monitoring Program (NRMP) Laboratory Log
            </h2>
            <p className="text-xs text-gray-600 font-bold">
              Quantitative Analytical Registry • Total Logged Tests: {labResidueData.length}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
              Assay Test Records &amp; Statutory Limits
            </h4>
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-amber-600 text-white font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Animal Tag</th>
                    <th className="p-3">Commodity</th>
                    <th className="p-3">Analyte</th>
                    <th className="p-3">Result / MRL</th>
                    <th className="p-3">Laboratory</th>
                    <th className="p-3">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {labResidueData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-600">{item.test_date}</td>
                      <td className="p-3 font-bold text-gray-900">{item.animal_code}</td>
                      <td className="p-3 uppercase text-gray-600">{item.product}</td>
                      <td className="p-3 font-semibold text-gray-800">{item.analyte}</td>
                      <td className="p-3 font-mono">
                        <strong>{item.result}</strong> / {item.mrl_threshold} {item.unit}
                      </td>
                      <td className="p-3 text-gray-600">{item.laboratory}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            item.status === 'COMPLIANT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <span>NABL Accredited Testing Protocol</span>
            <span className="font-mono">Export Ref: FSSAI-NRMP-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
