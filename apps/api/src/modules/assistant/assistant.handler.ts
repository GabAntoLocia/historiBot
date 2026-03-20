import type { FastifyRequest, FastifyReply } from 'fastify';
import { assistantTurnRequestSchema } from '@historibot/shared';
import { processAssistantTurn } from './assistant.usecase.js';

export const assistantHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const parsed = assistantTurnRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      error: 'Invalid request body',
      details: parsed.error.format(),
    });
  }

  const response = await processAssistantTurn(parsed.data);
  return reply.send(response);
};
