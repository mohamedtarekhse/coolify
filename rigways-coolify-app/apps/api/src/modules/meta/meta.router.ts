import { Router } from 'express';

import { getMetaPayload } from './meta.service.js';

export const metaRouter = Router();

metaRouter.get('/', (_req, res) => {
  res.json(getMetaPayload());
});
