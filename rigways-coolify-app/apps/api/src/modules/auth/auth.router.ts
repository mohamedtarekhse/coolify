import { Router } from 'express';

import { requireSession } from '../../middleware/auth.js';
import { createPasswordHash, getAuthBootstrap, getMe, login } from './auth.service.js';

export const authRouter = Router();

authRouter.get('/bootstrap', (_req, res) => {
  res.json(getAuthBootstrap());
});

authRouter.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'username and password are required', code: 'VALIDATION' });
  }

  try {
    const result = await login(String(username), String(password));
    if (!result) {
      return res.status(401).json({ success: false, error: 'Unauthorized', code: 'UNAUTH' });
    }
    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('login failed', error);
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

authRouter.get('/me', requireSession, async (req, res) => {
  try {
    const me = await getMe(req.sessionUser!.id);
    if (!me) {
      return res.status(401).json({ success: false, error: 'Unauthorized', code: 'UNAUTH' });
    }
    return res.json({ success: true, data: me });
  } catch (error) {
    console.error('me failed', error);
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});

authRouter.post('/logout', (_req, res) => {
  res.json({ success: true, data: { message: 'Logged out' } });
});

authRouter.post('/hash', async (req, res) => {
  if (process.env.DISABLE_HASH_ENDPOINT === 'true') {
    return res.status(404).json({ success: false, error: 'Route not found', code: 'NOT_FOUND' });
  }

  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ success: false, error: 'password is required', code: 'VALIDATION' });
  }

  try {
    const hash = await createPasswordHash(String(password));
    return res.json({ success: true, data: { hash } });
  } catch (error) {
    console.error('hash failed', error);
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'SERVER_ERROR' });
  }
});
