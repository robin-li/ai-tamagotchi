import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { JwtPayload } from '../plugins/auth';
import { Stage, Prisma } from '@prisma/client';

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

// Feed event definitions
interface StatChanges {
  hp?: number;
  stamina?: number;
  appetite?: number;
  bodySize?: number;
}

interface FeedEvent {
  name: string;
  changes: StatChanges;
}

const FEED_EVENTS: Record<number, FeedEvent> = {
  2: { name: '暴食', changes: { hp: -2, bodySize: 5, appetite: 3 } },
  3: { name: '消化不良', changes: { hp: -3, stamina: -2 } },
  4: { name: '清淡飲食', changes: { hp: 2, stamina: 3 } },
  5: { name: '普通進食', changes: { hp: 2, appetite: 1 } },
  6: { name: '均衡營養', changes: { hp: 3, stamina: 2, bodySize: 1 } },
  7: { name: '正常餵食', changes: { hp: 3, stamina: 1, appetite: 1, bodySize: 1 } },
  8: { name: '高蛋白', changes: { stamina: 4, bodySize: 2 } },
  9: { name: '甜食', changes: { appetite: 4, bodySize: 3, stamina: -1 } },
  10: { name: '美食饗宴', changes: { hp: 2, stamina: 2, appetite: 2, bodySize: 2 } },
  11: { name: '營養補充', changes: { hp: 5, stamina: 3 } },
  12: { name: '神級料理', changes: { hp: 4, stamina: 4, appetite: 4, bodySize: 4 } },
};

// Clamp stat value (min 1, max 100; hp can be 0)
function clampStat(value: number, isHp: boolean): number {
  if (isHp) {
    return Math.max(0, Math.min(100, value));
  }
  return Math.max(1, Math.min(100, value));
}

// Determine stage based on feedCount
function determineStage(feedCount: number): Stage {
  if (feedCount >= 50) return 'elder';
  if (feedCount >= 30) return 'mature';
  if (feedCount >= 15) return 'growing';
  if (feedCount >= 5) return 'infant';
  return 'egg';
}

// Roll a single die (1-6)
function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
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

  // GET /api/pet
  fastify.get(
    '/',
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const user = request.user as JwtPayload;

        // Find user's current alive pet
        const pet = await prisma.pet.findFirst({
          where: {
            userId: user.userId,
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
            lastFedAt: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        // If no pet exists, return null
        if (!pet) {
          return reply.status(200).send({
            pet: null,
          });
        }

        // Calculate remaining resets and daily feed limit
        const remainingResets = 5 - pet.resetCount;
        const dailyFeedLimit = Math.floor(pet.stamina / 20) + 1;

        // Calculate today's feed count from FeedLog
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const dailyFeedCount = await prisma.feedLog.count({
          where: {
            petId: pet.id,
            createdAt: { gte: todayStart },
          },
        });

        return reply.status(200).send({
          pet: {
            ...pet,
            remainingResets,
            dailyFeedLimit,
            dailyFeedCount,
          },
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: 'Internal server error',
        });
      }
    }
  );

  // POST /api/pet/feed
  fastify.post(
    '/feed',
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const user = request.user as JwtPayload;

        // Find user's current alive pet
        const pet = await prisma.pet.findFirst({
          where: {
            userId: user.userId,
            isAlive: true,
          },
        });

        if (!pet) {
          return reply.status(404).send({
            error: 'No alive pet found',
          });
        }

        // Calculate today's feed count
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const dailyFeedCount = await prisma.feedLog.count({
          where: {
            petId: pet.id,
            createdAt: { gte: todayStart },
          },
        });

        // Check daily feed limit
        const dailyFeedLimit = Math.floor(pet.stamina / 20) + 1;
        if (dailyFeedCount >= dailyFeedLimit) {
          return reply.status(400).send({
            error: '今日餵食次數已達上限',
          });
        }

        // Roll two dice
        const dice1 = rollDie();
        const dice2 = rollDie();
        const total = dice1 + dice2;

        // Get feed event
        const feedEvent = FEED_EVENTS[total];
        const eventName = feedEvent.name;
        const statChanges = feedEvent.changes;

        // Calculate new stats
        const newHp = clampStat(pet.hp + (statChanges.hp ?? 0), true);
        const newStamina = clampStat(pet.stamina + (statChanges.stamina ?? 0), false);
        const newAppetite = clampStat(pet.appetite + (statChanges.appetite ?? 0), false);
        const newBodySize = clampStat(pet.bodySize + (statChanges.bodySize ?? 0), false);

        // Determine if pet dies and new stage
        const isDead = newHp <= 0;
        const newFeedCount = pet.feedCount + 1;
        const newStage = isDead ? pet.stage : determineStage(newFeedCount);

        // Use transaction to update Pet and create FeedLog
        const [updatedPet] = await prisma.$transaction([
          prisma.pet.update({
            where: { id: pet.id },
            data: {
              hp: newHp,
              stamina: newStamina,
              appetite: newAppetite,
              bodySize: newBodySize,
              feedCount: newFeedCount,
              stage: newStage,
              isAlive: !isDead,
              lastFedAt: new Date(),
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
              lastFedAt: true,
              createdAt: true,
              updatedAt: true,
            },
          }),
          prisma.feedLog.create({
            data: {
              petId: pet.id,
              dice1,
              dice2,
              total,
              eventName,
              statChanges: statChanges as Prisma.InputJsonValue,
            },
          }),
        ]);

        return reply.status(200).send({
          result: {
            dice1,
            dice2,
            total,
            eventName,
            statChanges,
            pet: updatedPet,
            isDead,
          },
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
