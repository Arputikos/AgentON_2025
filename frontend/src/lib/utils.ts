import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY ?? ''; // 32 bajty (hex)
const SECRET_KEY_IV = process.env.SECRET_KEY_IV ?? '';   // 16 bajtów (hex)

// Color palette for speakers - 7 kolorów max. ilość speakerów to 7
const SPEAKER_COLORS = [
  'rgba(255, 99, 132, 0.8)',   // soft red
  'rgba(54, 162, 235, 0.8)',   // soft blue
  'rgba(255, 206, 86, 0.8)',   // soft yellow
  'rgba(63, 191, 127, 0.8)',   // soft green
  'rgba(255, 159, 64, 0.8)',   // soft orange
  'rgba(153, 102, 255, 0.8)',  // soft purple
  'rgba(75, 192, 192, 0.8)',   // soft teal
];

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

export function calculatePosition(index: number, total: number) {
  const angle = (index * 2 * Math.PI / total) - Math.PI / 2;
  const radius = 37.5;
  const top = `${50 + radius * Math.sin(angle)}%`;
  const left = `${50 + radius * Math.cos(angle)}%`;
  
  return {
    top,
    left,
    transform: `translate(-50%, -50%)`
  };
}

export function assignSpeakerColor(index: number): string {
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
}

// export function getActiveSpeakerStyle(isActive: boolean) {
//   return {
//     transform: `translate(-50%, -50%) scale(${isActive ? 1.1 : 1})`,
//     transition: 'transform 0.3s ease-in-out',
//     boxShadow: isActive ? '0 0 20px rgba(0,0,0,0.2)' : 'none'
//   };
// }

export function showSpeakerNotification(name: string, backgroundColor: string) {
  return {
    message: `${name} joined the debate!`,
    duration: 3000,
    position: 'top-center' as const,
    style: {
      background: backgroundColor,
      color: '#fff',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '1.1rem',
      textAlign: 'center' as const,
      maxWidth: '400px',
      margin: '0 auto'
    }
  };
}

export function createMessageStream(
  message: string,
  onWordUpdate: (currentText: string) => void,
  speed: number = 50 // milliseconds per word
): Promise<void> {
  return new Promise((resolve) => {
    const words = message.split(' ');
    let currentIndex = 0;
    let currentText = '';

    const streamInterval = setInterval(() => {
      if (currentIndex >= words.length) {
        clearInterval(streamInterval);
        resolve();
        return;
      }

      currentText += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
      onWordUpdate(currentText);
      currentIndex++;
    }, speed);
  });
}