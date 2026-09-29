import { Router, Request, Response } from 'express';
import { db, LabResultRecord } from '../services/dbService';
import { getSupabaseClient, isSupabaseConfigured } from '../config/supabase';

const router = Router();

// GET /api/lab-results - List all laboratory residue assays
router.get('/lab-results', async (_req: Request, res: Response) => {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('lab_results')
          .select('*, animals(animal_code, species, breed)')
          .order('test_date', { ascending: false });
        if (!error && data) {
          return res.json({ status: 'success', data });
        }
      } catch {}
    }
  }

  res.json({
    status: 'success',
    data: db.labResults,
  });
});

// POST /api/lab-results - Submit new laboratory residue assay
router.post('/lab-results', async (req: Request, res: Response) => {
  try {
    const {
      animal_id,
      product = 'milk',
      analyte = 'Antimicrobial Residue Assay',
      result,
      unit = 'ug/kg',
      test_date = new Date().toISOString().split('T')[0],
      laboratory = 'FSSAI Accredited Central Lab',
      mrl_threshold = 50.0,
      status,
      lab_report_pdf_url = null,
    } = req.body;

    if (!animal_id || result === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'animal_id and result value are required.',
      });
    }

    const numericResult = Number(result);
    const numericMrl = Number(mrl_threshold);
    const computedStatus =
      status || (numericResult <= numericMrl ? 'COMPLIANT' : 'NON_COMPLIANT');

    const newRecord: LabResultRecord = {
      id: `lab-${Date.now()}`,
      animal_id,
      product,
      analyte,
      result: numericResult,
      unit,
      test_date,
      laboratory,
      mrl_threshold: numericMrl,
      status: computedStatus,
      lab_report_pdf_url,
      created_at: new Date().toISOString(),
    };

    // Attempt direct Supabase insert
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('lab_results')
            .insert([
              {
                animal_id,
                product: product.toLowerCase() === 'milk' ? 'milk' : (product.toLowerCase() === 'meat' ? 'meat' : 'eggs'),
                analyte,
                result: numericResult,
                unit,
                test_date,
                laboratory,
              },
            ])
            .select()
            .single();

          if (!error && data) {
            newRecord.id = data.id;
          }
        } catch {}
      }
    }

    db.labResults.unshift(newRecord);

    res.status(201).json({
      status: 'success',
      data: newRecord,
      message:
        computedStatus === 'COMPLIANT'
          ? 'Residue test passes statutory MRL threshold. Product cleared.'
          : 'WARNING: Residue test exceeds statutory MRL limit. Zero-Sale Mandate active.',
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: err.message || 'Failed to submit lab residue result.',
    });
  }
});

export default router;
