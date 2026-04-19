import { Router } from 'express';

import { requireRole, requireSession } from '../../middleware/auth.js';
import {
  createFunctionalLocationRecord,
  getFunctionalLocation,
  getFunctionalLocations,
  patchFunctionalLocationRecord,
  removeFunctionalLocation,
} from './functional-locations.service.js';

export const functionalLocationsRouter = Router();

functionalLocationsRouter.use(requireSession);

functionalLocationsRouter.get('/', async (req, res) => {
  try {
    const isAdminOrManager = ['admin', 'manager'].includes(req.sessionUser!.role);
    const data = await getFunctionalLocations(
      new URLSearchParams(req.query as Record<string, string>),
      req.sessionUser!.customerId,
      isAdminOrManager,
    );
    if (!isAdminOrManager && !req.sessionUser!.customerId) {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    }
    return res.json({ success: true, data });
  } catch (error) {
    console.error('list functional locations failed', error);
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

functionalLocationsRouter.get('/:id', async (req, res) => {
  try {
    const location = await getFunctionalLocation(String(req.params.id));
    if (!location) {
      return res.status(404).json({ success: false, error: 'Functional Location not found', code: 'NOT_FOUND' });
    }
    const isAdminOrManager = ['admin', 'manager'].includes(req.sessionUser!.role);
    if (!isAdminOrManager && req.sessionUser!.customerId !== location.clientId) {
      return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    }
    return res.json({ success: true, data: location });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

functionalLocationsRouter.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const created = await createFunctionalLocationRecord(req.body || {});
    return res.status(201).json({ success: true, data: created });
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

functionalLocationsRouter.patch('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const updated = await patchFunctionalLocationRecord(String(req.params.id), req.body || {});
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Functional Location not found', code: 'NOT_FOUND' });
    }
    return res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

functionalLocationsRouter.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const removed = await removeFunctionalLocation(String(req.params.id));
    if (!removed) {
      return res.status(404).json({ success: false, error: 'Functional Location not found', code: 'NOT_FOUND' });
    }
    return res.json({ success: true, data: { id: removed.id, deleted: true } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});
