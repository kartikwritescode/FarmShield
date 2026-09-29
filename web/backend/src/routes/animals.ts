import { Router, Request, Response } from 'express';
import { db, addAnimal, updateAnimal } from '../services/dbService';
import { getAnimalQRDetails, generateAnimalQRPngBuffer } from '../services/qrService';

const router = Router();

// GET /api/animals - Get all registered animals (supports ?species=...&status=...&search=...)
router.get('/animals', async (req: Request, res: Response) => {
  const { species, status, search } = req.query;
  let list = [...db.animals];

  if (species && species !== 'all') {
    const sp = String(species).toLowerCase().trim();
    if (sp === 'other') {
      const known = ['cow', 'buffalo', 'goat', 'sheep', 'fishery'];
      list = list.filter((a) => !a.species || !known.includes(a.species.toLowerCase().trim()));
    } else {
      list = list.filter((a) => a.species && a.species.toLowerCase().trim() === sp);
    }
  }

  if (status && status !== 'all') {
    const st = String(status).toLowerCase().trim();
    list = list.filter((a) => a.health_status && a.health_status.toLowerCase().trim() === st);
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    list = list.filter(
      (a) =>
        (a.animal_code && a.animal_code.toLowerCase().includes(q)) ||
        (a.breed && a.breed.toLowerCase().includes(q)) ||
        (a.qr_token && a.qr_token.toLowerCase().includes(q))
    );
  }

  res.json({
    status: 'success',
    data: list,
  });
});

