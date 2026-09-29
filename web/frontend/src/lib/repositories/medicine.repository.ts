import { createClient } from '../supabase/client';
import { Medicine, RegulatoryRule } from '../../types/database';
import { api } from '../api';

export interface MedicineWithRules extends Medicine {
  regulatory_rules?: RegulatoryRule[];
  mrl?: string;
  withdrawal_days_milk?: number;
  withdrawal_days_meat?: number;
}

export const SEED_MEDICINES: MedicineWithRules[] = [
  {
    id: 'med-001',
    name: 'Amoxil-Vet 15% LA',
    active_ingredient: 'Amoxicillin Trihydrate',
    antimicrobial_class: 'Penicillins',
    strength: '150 mg/ml',
    status: 'active',
    who_classification: 'CIA',
    default_withdrawal_days_milk: 3,
    default_withdrawal_days_meat: 14,
    withdrawal_days_milk: 3,
    withdrawal_days_meat: 14,
    mrl: '4.0 ug/kg (Milk), 50.0 ug/kg (Meat)',
    regulatory_rules: [
      {
        id: 'r1',
        medicine_id: 'med-001',
        species: 'cow',
        product: 'milk',
        mrl: '4.0 ug/kg',
        withdrawal_days: 3,
        jurisdiction: 'India (FSSAI)',
        approval_status: 'approved',
        version: '1.0',
        effective_from: '2024-01-01',
      },
      {
        id: 'r2',
        medicine_id: 'med-001',
        species: 'buffalo',
        product: 'milk',
        mrl: '4.0 ug/kg',
        withdrawal_days: 3,
        jurisdiction: 'India (FSSAI)',
        approval_status: 'approved',
        version: '1.0',
        effective_from: '2024-01-01',
      },
    ],
  },
  {
    id: 'med-002',
    name: 'Baytril 10% Injectable',
    active_ingredient: 'Enrofloxacin',
    antimicrobial_class: 'Fluoroquinolones (CIA)',
    strength: '100 mg/ml',
    status: 'active',
    who_classification: 'HPCIA',
    default_withdrawal_days_milk: 5,
    default_withdrawal_days_meat: 14,
    withdrawal_days_milk: 5,
    withdrawal_days_meat: 14,
    mrl: '100.0 ug/kg (Muscle/Fat)',
    regulatory_rules: [
      {
        id: 'r3',
        medicine_id: 'med-002',
        species: 'cow',
        product: 'milk',
        mrl: '100.0 ug/kg',
        withdrawal_days: 28,
        jurisdiction: 'India (FSSAI)',
        approval_status: 'approved',
        version: '1.0',
        effective_from: '2024-01-01',
      },
    ],
  },
  {
    id: 'med-003',
    name: 'Excenel RTU 50mg/ml',
    active_ingredient: 'Ceftiofur Hydrochloride',
    antimicrobial_class: '3rd Gen Cephalosporins',
    strength: '50 mg/ml',
    status: 'active',
    who_classification: 'HPCIA',
    default_withdrawal_days_milk: 0,
    default_withdrawal_days_meat: 4,
    withdrawal_days_milk: 0,
    withdrawal_days_meat: 4,
    mrl: '100.0 ug/kg (Milk)',
    regulatory_rules: [
      {
        id: 'r4',
        medicine_id: 'med-003',
        species: 'cow',
        product: 'milk',
        mrl: '100.0 ug/kg',
        withdrawal_days: 0,
        jurisdiction: 'India (FSSAI)',
        approval_status: 'approved',
        version: '1.0',
        effective_from: '2024-01-01',
      },
    ],
  },
  {
    id: 'med-004',
    name: 'Terramycin LA 200',
    active_ingredient: 'Oxytetracycline Dihydrate',
    antimicrobial_class: 'Tetracyclines',
    strength: '200 mg/ml',
    status: 'active',
    who_classification: 'HIA',
    default_withdrawal_days_milk: 7,
    default_withdrawal_days_meat: 28,
    withdrawal_days_milk: 7,
    withdrawal_days_meat: 28,
    mrl: '100.0 ug/kg (Milk), 200.0 ug/kg (Meat)',
    regulatory_rules: [
      {
        id: 'r5',
        medicine_id: 'med-004',
        species: 'cow',
        product: 'milk',
        mrl: '100.0 ug/kg',
        withdrawal_days: 7,
        jurisdiction: 'India (FSSAI)',
        approval_status: 'approved',
        version: '1.0',
        effective_from: '2024-01-01',
      },
    ],
  },
  {
    id: 'med-005',
    name: 'Micotil 300 Inj',
    active_ingredient: 'Tilmicosin Phosphate',
    antimicrobial_class: 'Macrolides',
    strength: '300 mg/ml',
    status: 'active',
    who_classification: 'HPCIA',
    default_withdrawal_days_milk: 14,
    default_withdrawal_days_meat: 28,
    withdrawal_days_milk: 14,
    withdrawal_days_meat: 28,
    mrl: '50.0 ug/kg (Milk)',
    regulatory_rules: [
      {
        id: 'r6',
        medicine_id: 'med-005',
        species: 'cow',
        product: 'milk',
        mrl: '50.0 ug/kg',
        withdrawal_days: 14,
        jurisdiction: 'India (FSSAI)',
        approval_status: 'approved',
        version: '1.0',
        effective_from: '2024-01-01',
      },
    ],
  },
  {
    id: 'med-006',
    name: 'Sulpha-TMP Bolus',
    active_ingredient: 'Sulfadiazine + Trimethoprim',
    antimicrobial_class: 'Sulfonamides',
    strength: '2g + 400mg',
    status: 'active',
    who_classification: 'HIA',
    default_withdrawal_days_milk: 5,
    default_withdrawal_days_meat: 10,
    withdrawal_days_milk: 5,
    withdrawal_days_meat: 10,
    mrl: '100.0 ug/kg (Total Sulfas)',
    regulatory_rules: [],
  },
  {
    id: 'med-007',
    name: 'Gentamicin Sulphate 10%',
    active_ingredient: 'Gentamicin',
    antimicrobial_class: 'Aminoglycosides',
    strength: '100 mg/ml',
    status: 'active',
    who_classification: 'HPCIA',
    default_withdrawal_days_milk: 5,
    default_withdrawal_days_meat: 30,
    withdrawal_days_milk: 5,
    withdrawal_days_meat: 30,
    mrl: '100.0 ug/kg (Milk)',
    regulatory_rules: [],
  },
  {
    id: 'med-008',
    name: 'Neovet Aqua 50%',
    active_ingredient: 'Neomycin Sulphate',
    antimicrobial_class: 'Aminoglycosides',
    strength: '500 mg/g',
    status: 'active',
    who_classification: 'CIA',
    default_withdrawal_days_milk: 3,
    default_withdrawal_days_meat: 10,
    withdrawal_days_milk: 3,
    withdrawal_days_meat: 10,
    mrl: '500.0 ug/kg (Fishery Biomass)',
    regulatory_rules: [
      {
        id: 'r7',
        medicine_id: 'med-008',
        species: 'fishery',
        product: 'all',
        mrl: '500.0 ug/kg',
        withdrawal_days: 12,
        jurisdiction: 'India (MPEDA / FSSAI)',
        approval_status: 'approved',
        version: '1.0',
        effective_from: '2024-01-01',
      },
    ],
  },
];

