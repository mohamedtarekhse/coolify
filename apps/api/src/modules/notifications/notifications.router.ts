import { Router } from 'express';

import { requireSession } from '../../middleware/auth.js';
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  patchNotificationRecord,
  removeNotification,
} from './notifications.service.js';

export const notificationsRouter = Router();

notificationsRouter.use(requireSession);

notificationsRouter.get('/unread-count', async (req, res) => {
  try {
    const data = await getUnreadCount(req.sessionUser!.id);
    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

notificationsRouter.post('/mark-all-read', async (req, res) => {
  try {
    const data = await markAllRead(req.sessionUser!.id);
    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

notificationsRouter.get('/', async (req, res) => {
  try {
    const data = await getNotifications(req.sessionUser!.id, new URLSearchParams(req.query as Record<string, string>));
    return res.json({ success: true, data });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

notificationsRouter.patch('/:id', async (req, res) => {
  try {
    const result = await patchNotificationRecord(req.params.id, req.sessionUser!.id, req.body || {});
    if (result === 'FORBIDDEN') return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    if (!result) return res.status(404).json({ success: false, error: 'Notification not found', code: 'NOT_FOUND' });
    return res.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ success: false, error: error.message, code: 'VALIDATION' });
    }
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

notificationsRouter.delete('/:id', async (req, res) => {
  try {
    const result = await removeNotification(req.params.id, req.sessionUser!.id);
    if (result === 'FORBIDDEN') return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
    if (!result) return res.status(404).json({ success: false, error: 'Notification not found', code: 'NOT_FOUND' });
    return res.json({ success: true, data: result });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});
