import type { FastifyPluginAsync } from 'fastify';
import { assistantHandler } from '../../modules/assistant/assistant.handler.js';

export const assistantRoute: FastifyPluginAsync = async (server) => {
  server.post('/turn', assistantHandler);
};
