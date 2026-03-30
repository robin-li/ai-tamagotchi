import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { JwtPayload } from '../plugins/auth';

const initPetSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(10, 'Name must be at most 10 characters'),
});

// Helper function to generate random stats
function generateRandomStats() {
  return {
    hp: Math.floor(Math.random() * 11) + 70, // 70-80
    stamina: Math.floor(Math.random() * 41) + 30, // 30-70
    appetite: Math.floor(Math.random() * 41) + 30, // 30-70
    bodySize: Math.floor(Math.random() * 31) + 20, // 20-50
  };
}

export default async function petRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // POST /api/pet/init
  fastify.post(
    '/init',
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const user = request.user as JwtPayload;

        // Validate request body
        const validationResult = initPetSchema.safeParse(request.body);

        if (!validationResult.success) {
          return reply.status(400).send({
            error: 'Validation error',
            details: validationResult.error.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
            })),
          });
        }

        const { name } = validationResult.data;

        // Check if user already has an alive pet
        const existingPet = await prisma.pet.findFirst({
          where: {
            userId: user.userId,
            isAlive: true,
          },
        });

        if (existingPet) {
          return reply.status(400).send({
            error: 'You already have an alive pet',
          });
        }

        // Generate random stats
        const stats = generateRandomStats();

        // Create new pet
        const pet = await prisma.pet.create({
          data: {
            userId: user.userId,
            name,
            hp: stats.hp,
            stamina: stats.stamina,
            appetite: stats.appetite,
            bodySize: stats.bodySize,
            resetCount: 0,
            feedCount: 0,
            stage: 'egg',
            isAlive: true,
          },
          select: {
            id: true,
            name: true,
            hp: true,
            stamina: true,
            appetite: true,
            bodySize: true,
            resetCount: true,
            feedCount: true,
            stage: true,
            isAlive: true,
            createdAt: true,
          },
        });

        return reply.status(201).send({
          pet,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error',
        });
      }
    }
  );

  // POST /api/pet/reroll
  fastify.post(
    '/reroll',
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const user = request.user as JwtPayload;

        // Find user's current alive pet
        const existingPet = await prisma.pet.findFirst({
          where: {
            userId: user.userId,
            isAlive: true,
          },
        });

        if (!existingPet) {
          return reply.status(404).send({
            error: 'No alive pet found',
          });
        }

        // Check reset limit
        if (existingPet.resetCount >= 5) {
          return reply.status(400).send({
            error: 'Reset limit reached (maximum 5 resets)',
          });
        }

        // Check if pet has been fed
        if (existingPet.feedCount > 0) {
          return reply.status(400).send({
            error: 'Cannot reset a pet that has already been fed',
          });
        }

        // Generate new random stats
        const stats = generateRandomStats();

        // Update pet with new stats and increment resetCount
        const updatedPet = await prisma.pet.update({
          where: {
            id: existingPet.id,
          },
          data: {
            hp: stats.hp,
            stamina: stats.stamina,
            appetite: stats.appetite,
            bodySize: stats.bodySize,
            resetCount: existingPet.resetCount + 1,
          },
          select: {
            id: true,
            name: true,
            hp: true,
            stamina: true,
            appetite: true,
            bodySize: true,
            resetCount: true,
            feedCount: true,
            stage: true,
            isAlive: true,
            createdAt: true,
          },
        });

        return reply.status(200).send({
          pet: updatedPet,
          remainingResets: 5 - updatedPet.resetCount,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error',
        });
      }
    }
  );
}
