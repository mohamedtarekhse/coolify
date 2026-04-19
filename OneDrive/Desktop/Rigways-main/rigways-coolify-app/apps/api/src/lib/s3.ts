import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { config } from '../config.js';

let client: S3Client | null = null;

function getClient() {
  if (client) return client;
  client = new S3Client({
    region: config.s3Region,
    endpoint: config.s3Endpoint || undefined,
    forcePathStyle: Boolean(config.s3Endpoint),
    credentials: config.s3AccessKeyId && config.s3SecretAccessKey
      ? {
          accessKeyId: config.s3AccessKeyId,
          secretAccessKey: config.s3SecretAccessKey,
        }
      : undefined,
  });
  return client;
}

export async function createPresignedPutUrl(key: string, contentType: string, expiresIn = 900) {
  if (!config.storageBucket) throw new Error('S3_BUCKET is not configured');
  const command = new PutObjectCommand({
    Bucket: config.storageBucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getClient(), command, { expiresIn });
}
