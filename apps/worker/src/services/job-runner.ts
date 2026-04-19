import { processExpiryChecks } from './expiry-processor.js';

export async function runScheduledJobs() {
  const result = await processExpiryChecks();
  return {
    worker: 'rigways-worker',
    runAt: new Date().toISOString(),
    expiry: result,
  };
}
