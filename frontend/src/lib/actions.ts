'use server'

import { createHmac } from "crypto";

export async function startDebate(prompt: string, aiApiKey: string, exaApiKey: string) {
    const encryptionKey = process.env.ENCRYPTION_KEY;
    console.log(encryptionKey);
    if(!encryptionKey)
      throw new Error("Set encryption key first!");

    const aiApiKeyEncrypted = aiApiKey;
    const exaApiKeyEncrypted = exaApiKey;//createHmac('sha256', encryptionKey).update(exaApiKey).digest('hex');
    console.log(aiApiKeyEncrypted);
    console.log(exaApiKeyEncrypted);

    const response = await fetch('http://localhost:8000/enter-debate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      ai_api_key: aiApiKeyEncrypted.trim(),
      exa_api_key: exaApiKeyEncrypted.trim()
    }),
  });

  const debateId = await response.json();
  return debateId;
}