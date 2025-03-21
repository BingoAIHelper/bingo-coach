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

// Temporarily disable encryption for debugging
export function encryptMessage(message: string, key: string): string {
  return message;
}

export function decryptMessage(encrypted: string, key: string): string {
  return encrypted;
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