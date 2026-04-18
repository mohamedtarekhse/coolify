import crypto from 'node:crypto';

import { config } from '../config.js';

function toBase64Url(input: Buffer | string) {
  const buffer = typeof input === 'string' ? Buffer.from(input) : input;
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function buildStorageObjectUrl(key: string) {
  if (!config.storagePublicBaseUrl) return null;
  return `${config.storagePublicBaseUrl.replace(/\/+$/, '')}/${key.replace(/^\/+/, '')}`;
}

export function signStorageToken(subject: string, exp: number) {
  const payload = `${subject}.${exp}`;
  return toBase64Url(crypto.createHmac('sha256', config.jwtSecret || 'dev-secret').update(payload).digest());
}

export function verifyStorageToken(subject: string, exp: number, sig: string) {
  try {
    return signStorageToken(subject, exp) === sig;
  } catch {
    return false;
  }
}
