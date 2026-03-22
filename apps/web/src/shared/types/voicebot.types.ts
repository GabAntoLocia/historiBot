import type { Message, VoicebotStatus } from '@historibot/shared';

export interface LocalMessage extends Message {
  id: string;
  timestamp: number;
  savedAsFavorite?: boolean;
}

export type { VoicebotStatus };
