import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoEnvPath = path.resolve(currentDir, '../../../.env');

dotenv.config({ path: monorepoEnvPath });

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.API_PORT || process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  webAppUrl: process.env.WEB_APP_URL || 'http://localhost:5173',
  storagePublicBaseUrl: process.env.S3_PUBLIC_BASE_URL || '',
  storageBucket: process.env.S3_BUCKET || '',
  s3Endpoint: process.env.S3_ENDPOINT || '',
  s3Region: process.env.S3_REGION || 'us-east-1',
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID || '',
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
};
