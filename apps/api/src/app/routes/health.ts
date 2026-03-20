import type { FastifyPluginAsync } from 'fastify';

export const healthRoute: FastifyPluginAsync = async (server) => {
  server.get('/health', async () => ({ status: 'ok' }));
};
