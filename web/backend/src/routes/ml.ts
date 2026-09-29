import { Router, Request, Response } from 'express';
import { predictOveruseRisk, predictComplianceRisk, getModelsMetadata } from '../services/mlService';

const router = Router();

// GET /api/ml/models-info & /api/ml/models-metadata
const handleModelsInfo = (_req: Request, res: Response) => {
  const metadata = getModelsMetadata();
  res.json({
    status: 'success',
    data: metadata,
  });
};

router.get('/ml/models-info', handleModelsInfo);
router.get('/ml/models-metadata', handleModelsInfo);
router.get('/models-info', handleModelsInfo);
router.get('/models-metadata', handleModelsInfo);

// POST /api/ml/overuse-risk & /api/ml/predict-overuse (Model A)
const handleOveruseRisk = async (req: Request, res: Response) => {
  try {
    const { species, weight_kg } = req.body;

    if (!species || weight_kg === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: species and weight_kg are required.',
      });
    }

    const result = await predictOveruseRisk(req.body);
    res.json({
      status: 'success',
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ status: 'error', message: error.message || 'Failed to evaluate overuse risk.' });
  }
};

router.post('/ml/overuse-risk', handleOveruseRisk);
router.post('/ml/predict-overuse', handleOveruseRisk);
router.post('/overuse-risk', handleOveruseRisk);
router.post('/predict-overuse', handleOveruseRisk);

// POST /api/ml/compliance-risk & /api/ml/predict-compliance (Model B)
const handleComplianceRisk = async (req: Request, res: Response) => {
  try {
    const { species, weight_kg, drug_name, official_withdrawal_period_days, days_elapsed_since_treatment } = req.body;

    if (!species || !drug_name || official_withdrawal_period_days === undefined || days_elapsed_since_treatment === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required compliance fields: species, drug_name, official_withdrawal_period_days, and days_elapsed_since_treatment are required.',
      });
    }

    const result = await predictComplianceRisk(req.body);
    res.json({
      status: 'success',
      data: result,
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ status: 'error', message: error.message || 'Failed to evaluate compliance risk.' });
  }
};

router.post('/ml/compliance-risk', handleComplianceRisk);
router.post('/ml/predict-compliance', handleComplianceRisk);
router.post('/compliance-risk', handleComplianceRisk);
router.post('/predict-compliance', handleComplianceRisk);

export default router;
