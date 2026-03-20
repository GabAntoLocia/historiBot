import type { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../../config/env.js';

export const corsPlugin: FastifyPluginAsync = async (server) => {
  await server.register(cors, {
    origin: env.CORS_ORIGIN,
  });
};
