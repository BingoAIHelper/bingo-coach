import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Generate a key from the secret and salt using PBKDF2
 */
async function getKey(secret: string, salt: Buffer): Promise<Buffer> {
  // In a browser environment, use Web Crypto API
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const key = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  return Buffer.from(key);
}

/**
 * Encrypt a message using AES-256-GCM
 */
export async function encryptMessage(message: string, secret: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = await getKey(secret, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  
  let encrypted = cipher.update(message, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();

  // Combine salt, IV, auth tag, and encrypted message
  const combined = Buffer.concat([
    salt,
    iv,
    authTag,
    Buffer.from(encrypted, 'base64')
  ]);

  return combined.toString('base64');
}

/**
 * Decrypt a message using AES-256-GCM
 */
export async function decryptMessage(encryptedMessage: string, secret: string): Promise<string> {
  const combined = Buffer.from(encryptedMessage, 'base64');

  // Extract the salt, IV, auth tag, and encrypted message
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = await getKey(secret, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Generate a random encryption key
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('base64');
}

/**
 * Verify if a message can be decrypted with the given key
 */
export async function verifyEncryption(encryptedMessage: string, secret: string): Promise<boolean> {
  try {
    await decryptMessage(encryptedMessage, secret);
    return true;
  } catch {
    return false;
  }
}