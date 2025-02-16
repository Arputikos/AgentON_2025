'use server'

import { encryptData } from "./utils";

export async function startDebate(prompt: string, aiApiKey: string, exaApiKey: string) {
    const aiApiKeyEncrypted = encryptData(aiApiKey);
    const exaApiKeyEncrypted = encryptData(exaApiKey);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL_HTTP}/enter-debate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_ENDPOINTS_AUTH_HEADER_KEY}`
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      ai_api_key: aiApiKeyEncrypted,
      exa_api_key: exaApiKeyEncrypted
    }),
  });

  const debateId = await response.json();
  return debateId;
}

export async function fetchDebatePDF(debateId: string) {
    // Remove any quotes from the debateId and clean it
    const cleanDebateId = debateId.replace(/['"]/g, '');
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL_HTTP}/get_pdf/${cleanDebateId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.API_ENDPOINTS_AUTH_HEADER_KEY}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    // Return the blob data as an array buffer
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}