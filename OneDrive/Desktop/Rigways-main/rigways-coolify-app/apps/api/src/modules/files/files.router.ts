import { Router } from 'express';

import { requireRole, requireSession } from '../../middleware/auth.js';
import {
  deleteByObjectKey,
  getFileDownloadUrl,
  getFileSignedUrl,
  getFiles,
  getObjectDownloadUrl,
  getObjectSignedUrl,
  makeCurrent,
} from './files.service.js';

export const filesRouter = Router();

filesRouter.use(requireSession);
filesRouter.use(requireRole(['admin']));

filesRouter.get('/', async (req, res) => {
  try {
    const data = await getFiles(new URLSearchParams(req.query as Record<string, string>));
    return res.json({ success: true, data });
  } catch (error) {
    console.error('list files failed', error);
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

filesRouter.get('/object/signed-url', async (req, res) => {
  const key = String(req.query.key || '');
  if (!key) return res.status(400).json({ success: false, error: 'key is required', code: 'MISSING_KEY' });
  const ttl = Math.min(Math.max(Number(req.query.ttl || 300), 30), 900);
  const origin = `${req.protocol}://${req.get('host')}`;
  return res.json({ success: true, data: getObjectSignedUrl(key, ttl, origin) });
});

filesRouter.get('/object/download', async (req, res) => {
  const key = String(req.query.key || '');
  const exp = Number(req.query.exp || 0);
  const sig = String(req.query.sig || '');
  const target = getObjectDownloadUrl(key, exp, sig);
  if (!target) return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
  return res.redirect(target);
});

filesRouter.delete('/object', async (req, res) => {
  const key = String(req.query.key || '');
  const mode = String(req.query.mode || 'hard').toLowerCase();
  if (!key) return res.status(400).json({ success: false, error: 'key is required', code: 'MISSING_KEY' });
  const data = await deleteByObjectKey(key, mode);
  return res.json({ success: true, data });
});

filesRouter.get('/:id/signed-url', async (req, res) => {
  const ttl = Math.min(Math.max(Number(req.query.ttl || 300), 30), 900);
  const origin = `${req.protocol}://${req.get('host')}`;
  const data = await getFileSignedUrl(req.params.id, ttl, origin);
  if (!data) return res.status(404).json({ success: false, error: 'file not found', code: 'NOT_FOUND' });
  return res.json({ success: true, data });
});

filesRouter.get('/download/:id', async (req, res) => {
  const exp = Number(req.query.exp || 0);
  const sig = String(req.query.sig || '');
  const target = await getFileDownloadUrl(req.params.id, exp, sig);
  if (!target) return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
  return res.redirect(target);
});

filesRouter.post('/:id/make-current', async (req, res) => {
  const data = await makeCurrent(req.params.id);
  if (!data) return res.status(404).json({ success: false, error: 'file not found', code: 'NOT_FOUND' });
  return res.json({ success: true, data });
});
