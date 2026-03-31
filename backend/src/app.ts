import Fastify, { FastifyInstance } from 'fastify';
import authPlugin from './plugins/auth';
import authRoutes from './routes/auth';
import petRoutes from './routes/pet';
import configRoutes from './routes/config';
import aiRoutes from './routes/ai';

export async function build(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
  });

  // Register plugins
  await fastify.register(authPlugin);

  // Register routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(petRoutes, { prefix: '/api/pet' });
  await fastify.register(configRoutes, { prefix: '/api/config' });
  await fastify.register(aiRoutes, { prefix: '/api/ai' });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return fastify;
}
