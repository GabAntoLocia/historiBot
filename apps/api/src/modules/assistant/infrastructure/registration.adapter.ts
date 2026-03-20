import { httpPost, HttpError } from '../../../lib/http-client.js';
import { env } from '../../../config/env.js';
import type { RegistrationPort, RegistrationPayload, RegistrationResult } from '../domain/registration.port.js';

// Implementación del puerto de registro.
// Envía el payload a un webhook configurable (RequestBin, Pipedream, Make, etc.)
// NUNCA lanza: captura errores HTTP y los normaliza en RegistrationResult
// para que el assistant pueda siempre dar una respuesta útil al usuario.
export const registrationAdapter: RegistrationPort = {
  async registerFavoriteEvent(payload: RegistrationPayload): Promise<RegistrationResult> {
    try {
      await httpPost(
        env.REGISTER_WEBHOOK_URL,
        {
          ...payload,
          source: 'historibot',
        },
      );

      return { registered: true, conversationId: payload.conversationId };
    } catch (err) {
      const reason =
        err instanceof HttpError
          ? `Webhook respondió con HTTP ${err.status}`
          : 'Webhook no disponible';

      console.warn(`[registration] Error al registrar evento favorito: ${reason}`, err);

      // Retorno degradado — el assistant sabrá que no se pudo registrar
      // pero el flujo no se interrumpe
      return { registered: false, conversationId: payload.conversationId, reason };
    }
  },
};
