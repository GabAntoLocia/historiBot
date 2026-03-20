import type { z } from 'zod';
import type {
  messageSchema,
  assistantTurnRequestSchema,
  assistantTurnResponseSchema,
  toolCallResultSchema,
  toolNameSchema,
  voicebotStatusSchema,
} from '../schemas/chat.js';

export type Message = z.infer<typeof messageSchema>;
export type AssistantTurnRequest = z.infer<typeof assistantTurnRequestSchema>;
export type AssistantTurnResponse = z.infer<typeof assistantTurnResponseSchema>;
export type ToolCallResult = z.infer<typeof toolCallResultSchema>;
export type ToolName = z.infer<typeof toolNameSchema>;
export type VoicebotStatus = z.infer<typeof voicebotStatusSchema>;
