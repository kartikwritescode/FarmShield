import { Router, Request, Response } from 'express';
import { db, Medicine, RegulatoryRule } from '../services/dbService';

const router = Router();

// GET /api/medicines - Get medicines catalog with nested regulatory_rules
router.get('/medicines', (_req: Request, res: Response) => {
  const data = db.medicines.map((m) => {
    const rules = db.rules.filter((r) => r.medicine_id === m.id);
    return {
      ...m,
      regulatory_rules: rules,
    };
  });

  res.json({
    status: 'success',
    data,
  });
});

// POST /api/medicines - Add new medicine to catalog with optional initial rule
router.post('/medicines', (req: Request, res: Response) => {
  const {
    name,
    active_ingredient,
    antimicrobial_class,
    strength,
    who_classification,
    image_url,
    default_withdrawal_days_milk,
    default_withdrawal_days_meat,
    rule_species,
    rule_mrl,
    rule_withdrawal_days,
  } = req.body;

  if (!name || !active_ingredient) {
    return res.status(400).json({ status: 'error', message: 'Name and active_ingredient are required' });
  }

  const newMedId = `m_${Date.now()}`;
  const newMedicine: Medicine = {
    id: newMedId,
    name,
    active_ingredient,
    antimicrobial_class: antimicrobial_class || 'General Antimicrobial',
    strength: strength || '100 mg/ml',
    status: 'active',
    who_classification: who_classification || 'Standard',
    image_url: image_url || null,
    default_withdrawal_days_milk: default_withdrawal_days_milk ? Number(default_withdrawal_days_milk) : undefined,
    default_withdrawal_days_meat: default_withdrawal_days_meat ? Number(default_withdrawal_days_meat) : undefined,
  };

  db.medicines.unshift(newMedicine);

  // If initial rule was provided
  const createdRules: RegulatoryRule[] = [];
  if (rule_species && (rule_withdrawal_days !== undefined || default_withdrawal_days_milk !== undefined)) {
    const newRule: RegulatoryRule = {
      id: `r_${Date.now()}`,
      medicine_id: newMedId,
      species: rule_species,
      product: 'milk',
      mrl: rule_mrl || '50 ug/kg',
      withdrawal_days: Number(rule_withdrawal_days || default_withdrawal_days_milk || 3),
      jurisdiction: 'India (FSSAI)',
      approval_status: 'approved',
    };
    db.rules.push(newRule);
    createdRules.push(newRule);
  }

  res.status(201).json({
    status: 'success',
    data: {
      ...newMedicine,
      regulatory_rules: createdRules,
    },
  });
});

// GET /api/regulatory-rules - Get FSSAI regulatory MRL rules
router.get('/regulatory-rules', (_req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: db.rules,
  });
});

// POST /api/regulatory-rules - Add regulatory rule
router.post('/regulatory-rules', (req: Request, res: Response) => {
  const { medicine_id, species, product, mrl, withdrawal_days, jurisdiction } = req.body;
  if (!medicine_id || !species || !withdrawal_days) {
    return res.status(400).json({ status: 'error', message: 'medicine_id, species, and withdrawal_days required' });
  }

  const newRule: RegulatoryRule = {
    id: `r_${Date.now()}`,
    medicine_id,
    species,
    product: product || 'milk',
    mrl: mrl || '50 ug/kg',
    withdrawal_days: Number(withdrawal_days),
    jurisdiction: jurisdiction || 'India (FSSAI)',
    approval_status: 'approved',
  };

  db.rules.push(newRule);

  res.status(201).json({ status: 'success', data: newRule });
});

export default router;
