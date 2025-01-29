import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY ?? ''; // 32 bajty (hex)
const SECRET_KEY_IV = process.env.SECRET_KEY_IV ?? '';   // 16 bajtów (hex)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encryptData(text: string): string {
  if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not set');
  }
  if (!SECRET_KEY_IV) {
    throw new Error('SECRET_KEY is not set');
  }
  const ALGORITHM = 'aes-256-cbc';

  const key = Buffer.from(SECRET_KEY, 'hex');
  const iv = Buffer.from(SECRET_KEY_IV, 'hex');

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}