export interface GetMedicinesFilter {
  whoClassification?: string;
  search?: string;
  antimicrobialClass?: string;
}

export class MedicineRepository {
  private static localMedicines: MedicineWithRules[] = [...SEED_MEDICINES];

  static async getMedicines(filter: GetMedicinesFilter = {}): Promise<MedicineWithRules[]> {
    // 1. Try Backend REST API
    try {
      const res = await api.get<any>('medicines');
      const rawItems: MedicineWithRules[] = Array.isArray(res) ? res : (res?.data ?? []);
      if (rawItems && rawItems.length > 0) {
        let items: MedicineWithRules[] = [...rawItems];
        if (filter.whoClassification && filter.whoClassification !== 'all') {
          items = items.filter((m: MedicineWithRules) => m.who_classification === filter.whoClassification);
        }
        if (filter.antimicrobialClass && filter.antimicrobialClass !== 'All') {
          items = items.filter((m: MedicineWithRules) => m.antimicrobial_class === filter.antimicrobialClass);
        }
        if (filter.search) {
          const q = filter.search.toLowerCase();
          items = items.filter(
            (m: MedicineWithRules) =>
              m.name.toLowerCase().includes(q) ||
              m.active_ingredient.toLowerCase().includes(q) ||
              m.antimicrobial_class.toLowerCase().includes(q)
          );
        }
        return items;
      }
    } catch {}

    // 2. Try Supabase Client
    const supabase = createClient();
    try {
      let query = supabase.from('medicines').select('*, regulatory_rules(*)').order('name');
      if (filter.whoClassification && filter.whoClassification !== 'all') {
        query = query.eq('who_classification', filter.whoClassification);
      }
      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,active_ingredient.ilike.%${filter.search}%`);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as MedicineWithRules[];
      }
    } catch {}

    // 3. Fallback to Local In-Memory Store
    return this.localMedicines.filter((m) => {
      if (
        filter.whoClassification &&
        filter.whoClassification !== 'all' &&
        m.who_classification !== filter.whoClassification
      ) {
        return false;
      }
      if (
        filter.antimicrobialClass &&
        filter.antimicrobialClass !== 'All' &&
        m.antimicrobial_class !== filter.antimicrobialClass
      ) {
        return false;
      }
      if (filter.search) {
        const term = filter.search.toLowerCase();
        const nameMatch = m.name.toLowerCase().includes(term);
        const activeMatch = m.active_ingredient.toLowerCase().includes(term);
        const classMatch = m.antimicrobial_class.toLowerCase().includes(term);
        if (!nameMatch && !activeMatch && !classMatch) return false;
      }
      return true;
    });
  }

  static async getMedicineById(id: string): Promise<MedicineWithRules | null> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*, regulatory_rules(*)')
        .eq('id', id)
        .single();
      if (!error && data) return data as MedicineWithRules;
    } catch {}

    return this.localMedicines.find((m) => m.id === id) || null;
  }

  static async createMedicine(payload: any): Promise<MedicineWithRules> {
    const newMedId = `med-${Date.now()}`;
    const newMed: MedicineWithRules = {
      id: newMedId,
      name: payload.name,
      active_ingredient: payload.active_ingredient,
      antimicrobial_class: payload.antimicrobial_class || 'Penicillins',
      strength: payload.strength || '100 mg/ml',
      status: 'active',
      who_classification: payload.who_classification || 'Standard',
      default_withdrawal_days_milk: payload.default_withdrawal_days_milk
        ? Number(payload.default_withdrawal_days_milk)
        : 3,
      default_withdrawal_days_meat: payload.default_withdrawal_days_meat
        ? Number(payload.default_withdrawal_days_meat)
        : 14,
      withdrawal_days_milk: payload.default_withdrawal_days_milk
        ? Number(payload.default_withdrawal_days_milk)
        : 3,
      withdrawal_days_meat: payload.default_withdrawal_days_meat
        ? Number(payload.default_withdrawal_days_meat)
        : 14,
      mrl: payload.rule_mrl || '50 ug/kg',
      regulatory_rules: payload.rule_species
        ? [
            {
              id: `r_${Date.now()}`,
              medicine_id: newMedId,
              species: payload.rule_species,
              product: 'milk',
              mrl: payload.rule_mrl || '50 ug/kg',
              withdrawal_days: Number(payload.rule_withdrawal_days || 3),
              jurisdiction: 'India (FSSAI)',
              approval_status: 'approved',
              version: '1.0',
              effective_from: new Date().toISOString().split('T')[0],
            },
          ]
        : [],
    };

    // Try API POST
    try {
      await api.post('medicines', payload);
    } catch {}

    // Prepend to local in-memory list
    this.localMedicines.unshift(newMed);
    return newMed;
  }
}
