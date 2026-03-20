// Tipos del dominio para el registro de eventos favoritos.
// No conocen el proveedor HTTP ni la URL del webhook.

export interface RegistrationPayload {
  conversationId: string;
  eventTitle: string;
  userComment: string;
  timestamp: string;
}

export interface RegistrationResult {
  registered: boolean;
  conversationId: string;
  reason?: string; // presente solo si registered === false
}

export interface RegistrationPort {
  registerFavoriteEvent(payload: RegistrationPayload): Promise<RegistrationResult>;
}
