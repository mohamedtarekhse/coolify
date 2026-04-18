import { Router } from 'express';

import { requireSession } from '../../middleware/auth.js';
import { getExpiring, getSummary } from './reports.service.js';

export const reportsRouter = Router();

reportsRouter.use(requireSession);

reportsRouter.get('/summary', async (req, res) => {
  try {
    const restricted = ['user', 'technician'].includes(req.sessionUser!.role);
    const data = await getSummary(req.sessionUser!.customerId, restricted);
    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

reportsRouter.get('/expiring', async (req, res) => {
  try {
    const restricted = ['user', 'technician'].includes(req.sessionUser!.role);
    const data = await getExpiring(Number(req.query.days || 30), req.sessionUser!.customerId, restricted);
    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});
