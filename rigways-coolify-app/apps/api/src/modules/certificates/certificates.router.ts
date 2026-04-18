import { Router } from 'express';

import { buildStorageObjectUrl } from '../../lib/storage.js';
import { requireRole, requireSession } from '../../middleware/auth.js';
import { createCertificateUploadTicket } from '../uploads/uploads.service.js';
import {
  createCertificateRecord,
  getCertificate,
  getCertificateFileView,
  getCertificates,
  getCertificateStats,
  getExpiringCertificates,
  patchCertificateRecord,
  removeCertificate,
} from './certificates.service.js';

export const certificatesRouter = Router();

certificatesRouter.use(requireSession);

certificatesRouter.post('/upload-init', requireRole(['admin', 'manager', 'technician']), async (req, res) => {
  try {
    const data = await createCertificateUploadTicket(req.body || {});
    return res.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

certificatesRouter.get('/stats', async (req, res) => {
  try {
    const restricted = ['user', 'technician'].includes(req.sessionUser!.role);
    const data = await getCertificateStats(req.sessionUser!.customerId, restricted);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

certificatesRouter.get('/file/:id', async (req, res) => {
  try {
    const file = await getCertificateFileView(String(req.params.id));
    if (!file || !file.fileUrl) {
      return res.status(404).json({ success: false, error: 'File not found', code: 'NOT_FOUND' });
    }
    if (['user', 'technician'].includes(req.sessionUser!.role) && req.sessionUser!.customerId && file.clientId !== req.sessionUser!.customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    }
    const target = buildStorageObjectUrl(file.fileUrl);
    if (!target) {
      return res.status(501).json({ success: false, error: 'Storage public URL is not configured', code: 'NO_STORAGE_URL' });
    }
    return res.redirect(target);
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

certificatesRouter.get('/expiring', async (req, res) => {
  try {
    const restricted = ['user', 'technician'].includes(req.sessionUser!.role);
    const days = Number(req.query.days || 30);
    const data = await getExpiringCertificates(days, req.sessionUser!.customerId, restricted);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

certificatesRouter.get('/', async (req, res) => {
  try {
    const restricted = ['user', 'technician'].includes(req.sessionUser!.role);
    const canOverrideClient = ['admin', 'manager'].includes(req.sessionUser!.role);
    const data = await getCertificates(
      new URLSearchParams(req.query as Record<string, string>),
      req.sessionUser!.customerId,
      restricted,
      canOverrideClient,
    );
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

certificatesRouter.get('/:id', async (req, res) => {
  try {
    const certificate = await getCertificate(req.params.id);
    if (!certificate) {
      return res.status(404).json({ success: false, error: 'Certificate not found', code: 'NOT_FOUND' });
    }
    if (['user', 'technician'].includes(req.sessionUser!.role) && req.sessionUser!.customerId && certificate.clientId !== req.sessionUser!.customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    }
    return res.json({ success: true, data: certificate });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

certificatesRouter.post('/', requireRole(['admin', 'manager', 'technician']), async (req, res) => {
  try {
    const certificate = await createCertificateRecord(
      req.body || {},
      req.sessionUser!.id,
      req.sessionUser!.role,
      req.sessionUser!.customerId,
    );
    return res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    if (error instanceof Error && error.name === 'ForbiddenError') {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    }
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

certificatesRouter.patch('/:id', async (req, res) => {
  try {
    const certificate = await patchCertificateRecord(req.params.id, req.body || {}, req.sessionUser!.id, req.sessionUser!.role);
    if (!certificate) {
      return res.status(404).json({ success: false, error: 'Certificate not found', code: 'NOT_FOUND' });
    }
    return res.json({ success: true, data: certificate });
  } catch (error) {
    if (error instanceof Error && error.name === 'ForbiddenError') {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    }
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

certificatesRouter.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const removed = await removeCertificate(String(req.params.id), req.sessionUser!.id);
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Certificate not found', code: 'NOT_FOUND' });
    }
    return res.json({ success: true, data: { id: removed.id, deleted: true } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});
