import Fastify from 'fastify';
import { healthRoute } from './routes/health.js';
import { assistantRoute } from './routes/assistant.js';

export const buildServer = async () => {
  const server = Fastify({ logger: true });

  // CORS headers on every response — registered at root scope so they
  // apply to ALL routes regardless of plugin encapsulation.
  server.addHook('onSend', async (_req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  });

  // Handle OPTIONS preflight at root level.
  server.options('*', async (_req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    reply.header('Access-Control-Max-Age', '86400');
    return reply.code(204).send();
  });

  await server.register(healthRoute);
  await server.register(assistantRoute, { prefix: '/assistant' });

  return server;
};
