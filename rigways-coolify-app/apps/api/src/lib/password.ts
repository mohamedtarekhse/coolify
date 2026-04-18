import crypto from 'node:crypto';

const ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = await pbkdf2(password, salt);
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [scheme, roundsRaw, salt, hash] = String(storedHash || '').split('$');
  if (scheme !== 'pbkdf2' || !roundsRaw || !salt || !hash) return false;
  const iterations = Number(roundsRaw);
  const candidate = await pbkdf2(password, salt, iterations);
  return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'));
}

function pbkdf2(password: string, salt: string, iterations = ITERATIONS) {
  return new Promise<string>((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, KEY_LENGTH, DIGEST, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(derivedKey.toString('hex'));
    });
  });
}
