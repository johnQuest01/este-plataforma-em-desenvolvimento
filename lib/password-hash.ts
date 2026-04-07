import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

export function hashPlainPassword(plainPassword: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(plainPassword, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPlainPasswordAgainstHash(
  plainPassword: string,
  storedPasswordHash: string
): boolean {
  const [salt, storedKeyHex] = storedPasswordHash.split(':');
  if (!salt || !storedKeyHex) {
    return false;
  }

  const storedKey = Buffer.from(storedKeyHex, 'hex');
  const derivedKey = scryptSync(plainPassword, salt, storedKey.length);
  return timingSafeEqual(storedKey, derivedKey);
}
