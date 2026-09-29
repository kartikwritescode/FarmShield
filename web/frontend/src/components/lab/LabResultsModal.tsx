'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FlaskConical,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Upload,
  FileCheck,
  FileText,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  RefreshCw,
  Building,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { api } from '../../lib/api';
import { CloudinaryService } from '../../lib/services/cloudinary.service';
import { ReportExportService, LabResidueLogItem } from '../../lib/services/report_export.service';
import { PageHeader } from '../ui/PageHeader';

export interface LabResultRecord {
  id: string;
  animal_id: string;
  animal_code?: string;
  product: 'milk' | 'meat' | 'feed' | 'aquaculture_water';
  analyte: string;
  result: number;
  unit: string;
  test_date: string;
  laboratory: string;
  mrl_threshold: number;
  status: 'COMPLIANT' | 'NON-COMPLIANT';
  lab_report_pdf_url?: string;
  created_at?: string;
}

const INITIAL_DEMO_RESULTS: LabResultRecord[] = [
  {
    id: 'lab-001',
    animal_id: 'anim-001',
    animal_code: 'IN-PB-2024-9102 (Sahiwal)',
    product: 'milk',
    analyte: 'Amoxicillin Residue (Beta-lactam)',
    result: 2.1,
    unit: 'ug/kg',
    test_date: '2024-09-15',
    laboratory: 'National Dairy Research Institute (NDRI) Analytical Lab, Karnal',
    mrl_threshold: 4.0,
    status: 'COMPLIANT',
  },
  {
    id: 'lab-002',
    animal_id: 'anim-002',
    animal_code: 'IN-PB-2024-8841 (Murrah)',
    product: 'milk',
    analyte: 'Oxytetracycline LA Residue',
    result: 145.0,
    unit: 'ug/kg',
    test_date: '2024-09-12',
    laboratory: 'State Veterinary Diagnostic & Toxicology Lab, Pune',
    mrl_threshold: 100.0,
    status: 'NON-COMPLIANT',
  },
  {
    id: 'lab-003',
    animal_id: 'anim-001',
    animal_code: 'IN-PB-2024-9102 (Sahiwal)',
    product: 'milk',
    analyte: 'Somatic Cell Count (SCC)',
    result: 180000,
    unit: 'cells/ml',
    test_date: '2024-09-10',
    laboratory: 'District Veterinary Polyclinic Lab',
    mrl_threshold: 400000,
    status: 'COMPLIANT',
  },
  {
    id: 'lab-004',
    animal_id: 'anim-004',
    animal_code: 'AQUA-POND-01 (Rohu)',
    product: 'aquaculture_water',
    analyte: 'Enrofloxacin Aqueous Residue',
    result: 12.4,
    unit: 'ug/kg',
    test_date: '2024-09-08',
    laboratory: 'Central Institute of Fisheries Education (CIFE) Assay Cell',
    mrl_threshold: 50.0,
    status: 'COMPLIANT',
  },
  {
    id: 'lab-005',
    animal_id: 'anim-003',
    animal_code: 'IN-PB-2024-4412 (Gir)',
    product: 'milk',
    analyte: 'Sulfadiazine Residues (Total Sulfas)',
    result: 112.5,
    unit: 'ug/kg',
    test_date: '2024-09-05',
    laboratory: 'FSSAI Referral Food Laboratory, Ghaziabad',
    mrl_threshold: 100.0,
    status: 'NON-COMPLIANT',
  },
];

interface LabResultsProps {
  onBack?: () => void;
}

