import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

import { runScheduledJobs } from './services/job-runner.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoEnvPath = path.resolve(currentDir, '../../../.env');

dotenv.config({ path: monorepoEnvPath });

const workerPort = Number(process.env.WORKER_PORT || 3010);
const intervalMs = Number(process.env.WORKER_INTERVAL_MS || 30000);
const runOnStart = process.env.WORKER_RUN_ON_START === 'true';
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

async function tick() {
  if (!hasDatabaseUrl) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        worker: 'rigways-worker',
        runAt: new Date().toISOString(),
        message: 'Skipping scheduled jobs because DATABASE_URL is not configured',
      }),
    );
    return;
  }

  try {
    const result = await runScheduledJobs();
    console.log(JSON.stringify({ level: 'info', ...result }));
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        worker: 'rigways-worker',
        runAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown worker error',
      }),
    );
  }
}

console.log(`Worker bootstrap ready on logical port ${workerPort}`);

if (runOnStart) {
  tick().catch(() => {});
}

setInterval(() => {
  tick().catch(() => {});
}, intervalMs);
