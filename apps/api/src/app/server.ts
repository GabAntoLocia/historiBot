import Fastify from 'fastify';
import { corsPlugin } from './plugins/cors.js';
import { healthRoute } from './routes/health.js';
import { assistantRoute } from './routes/assistant.js';

export const buildServer = async () => {
  const server = Fastify({ logger: true });

  await server.register(corsPlugin);

  await server.register(healthRoute);
  await server.register(assistantRoute, { prefix: '/assistant' });

  return server;
};
