import { z } from 'zod';

export const TOOL_NAMES = [
  'search_historical_event',
  'get_historical_events',
  'register_favorite_event',
] as const;

export const toolNameSchema = z.enum(TOOL_NAMES);

export const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

export const toolCallResultSchema = z.object({
  tool: toolNameSchema,
  success: z.boolean(),
  data: z.unknown().optional(),
});

export const assistantTurnRequestSchema = z.object({
  message: z.string().min(1),
  history: z.array(messageSchema).default([]),
});

export const assistantTurnResponseSchema = z.object({
  reply: z.string(),
  toolCall: toolCallResultSchema.nullable().default(null),
});

export const voicebotStatusSchema = z.enum([
  'idle',
  'listening',
  'transcribing',
  'thinking',
  'speaking',
  'error',
]);
