import type { AssistantTurnRequest, AssistantTurnResponse } from '@historibot/shared';

// In development Vite proxies /api → localhost:3001.
// In production set VITE_API_URL to the deployed API base URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export async function sendTurn(
  request: AssistantTurnRequest,
): Promise<AssistantTurnResponse> {
  const response = await fetch(`${BASE_URL}/assistant/turn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Error desconocido');
    throw new Error(`API ${response.status}: ${text}`);
  }

  return response.json() as Promise<AssistantTurnResponse>;
}
