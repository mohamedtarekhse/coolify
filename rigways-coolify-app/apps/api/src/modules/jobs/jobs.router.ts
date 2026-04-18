import { Router } from 'express';

import { requireRole, requireSession } from '../../middleware/auth.js';
import { assignJobInspectors, createJobRecord, getJob, getJobInspectors, getJobs, patchJobRecord } from './jobs.service.js';

export const jobsRouter = Router();

jobsRouter.use(requireSession);

jobsRouter.get('/', async (req, res) => {
  try {
    const data = await getJobs(new URLSearchParams(req.query as Record<string, string>), req.sessionUser!.customerId, ['admin', 'manager'].includes(req.sessionUser!.role));
    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

jobsRouter.post('/', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const job = await createJobRecord(req.body || {}, { id: req.sessionUser!.id, name: req.sessionUser!.name });
    return res.status(201).json({ success: true, data: job });
  } catch (error) {
    if (error instanceof Error) return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

jobsRouter.get('/:id', async (req, res) => {
  try {
    const job = await getJob(String(req.params.id));
    if (!job) return res.status(404).json({ success: false, error: 'Job not found', code: 'NOT_FOUND' });
    if (!['admin', 'manager'].includes(req.sessionUser!.role) && req.sessionUser!.customerId && job.clientId !== req.sessionUser!.customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    }
    return res.json({ success: true, data: job });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

jobsRouter.patch('/:id', async (req, res) => {
  try {
    const updated = await patchJobRecord(req.params.id, req.body || {}, req.sessionUser!);
    if (updated === 'FORBIDDEN') return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    if (!updated) return res.status(404).json({ success: false, error: 'Job not found', code: 'NOT_FOUND' });
    return res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof Error) return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

jobsRouter.get('/:id/inspectors', async (req, res) => {
  try {
    const inspectors = await getJobInspectors(req.params.id);
    return res.json({ success: true, data: { inspectors } });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

jobsRouter.post('/:id/inspectors', requireRole(['admin', 'manager']), async (req, res) => {
  try {
    const inspectorIds = Array.isArray(req.body?.inspector_ids) ? req.body.inspector_ids.map(String) : [];
    const data = await assignJobInspectors(String(req.params.id), inspectorIds, req.sessionUser!.id);
    return res.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error) return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});
