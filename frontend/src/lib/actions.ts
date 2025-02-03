'use server'

import { encryptData } from "./utils";

export async function startDebate(prompt: string, aiApiKey: string, exaApiKey: string) {
    const aiApiKeyEncrypted = encryptData(aiApiKey);
    const exaApiKeyEncrypted = encryptData(exaApiKey);

    const response = await fetch('http://localhost:8000/enter-debate', {
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