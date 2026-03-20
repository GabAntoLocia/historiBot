import { env } from './config/env.js';
import { buildServer } from './app/server.js';

const start = async () => {
  const server = await buildServer();

  try {
    await server.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

