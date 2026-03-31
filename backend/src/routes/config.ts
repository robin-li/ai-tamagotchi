import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PERSONALITIES } from '../lib/personalities';

// Personalities configuration - format for frontend
const personalities = PERSONALITIES.map((p) => ({
  id: p.id,
  name: p.name,
  emoji: p.emoji,
  description: p.description,
}));

// Stats configuration
const stats = {
  hp: { min: 1, max: 100, initial: { min: 70, max: 80 } },
  stamina: { min: 1, max: 100, initial: { min: 30, max: 70 } },
  appetite: { min: 1, max: 100, initial: { min: 30, max: 70 } },
  bodySize: { min: 1, max: 100, initial: { min: 20, max: 50 } },
};

// Stages configuration
const stages = [
  { key: 'egg', name: '蛋', minFeedCount: 0 },
  { key: 'infant', name: '幼兒', minFeedCount: 5 },
  { key: 'growing', name: '成長', minFeedCount: 15 },
  { key: 'mature', name: '成熟', minFeedCount: 30 },
  { key: 'elder', name: '老年', minFeedCount: 50 },
];

// Feed events configuration
const feedEvents = {
  '2': { name: '暴食', effects: { hp: -2, bodySize: 5, appetite: 3 } },
  '3': { name: '消化不良', effects: { hp: -3, stamina: -2 } },
  '4': { name: '清淡飲食', effects: { hp: 2, stamina: 3 } },
  '5': { name: '普通進食', effects: { hp: 2, appetite: 1 } },
  '6': {
    name: '均衡營養',
    effects: { hp: 3, stamina: 2, bodySize: 1 },
  },
  '7': {
    name: '正常餵食',
    effects: { hp: 3, stamina: 1, appetite: 1, bodySize: 1 },
  },
  '8': { name: '高蛋白', effects: { stamina: 4, bodySize: 2 } },
  '9': {
    name: '甜食',
    effects: { appetite: 4, bodySize: 3, stamina: -1 },
  },
  '10': {
    name: '美食饗宴',
    effects: { hp: 2, stamina: 2, appetite: 2, bodySize: 2 },
  },
  '11': { name: '營養補充', effects: { hp: 5, stamina: 3 } },
  '12': {
    name: '神級料理',
    effects: { hp: 4, stamina: 4, appetite: 4, bodySize: 4 },
  },
};

// Decay rules configuration
const decayRules = [
  { hours: 2, effects: { hp: -2, stamina: -1 } },
  { hours: 4, effects: { hp: -3, stamina: -2, appetite: -2 } },
  {
    hours: 8,
    effects: { hp: -5, stamina: -3, appetite: -3, bodySize: -1 },
  },
  { hours: 12, effects: { hp: -8 } },
];

export default async function configRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // GET /api/config - Public endpoint, no authentication required
  fastify.get('/', async (_request, reply) => {
    try {
      return reply.status(200).send({
        personalities,
        stats,
        stages,
        feedEvents,
        decayRules,
        name: 'ai-tamagotchi',
        version: '1.0.0',
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Internal server error',
      });
    }
  });
}
