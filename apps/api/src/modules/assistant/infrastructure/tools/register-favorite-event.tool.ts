import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { registrationAdapter } from '../registration.adapter.js';

// Esquema de validación de los args que Gemini provee.
// conversationId y timestamp son internos — no se exponen a Gemini.
const argsSchema = z.object({
  eventTitle: z.string().min(1, 'eventTitle es obligatorio'),
  userComment: z.string().min(1, 'userComment es obligatorio'),
});

// Ejemplo del payload enviado al webhook:
// {
//   "conversationId": "b3d7a2f1-1e7d-4f56-a789-0123456789ab",
//   "eventTitle": "Battle of Waterloo",
//   "userComment": "El usuario quiso saber más sobre la derrota de Napoleón en 1815",
//   "timestamp": "2026-03-20T12:34:56.789Z",
//   "source": "historibot"
// }

export const registerFavoriteEvent = async (
  rawArgs: Record<string, unknown>,
): Promise<unknown> => {
  const parsed = argsSchema.safeParse(rawArgs);

  if (!parsed.success) {
    // Error de contrato — informamos a Gemini para que corrija los args
    throw new Error(
      `Argumentos inválidos para register_favorite_event: ${parsed.error.message}`,
    );
  }

  const { eventTitle, userComment } = parsed.data;

  return registrationAdapter.registerFavoriteEvent({
    conversationId: randomUUID(),
    eventTitle,
    userComment,
    timestamp: new Date().toISOString(),
  });
};
