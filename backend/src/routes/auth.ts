import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { JwtPayload } from '../plugins/auth';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export default async function authRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // POST /api/auth/register
  fastify.post('/register', async (request, reply) => {
    try {
      // Validate request body
      const validationResult = registerSchema.safeParse(request.body);

      if (!validationResult.success) {
        return reply.status(400).send({
          error: 'Validation error',
          details: validationResult.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      const { email, password } = validationResult.data;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.status(409).send({
          error: 'Email already exists',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      // Generate JWT token
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
      };

      const token = fastify.jwt.sign(payload);

      return reply.status(201).send({
        user,
        token,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
      });
    }
  });

  // POST /api/auth/login
  fastify.post('/login', async (request, reply) => {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(request.body);

      if (!validationResult.success) {
        return reply.status(400).send({
          error: 'Validation error',
          details: validationResult.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      const { email, password, rememberMe } = validationResult.data;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.status(401).send({
          error: 'Invalid email or password',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        return reply.status(401).send({
          error: 'Invalid email or password',
        });
      }

      // Generate JWT token with appropriate expiration
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
      };

      const expiresIn = rememberMe ? '30d' : '7d';
      const token = fastify.jwt.sign(payload, { expiresIn });

      return reply.status(200).send({
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
      });
    }
  });
}
