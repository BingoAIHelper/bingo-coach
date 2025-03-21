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
  try {
    // Generate a random salt and IV
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);

    // Generate key from secret and salt
    const key = await getKey(secret, salt);

    // Create cipher
    const cipher = createCipheriv(ALGORITHM, key, iv);

    // Encrypt the message
    const encrypted = Buffer.concat([
      cipher.update(message, 'utf8'),
      cipher.final()
    ]);

    // Get the auth tag
    const tag = cipher.getAuthTag();

    // Combine all components
    const result = Buffer.concat([salt, iv, tag, encrypted]);

    // Return as base64 string
    return result.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message using AES-256-GCM
 */
export async function decryptMessage(encryptedMessage: string, secret: string): Promise<string> {
  try {
    // Convert base64 string back to buffer
    const buffer = Buffer.from(encryptedMessage, 'base64');

    // Extract components
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Generate key from secret and salt
    const key = await getKey(secret, salt);

    // Create decipher
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt the message
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
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