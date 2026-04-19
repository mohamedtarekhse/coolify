import type { Express } from 'express';

import { metaRouter } from '../modules/meta/meta.router.js';
import { authRouter } from '../modules/auth/auth.router.js';
import { clientsRouter } from '../modules/clients/clients.router.js';
import { assetsRouter } from '../modules/assets/assets.router.js';
import { certificatesRouter } from '../modules/certificates/certificates.router.js';
import { filesRouter } from '../modules/files/files.router.js';
import { functionalLocationsRouter } from '../modules/functional-locations/functional-locations.router.js';
import { inspectorsRouter } from '../modules/inspectors/inspectors.router.js';
import { jobsRouter } from '../modules/jobs/jobs.router.js';
import { notificationsRouter } from '../modules/notifications/notifications.router.js';
import { pushRouter } from '../modules/push/push.router.js';
import { reportsRouter } from '../modules/reports/reports.router.js';

export function registerRoutes(app: Express) {
  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'api',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/meta', metaRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/clients', clientsRouter);
  app.use('/api/assets', assetsRouter);
  app.use('/api/certificates', certificatesRouter);
  app.use('/api/files', filesRouter);
  app.use('/api/functional-locations', functionalLocationsRouter);
  app.use('/api/inspectors', inspectorsRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/push', pushRouter);
  app.use('/api/reports', reportsRouter);
}
