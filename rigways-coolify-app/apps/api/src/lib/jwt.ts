import crypto from 'node:crypto';

type JwtPayload = Record<string, unknown>;

function toBase64Url(input: Buffer | string) {
  const buffer = typeof input === 'string' ? Buffer.from(input) : input;
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + pad, 'base64');
}

export function signJwt(payload: JwtPayload, secret: string, expiresInSeconds = 86400) {
  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = toBase64Url(JSON.stringify({ ...payload, iat: now, exp: now + expiresInSeconds }));
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest();
  return `${header}.${body}.${toBase64Url(signature)}`;
}

export function verifyJwt<T>(token: string, secret: string) {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) throw new Error('Malformed token');

  const expected = toBase64Url(
    crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest(),
  );

  if (expected !== signature) throw new Error('Invalid signature');

  const claims = JSON.parse(fromBase64Url(body).toString('utf8')) as T & { exp?: number };
  if (!claims.exp || claims.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return claims;
}
