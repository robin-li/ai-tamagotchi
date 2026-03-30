import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';

export interface JwtPayload {
  userId: string;
  email: string;
}

async function authPlugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  // T12 安全審計 H1：JWT_SECRET 最少 32 字元
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  fastify.register(fastifyJwt, {
    secret: jwtSecret,
    sign: {
      expiresIn: '7d',
    },
  });

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
}

export default fp(authPlugin);
