import { Router } from 'express';

import { requireRole, requireSession } from '../../middleware/auth.js';
import { createClientRecord, getClient, getClients, patchClientRecord, softDeleteClient } from './clients.service.js';

export const clientsRouter = Router();

clientsRouter.use(requireSession);
clientsRouter.use(requireRole(['admin']));

clientsRouter.get('/', async (req, res) => {
  try {
    const data = await getClients(new URLSearchParams(req.query as Record<string, string>));
    res.json({ success: true, data });
  } catch (error) {
    console.error('list clients failed', error);
    res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

clientsRouter.get('/:id', async (req, res) => {
  try {
    const client = await getClient(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found', code: 'NOT_FOUND' });
    }
    return res.json({ success: true, data: client });
  } catch (error) {
    console.error('get client failed', error);
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

clientsRouter.post('/', async (req, res) => {
  try {
    const client = await createClientRecord(req.body || {});
    return res.status(201).json({ success: true, data: client });
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

clientsRouter.patch('/:id', async (req, res) => {
  try {
    const client = await patchClientRecord(req.params.id, req.body || {});
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found', code: 'NOT_FOUND' });
    }
    return res.json({ success: true, data: client });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

clientsRouter.delete('/:id', async (req, res) => {
  try {
    const client = await softDeleteClient(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found', code: 'NOT_FOUND' });
    }
    return res.json({ success: true, data: { id: client.id, status: client.status } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});