// GET /api/animals/:id/qr-code - Get generated QR Code Base64 and Verification URL
router.get('/animals/:id/qr-code', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qrDetails = await getAnimalQRDetails(id);

    if (!qrDetails) {
      return res.status(404).json({ status: 'error', message: `Animal '${id}' not found.` });
    }

    res.json({
      status: 'success',
      data: qrDetails,
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// GET /api/animals/:id/qr-image - Direct Binary PNG Download for Ear-Tags & Badges
router.get('/animals/:id/qr-image', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const animal = db.animals.find(
      (a) => a.id === id || a.animal_code.toLowerCase() === id.toLowerCase()
    );

    if (!animal) {
      return res.status(404).send('Animal not found');
    }

    const pngBuffer = await generateAnimalQRPngBuffer(animal);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="qr_${animal.animal_code}.png"`);
    res.send(pngBuffer);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).send(error.message);
  }
});

// GET /api/animals/:id - Get full animal profile & treatment history
router.get('/animals/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const animal = db.animals.find((a) => a.id === id || a.animal_code.toLowerCase() === id.toLowerCase());

  if (!animal) {
    return res.status(404).json({ status: 'error', message: 'Animal not found' });
  }

  // Treatments for this animal
  const treatments = db.treatments
    .filter((t) => t.animal_id === animal.id)
    .map((t) => {
      const med = db.medicines.find((m) => m.id === t.medicine_id);
      return {
        ...t,
        medicine_name: med?.name || 'Antimicrobial Medicine',
        active_ingredient: med?.active_ingredient || 'Active Ingredient',
      };
    });

  // Active withdrawals
  const now = new Date();
  const activeWithdrawals = db.withdrawals.filter(
    (w) => w.animal_id === animal.id && w.status === 'active' && new Date(w.end_date) > now
  );

  const isCattleOrBuffalo = animal.species === 'cow' || animal.species === 'buffalo';
  const milkWithdrawal = activeWithdrawals.find((w) => w.product === 'milk' || w.product === 'all');
  const meatWithdrawal = isCattleOrBuffalo ? undefined : activeWithdrawals.find((w) => w.product === 'meat' || w.product === 'all');

  const getStatusBadge = (w: typeof milkWithdrawal) => {
    if (!w) return '🟢 CLEARED';
    if (!w.end_date) return '🟡 REVIEW REQUIRED';
    return '🔴 WITHDRAWAL ACTIVE';
  };

  const currentTreatment = treatments.length > 0 ? treatments[0] : null;

  res.json({
    status: 'success',
    data: {
      animal,
      milkStatus: getStatusBadge(milkWithdrawal),
      meatStatus: isCattleOrBuffalo ? null : getStatusBadge(meatWithdrawal),
      withdrawalStatus: activeWithdrawals.length > 0 ? '🔴 WITHDRAWAL ACTIVE' : '🟢 CLEARED',
      safeMilkDate: milkWithdrawal ? milkWithdrawal.end_date : new Date().toISOString(),
      safeMeatDate: isCattleOrBuffalo ? null : (meatWithdrawal ? meatWithdrawal.end_date : new Date().toISOString()),
      currentTreatment,
      treatmentHistory: treatments,
    },
  });
});

// GET /api/animals/qr/:qrToken - Privacy-Safe QR Animal Safety Profile Lookup
router.get('/animals/qr/:qrToken', (req: Request, res: Response) => {
  const { qrToken } = req.params;
  const animal = db.animals.find(
    (a) => a.qr_token.toLowerCase() === qrToken.toLowerCase() || a.animal_code.toLowerCase() === qrToken.toLowerCase()
  );

  if (!animal) {
    return res.status(404).json({
      status: 'error',
      message: `No animal found for QR token '${qrToken}'`,
    });
  }

  const isCattleOrBuffalo = animal.species === 'cow' || animal.species === 'buffalo';
  const now = new Date();
  const activeWithdrawals = db.withdrawals.filter(
    (w) => w.animal_id === animal.id && w.status === 'active' && new Date(w.end_date) > now
  );

  const milkWithdrawal = activeWithdrawals.find((w) => w.product === 'milk' || w.product === 'all');
  const meatWithdrawal = isCattleOrBuffalo ? undefined : activeWithdrawals.find((w) => w.product === 'meat' || w.product === 'all');

  const milkStatus = !milkWithdrawal ? '🟢 CLEARED' : '🔴 WITHDRAWAL ACTIVE';
  const meatStatus = isCattleOrBuffalo ? null : (!meatWithdrawal ? '🟢 CLEARED' : '🔴 WITHDRAWAL ACTIVE');
  const overallStatus = activeWithdrawals.length > 0 ? '🔴 WITHDRAWAL ACTIVE' : '🟢 CLEARED';

  // Calculate remaining hours
  const safeDateObj = milkWithdrawal ? new Date(milkWithdrawal.end_date) : (meatWithdrawal ? new Date(meatWithdrawal.end_date) : now);
  const remainingHours = Math.max(0, Math.round((safeDateObj.getTime() - now.getTime()) / (1000 * 60 * 60)));

  res.json({
    status: 'success',
    data: {
      animalCode: animal.animal_code,
      species: animal.species,
      breed: animal.breed,
      healthStatus: animal.health_status,
      milkStatus,
      meatStatus: isCattleOrBuffalo ? null : meatStatus,
      withdrawalStatus: overallStatus,
      isMilkSafe: !milkWithdrawal,
      isMeatSafe: isCattleOrBuffalo ? null : !meatWithdrawal,
      safeDate: safeDateObj.toISOString(),
      remainingWithdrawalHours: remainingHours,
      verificationAuthority: 'Digital Farm Management & Food Safety Standards Portal',
      jurisdiction: 'FSSAI / Codex Alimentarius MRL Compliance',
    },
  });
});

// POST /api/animals - Register a new animal
router.post('/animals', async (req: Request, res: Response) => {
  try {
    const {
      animal_code,
      species,
      breed,
      dob,
      sex,
      weight,
      weight_kg,
      purpose,
      health_status,
      fishery_details,
      image_url,
      cloudinary_public_id,
      notes,
    } = req.body;

    const parsedWeight = weight_kg !== undefined ? Number(weight_kg) : (weight !== undefined ? Number(weight) : 0);

    if (!animal_code || !species) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required animal fields: animal_code and species are required.',
      });
    }

    const qrToken = `QR-${animal_code.toUpperCase().replace(/\s+/g, '-')}`;

    const newAnimal = await addAnimal({
      farm_id: 'farm1',
      animal_code,
      species,
      breed: breed || (species === 'fishery' ? 'Rohu (Labeo rohita)' : 'Indigenous'),
      dob: dob || new Date(Date.now() - 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sex: sex || (species === 'fishery' ? 'collective' : 'female'),
      weight: parsedWeight,
      purpose: purpose || (species === 'fishery' ? 'aquaculture' : 'milk'),
      health_status: health_status || 'healthy',
      fishery_details: fishery_details || null,
      image_url: image_url || null,
      cloudinary_public_id: cloudinary_public_id || null,
      notes: notes || '',
      qr_token: qrToken,
    });

    res.status(201).json({
      status: 'success',
      data: newAnimal,
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// PUT /api/animals/:id - Edit animal details
router.put('/animals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { animal_code, species, breed, dob, sex, weight, purpose, health_status, notes } = req.body;

    const updated = await updateAnimal(id, {
      ...(animal_code ? { animal_code } : {}),
      ...(species ? { species } : {}),
      ...(breed ? { breed } : {}),
      ...(dob ? { dob } : {}),
      ...(sex ? { sex } : {}),
      ...(weight ? { weight: Number(weight) } : {}),
      ...(purpose ? { purpose } : {}),
      ...(health_status ? { health_status } : {}),
      ...(notes !== undefined ? { notes } : {}),
    });

    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Animal not found' });
    }

    res.json({
      status: 'success',
      data: updated,
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
