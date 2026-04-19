import { Router } from 'express';

import { requireRole, requireSession } from '../../middleware/auth.js';
import {
  batchNotify,
  getPushDiag,
  getStatus,
  getVapidPublicKey,
  sendTestToRoles,
  sendTestToUser,
  subscribe,
  unsubscribe,
} from './push.service.js';

export const pushRouter = Router();

pushRouter.use(requireSession);

pushRouter.post('/subscribe', async (req, res) => {
  try {
    const data = await subscribe(req.sessionUser!.id, req.get('user-agent') || null, req.body || {});
    return res.status(data.updated ? 200 : 201).json({ success: true, data });
  } catch (error) {
    if (error instanceof Error) return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

pushRouter.delete('/unsubscribe', async (req, res) => {
  try {
    const data = await unsubscribe(req.sessionUser!.id, req.body || {});
    return res.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error) return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

pushRouter.get('/status', async (req, res) => {
  const data = await getStatus(req.sessionUser!.id);
  return res.json({ success: true, data });
});

pushRouter.get('/vapid-key', (_req, res) => {
  return res.json({ success: true, data: getVapidPublicKey() });
});

pushRouter.post('/batch-notify', async (req, res) => {
  try {
    const count = Number(req.body?.count || 0);
    const data = await batchNotify(req.sessionUser!.id, count, req.body?.message ? String(req.body.message) : undefined);
    return res.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error) return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

pushRouter.get('/test', async (req, res) => {
  const data = await sendTestToUser(req.sessionUser!.id);
  return res.json({ success: true, data });
});

pushRouter.get('/test-all', requireRole(['admin', 'manager']), async (req, res) => {
  const data = await sendTestToRoles(req.sessionUser!.name);
  return res.json({ success: true, data });
});

pushRouter.get('/diag', (req, res) => {
  return res.json({ success: true, data: getPushDiag(req.get('user-agent') || null) });
});
