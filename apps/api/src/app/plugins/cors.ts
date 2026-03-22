import type { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../../config/env.js';

// CORS_ORIGIN can be a single origin, a comma-separated list, or "*".
const parseOrigins = (raw: string): string | string[] | boolean => {
  if (raw === '*') return true;
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
  return parts.length === 1 ? parts[0] : parts;
};

export const corsPlugin: FastifyPluginAsync = async (server) => {
  await server.register(cors, {
    origin: parseOrigins(env.CORS_ORIGIN),
  });
};
