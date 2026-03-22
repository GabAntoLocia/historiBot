import type { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';
import { env } from '../../config/env.js';

// Parse CORS_ORIGIN into a normalized set of allowed origins.
const buildAllowedOrigins = (raw: string): Set<string> | '*' => {
  if (raw.trim() === '*') return '*';
  const origins = raw.split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);
  return new Set(origins);
};

export const corsPlugin: FastifyPluginAsync = async (server) => {
  const allowed = buildAllowedOrigins(env.CORS_ORIGIN);

  await server.register(cors, {
    origin: (origin, cb) => {
      // Allow server-to-server / non-browser requests
      if (!origin) return cb(null, true);
      if (allowed === '*') return cb(null, true);
      // Normalize incoming origin (strip trailing slash)
      const normalized = origin.replace(/\/$/, '');
      if (allowed.has(normalized)) return cb(null, true);
      cb(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });
};
