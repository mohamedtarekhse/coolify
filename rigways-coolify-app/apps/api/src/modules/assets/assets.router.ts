import { Router } from 'express';

import { requireRole, requireSession } from '../../middleware/auth.js';
import {
  createAssetRecord,
  getAsset,
  getAssets,
  getAssetStats,
  patchAssetRecord,
  removeAsset,
} from './assets.service.js';

export const assetsRouter = Router();

assetsRouter.use(requireSession);

assetsRouter.get('/stats', async (req, res) => {
  try {
    const restricted = ['user', 'technician'].includes(req.sessionUser!.role);
    const data = await getAssetStats(req.sessionUser!.customerId, restricted);
    return res.json({ success: true, data });
  } catch (error) {
    console.error('asset stats failed', error);
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

assetsRouter.get('/', async (req, res) => {
  try {
    const restricted = ['user', 'technician'].includes(req.sessionUser!.role);
    const canOverrideClient = ['admin', 'manager'].includes(req.sessionUser!.role);
    const data = await getAssets(
      new URLSearchParams(req.query as Record<string, string>),
      req.sessionUser!.customerId,
      restricted,
      canOverrideClient,
    );
    return res.json({ success: true, data });
  } catch (error) {
    console.error('list assets failed', error);
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

assetsRouter.get('/:id', async (req, res) => {
  try {
    const asset = await getAsset(String(req.params.id));
    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found', code: 'NOT_FOUND' });
    }
    if (['user', 'technician'].includes(req.sessionUser!.role) && req.sessionUser!.customerId && asset.clientId !== req.sessionUser!.customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    }
    return res.json({ success: true, data: asset });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

assetsRouter.post('/', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const asset = await createAssetRecord(req.body || {});
    return res.status(201).json({ success: true, data: asset });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

assetsRouter.patch('/:id', requireRole(['admin', 'manager', 'technician']), async (req, res) => {
  try {
    const updated = await patchAssetRecord(String(req.params.id), req.body || {}, req.sessionUser!.role, req.sessionUser!.customerId);
    if (updated === 'FORBIDDEN') {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    }
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Asset not found', code: 'NOT_FOUND' });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

assetsRouter.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const removed = await removeAsset(String(req.params.id));
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Asset not found', code: 'NOT_FOUND' });
    }
    return res.json({ success: true, data: { id: removed.id, deleted: true } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});
