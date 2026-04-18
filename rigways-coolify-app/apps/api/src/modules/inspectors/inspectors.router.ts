import { Router } from 'express';

import { buildStorageObjectUrl } from '../../lib/storage.js';
import { requireRole, requireSession } from '../../middleware/auth.js';
import { createInspectorUploadTicket } from '../uploads/uploads.service.js';
import { createInspectorRecord, getInspector, getInspectorCv, getInspectors, patchInspectorRecord, removeInspector } from './inspectors.service.js';

export const inspectorsRouter = Router();

inspectorsRouter.use(requireSession);
inspectorsRouter.use(requireRole(['admin', 'manager']));

inspectorsRouter.post('/upload-cv-init', requireRole(['admin']), async (req, res) => {
  try {
    const data = await createInspectorUploadTicket(req.body || {}, 'cv');
    return res.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

inspectorsRouter.post('/upload-file-init', requireRole(['admin']), async (req, res) => {
  try {
    const data = await createInspectorUploadTicket(req.body || {}, 'training');
    return res.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

inspectorsRouter.get('/', async (req, res) => {
  try {
    const data = await getInspectors(new URLSearchParams(req.query as Record<string, string>));
    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

inspectorsRouter.get('/cv/:id', async (req, res) => {
  try {
    const cv = await getInspectorCv(String(req.params.id));
    if (!cv || !cv.cvUrl) return res.status(404).json({ success: false, error: 'CV file not found', code: 'NOT_FOUND' });
    const target = buildStorageObjectUrl(cv.cvUrl);
    if (!target) {
      return res.status(501).json({ success: false, error: 'Storage public URL is not configured', code: 'NO_STORAGE_URL' });
    }
    return res.redirect(target);
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

inspectorsRouter.get('/:id', async (req, res) => {
  try {
    const inspector = await getInspector(String(req.params.id));
    if (!inspector) return res.status(404).json({ success: false, error: 'Inspector not found', code: 'NOT_FOUND' });
    return res.json({ success: true, data: inspector });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

inspectorsRouter.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const inspector = await createInspectorRecord(req.body || {});
    return res.status(201).json({ success: true, data: inspector });
  } catch (error) {
    if (error instanceof Error && error.name === 'ConflictError') {
      return res.status(409).json({ success: false, error: error.message, code: 'CONFLICT' });
    }
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

inspectorsRouter.patch('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const inspector = await patchInspectorRecord(String(req.params.id), req.body || {});
    if (!inspector) return res.status(404).json({ success: false, error: 'Inspector not found', code: 'NOT_FOUND' });
    return res.json({ success: true, data: inspector });
  } catch (error) {
    if (error instanceof Error && error.name === 'ConflictError') {
      return res.status(409).json({ success: false, error: error.message, code: 'CONFLICT' });
    }
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

inspectorsRouter.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const result = await removeInspector(String(req.params.id));
    if (!result) return res.status(404).json({ success: false, error: 'Inspector not found', code: 'NOT_FOUND' });
    return res.json({ success: true, data: result });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});