export const LabResultsModal: React.FC<LabResultsProps> = ({ onBack }) => {
  const [results, setResults] = useState<LabResultRecord[]>(INITIAL_DEMO_RESULTS);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Filter States
  const [productFilter, setProductFilter] = useState<string>('all');
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form Fields
  const [animalCode, setAnimalCode] = useState<string>('IN-PB-2024-9102');
  const [product, setProduct] = useState<'milk' | 'meat' | 'feed' | 'aquaculture_water'>('milk');
  const [analyte, setAnalyte] = useState<string>('Amoxicillin Residue');
  const [resultValue, setResultValue] = useState<number>(2.4);
  const [mrlThreshold, setMrlThreshold] = useState<number>(4.0);
  const [unit, setUnit] = useState<string>('ug/kg');
  const [testDate, setTestDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [laboratory, setLaboratory] = useState<string>(
    'National Dairy Research Institute (NDRI) Analytical Lab'
  );

  // Certificate File Upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch initial results from Backend API
  const fetchLabResults = useCallback(async () => {
    try {
      const res = await api.get<any>('lab-results');
      const list = Array.isArray(res) ? res : res?.data;
      if (list && list.length > 0) {
        setResults(list);
      }
    } catch {
      // Keep demo list
    }
  }, []);

  useEffect(() => {
    fetchLabResults();
  }, [fetchLabResults]);

  // Real-Time Compliance Calculation
  const isCompliant = resultValue <= mrlThreshold;
  const percentageVariance =
    mrlThreshold > 0 ? ((resultValue - mrlThreshold) / mrlThreshold) * 100 : 0;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analyte.trim() || !laboratory.trim()) {
      setErrorMsg('Analyte parameter and Laboratory name are mandatory.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      let certificateUrl: string | undefined = undefined;
      if (selectedFile) {
        try {
          const uploadRes = await CloudinaryService.uploadImage(selectedFile, 'lab_results');
          certificateUrl = uploadRes.secure_url;
        } catch {
          certificateUrl = filePreview || undefined;
        }
      }

      const calculatedStatus = isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT';
      const payload: Omit<LabResultRecord, 'id'> = {
        animal_id: animalCode.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        animal_code: animalCode.trim(),
        product,
        analyte: analyte.trim(),
        result: resultValue,
        unit,
        test_date: testDate,
        laboratory: laboratory.trim(),
        mrl_threshold: mrlThreshold,
        status: calculatedStatus,
        lab_report_pdf_url: certificateUrl,
      };

      try {
        const created = await api.post<any>('lab-results', payload);
        const record = created?.data || created;
        if (record && record.id) {
          setResults((prev) => [record, ...prev]);
        } else {
          setResults((prev) => [{ id: `lab-${Date.now()}`, ...payload }, ...prev]);
        }
      } catch {
        setResults((prev) => [{ id: `lab-${Date.now()}`, ...payload }, ...prev]);
      }

      // Reset form
      setShowAddForm(false);
      setSelectedFile(null);
      setFilePreview(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit assay certificate.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredResults = results.filter((item) => {
    const matchesProduct = productFilter === 'all' || item.product === productFilter;
    const matchesCompliance =
      complianceFilter === 'all' ||
      (complianceFilter === 'compliant' && item.status === 'COMPLIANT') ||
      (complianceFilter === 'violating' && item.status === 'NON-COMPLIANT');
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.analyte.toLowerCase().includes(q) ||
      item.laboratory.toLowerCase().includes(q) ||
      (item.animal_code && item.animal_code.toLowerCase().includes(q));
    return matchesProduct && matchesCompliance && matchesSearch;
  });

  // Export CSV
  const handleExportCsv = () => {
    const csvData = filteredResults.map((item) => ({
      'Certificate ID': item.id,
      'Test Date': item.test_date,
      'Animal ID / Tag': item.animal_code || item.animal_id,
      'Sample Commodity': item.product.toUpperCase(),
      'Analyte Parameter': item.analyte,
      'Measured Result': item.result,
      'MRL Threshold': item.mrl_threshold,
      'Unit': item.unit,
      'Compliance Status': item.status,
      'Testing Laboratory': item.laboratory,
    }));
    ReportExportService.exportToCsv('FarmShield_MRL_Lab_Residue_Registry', csvData);
  };

  // Export PDF Log
  const handleExportPdf = () => {
    const pdfItems: LabResidueLogItem[] = filteredResults.map((r) => ({
      id: r.id,
      animal_code: r.animal_code || r.animal_id,
      product: r.product,
      analyte: r.analyte,
      result: r.result,
      unit: r.unit,
      mrl_threshold: r.mrl_threshold,
      status: r.status,
      laboratory: r.laboratory,
      test_date: r.test_date,
    }));
    ReportExportService.generateLabResiduePdf(pdfItems);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <PageHeader
        onBack={onBack}
        badge="NABL Audited Diagnostic Registry"
        icon={<FlaskConical className="w-5 h-5 text-teal-700" />}
        title="Laboratory Residue & Somatic Diagnostic Registry"
        description="Quantitative HPLC / LC-MS Residue Testing • FSSAI Food Safety Compliance Verification."
        actions={
          <>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-700" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-700" />
              <span>Export PDF Log</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-black text-xs shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showAddForm ? 'Cancel Entry' : 'Upload Lab Result'}</span>
            </button>
          </>
        }
      />

      {/* Add New Lab Assay Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-7 bg-white rounded-3xl border-2 border-teal-600/30 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal-700" />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                Submit Quantitative Laboratory Assay Certificate
              </h2>
            </div>
            <span className="text-[11px] font-bold text-gray-400">FSSAI / NABL Accreditation Log</span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block mb-1 font-bold text-gray-700">Animal Tag ID / Batch Code *</label>
              <input
                type="text"
                required
                value={animalCode}
                onChange={(e) => setAnimalCode(e.target.value)}
                placeholder="e.g. IN-PB-2024-9102"
                className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 bg-gray-50/50 outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-gray-700">Sample Commodity *</label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 bg-gray-50/50 outline-none focus:ring-2 focus:ring-teal-700"
              >
                <option value="milk">🥛 Raw Dairy Milk (Bovine)</option>
                <option value="meat">🥩 Meat / Muscle Tissue (Small Ruminant)</option>
                <option value="aquaculture_water">🐟 Aquaculture Tank / Pond Water</option>
                <option value="feed">🌾 Compound Cattle Feed</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-bold text-gray-700">Analyte / Chemical Molecule *</label>
              <input
                type="text"
                required
                value={analyte}
                onChange={(e) => setAnalyte(e.target.value)}
                placeholder="e.g. Oxytetracycline Residue"
                className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 bg-gray-50/50 outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-gray-700">Measured Assay Result Value *</label>
              <input
                type="number"
                step="0.01"
                required
                value={resultValue}
                onChange={(e) => setResultValue(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-black text-gray-900 bg-gray-50/50 outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-gray-700">Statutory MRL Limit Threshold *</label>
              <input
                type="number"
                step="0.01"
                required
                value={mrlThreshold}
                onChange={(e) => setMrlThreshold(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-black text-gray-900 bg-gray-50/50 outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-gray-700">Measurement Unit *</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 bg-gray-50/50 outline-none focus:ring-2 focus:ring-teal-700"
              >
                <option value="ug/kg">µg/kg (ppb - Micrograms per kg)</option>
                <option value="ppb">ppb (Parts per Billion)</option>
                <option value="mg/kg">mg/kg (ppm)</option>
                <option value="cells/ml">cells/ml (Somatic Cell Count)</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-bold text-gray-700">Date of Assay Analysis *</label>
              <input
                type="date"
                required
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 bg-gray-50/50 outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-1 font-bold text-gray-700">Accredited Testing Laboratory *</label>
              <input
                type="text"
                required
                value={laboratory}
                onChange={(e) => setLaboratory(e.target.value)}
                placeholder="e.g. National Dairy Research Institute (NDRI) Analytical Lab"
                className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 bg-gray-50/50 outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>

          {/* Real-Time Client-Side Compliance Evaluator Card */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              isCompliant
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                : 'bg-red-50/80 border-red-400 text-red-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {isCompliant ? (
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider">
                    Client-Side Compliance Evaluation:
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      isCompliant ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
                    }`}
                  >
                    {isCompliant
                      ? '✓ COMPLIANT (Safe for consumption)'
                      : `🔴 NON-COMPLIANT (Violates FSSAI limit by +${percentageVariance.toFixed(1)}%)`}
                  </span>
                </div>
                <p className="text-xs font-medium">
                  {isCompliant
                    ? `Assay result of ${resultValue} ${unit} is below the statutory maximum residue limit (≤ ${mrlThreshold} ${unit}). Sample is cleared for commercial dairy/food collection.`
                    : `Assay result of ${resultValue} ${unit} exceeds statutory FSSAI threshold (≤ ${mrlThreshold} ${unit}). Immediate milk/meat withholding embargo must be enforced.`}
                </p>
              </div>
            </div>
          </div>

          {/* Drag-and-Drop Certificate Uploader */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-gray-700">
              Lab Certificate Attachment (.PDF, .PNG, .JPG)
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`p-5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition cursor-pointer ${
                isDragging
                  ? 'border-teal-600 bg-teal-50/50'
                  : 'border-gray-300 hover:border-teal-500 bg-gray-50/50'
              }`}
            >
              <input
                type="file"
                id="cert-file"
                accept=".pdf,image/png,image/jpeg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="cert-file" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-teal-700 mb-2" />
                <span className="text-xs font-bold text-gray-800">
                  {selectedFile ? selectedFile.name : 'Drag and drop lab report certificate here, or browse'}
                </span>
                <span className="text-[11px] text-gray-500 mt-1">
                  Upload signed HPLC / spectroscopy diagnostic certificate (Max 10MB)
                </span>
              </label>

              {filePreview && (
                <div className="mt-3 flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200 text-xs text-gray-700">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold">File Attached: {selectedFile?.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FileCheck className="w-4 h-4" />
              )}
              <span>Commit Certificate to Registry</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by analyte molecule, laboratory, or animal tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 bg-gray-50/50 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-teal-700 outline-none shadow-xs"
            />
          </div>

          {/* Compliance Status Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Status:</span>
            {[
              { id: 'all', label: 'All Assays' },
              { id: 'compliant', label: '✓ Compliant Only' },
              { id: 'violating', label: '⚠️ Violating Only' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setComplianceFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition cursor-pointer ${
                  complianceFilter === st.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Commodity / Product Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Sample:</span>
          {[
            { id: 'all', label: 'All Commodities' },
            { id: 'milk', label: '🥛 Raw Milk' },
            { id: 'meat', label: '🥩 Muscle/Meat' },
            { id: 'aquaculture_water', label: '🐟 Aquaculture' },
            { id: 'feed', label: '🌾 Feed' },
          ].map((prod) => (
            <button
              key={prod.id}
              onClick={() => setProductFilter(prod.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition cursor-pointer ${
                productFilter === prod.id
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {prod.label}
            </button>
          ))}
        </div>
      </div>

      {/* Historical Assays Table / Cards */}
      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center space-y-2">
            <FlaskConical className="w-8 h-8 text-gray-300 mx-auto" />
            <h3 className="text-sm font-black text-gray-900">No Laboratory Assays Found</h3>
            <p className="text-xs text-gray-500 font-medium">
              No analytical assays matched your filter criteria.
            </p>
          </div>
        ) : (
          filteredResults.map((res) => {
            const compliant = res.status === 'COMPLIANT';
            const variance =
              res.mrl_threshold > 0
                ? ((res.result - res.mrl_threshold) / res.mrl_threshold) * 100
                : 0;

            return (
              <div
                key={res.id}
                className={`p-5 bg-white rounded-3xl border-2 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md ${
                  compliant ? 'border-emerald-200' : 'border-red-300 bg-red-50/15'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {res.product.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        compliant
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                      }`}
                    >
                      {compliant
                        ? '✓ Compliant with MRL'
                        : `⚠️ Violates MRL (+${variance.toFixed(1)}%)`}
                    </span>
                    {res.animal_code && (
                      <span className="text-xs font-bold text-gray-600">
                        Tag: <strong className="text-gray-900">{res.animal_code}</strong>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-gray-900">{res.analyte}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-gray-400" />
                      {res.laboratory}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {res.test_date}
                    </span>
                  </div>
                </div>

                {/* Right Numerical Values & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 gap-1">
                  <div className="text-right">
                    <div className="text-xl font-black font-mono text-gray-900">
                      {res.result.toLocaleString()}{' '}
                      <span className="text-xs font-bold text-gray-500">{res.unit}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-semibold">
                      Statutory MRL: ≤ {res.mrl_threshold.toLocaleString()} {res.unit}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {res.lab_report_pdf_url && (
                      <a
                        href={res.lab_report_pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Certificate</span>
                      </a>
                    )}
                    <button
                      onClick={() =>
                        ReportExportService.exportToCsv(`Assay_${res.id}`, [
                          {
                            'ID': res.id,
                            'Animal': res.animal_code || res.animal_id,
                            'Product': res.product,
                            'Analyte': res.analyte,
                            'Result': res.result,
                            'MRL': res.mrl_threshold,
                            'Unit': res.unit,
                            'Status': res.status,
                            'Laboratory': res.laboratory,
                            'Date': res.test_date,
                          },
                        ])
                      }
                      className="p-1 text-gray-400 hover:text-gray-700 transition"
                      title="Download record CSV"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
