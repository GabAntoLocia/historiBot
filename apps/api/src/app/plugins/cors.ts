import type { FastifyPluginAsync } from 'fastify';

export const corsPlugin: FastifyPluginAsync = async (server) => {
  // Set CORS headers on every request via hook so they are present
  // even on error responses and are not affected by proxy behavior.
  server.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin ?? '*';
    void reply.header('Access-Control-Allow-Origin', origin);
    void reply.header('Vary', 'Origin');
    void reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    void reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (request.method === 'OPTIONS') {
      void reply.header('Access-Control-Max-Age', '86400');
      await reply.code(204).send();
    }
  });
};

