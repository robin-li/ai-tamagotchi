import { FastifyInstance } from 'fastify';

// Mock prisma - 定義 mock 物件
const mockPrismaFunctions = {
  pet: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  feedLog: {
    count: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

jest.mock('../../lib/prisma', () => ({
  prisma: mockPrismaFunctions,
}));

// 現在可以安全地 import
import { build } from '../../app';

const mockPrisma = mockPrismaFunctions;

// Mock pet 資料
const mockPet = {
  id: 'pet-1',
  userId: 'user-1',
  name: '測試雞',
  hp: 75,
  stamina: 50,
  appetite: 50,
  bodySize: 30,
  resetCount: 0,
  feedCount: 0,
  stage: 'egg' as const,
  isAlive: true,
  lastFedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Pet Routes', () => {
  let app: FastifyInstance;
  let token: string;

  beforeAll(async () => {
    app = await build();
    await app.ready();
    // 直接用 jwt.sign 產生測試用 token，不走 register/login 流程
    token = app.jwt.sign(
      { userId: 'user-1', email: 'test@example.com' },
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // 重設 pet mock 的預設值
    mockPrisma.pet.findFirst.mockResolvedValue(mockPet);
    mockPrisma.pet.create.mockResolvedValue(mockPet);
    mockPrisma.pet.update.mockResolvedValue({ ...mockPet, hp: 78 });
    mockPrisma.feedLog.count.mockResolvedValue(0);
    mockPrisma.feedLog.create.mockResolvedValue({});
    mockPrisma.$transaction.mockImplementation((callbacks: any[]) => {
      return Promise.all(callbacks);
    });
  });

  describe('POST /api/pet/init', () => {
    it('應該成功建立新寵物', async () => {
      mockPrisma.pet.findFirst.mockResolvedValueOnce(null);
      mockPrisma.pet.create.mockResolvedValueOnce(mockPet);

      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/init',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          name: '測試雞',
        },
      });

      expect(response.statusCode).toBe(201);
      const data = JSON.parse(response.body);
      expect(data.pet).toBeDefined();
      expect(data.pet.name).toBe('測試雞');
      expect(mockPrisma.pet.create).toHaveBeenCalled();
    });

    it('應該拒絕名稱太短的寵物', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/init',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          name: 'A',
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.error).toBe('Validation error');
    });

    it('應該拒絕已有活著寵物的用戶', async () => {
      mockPrisma.pet.findFirst.mockResolvedValueOnce(mockPet);

      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/init',
        headers: {
          authorization: `Bearer ${token}`,
        },
        payload: {
          name: '測試雞2',
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.error).toBe('You already have an alive pet');
    });

    it('應該拒絕未授權的請求', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/init',
        payload: {
          name: '測試雞',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/pet', () => {
    it('應該返回用戶的寵物資訊', async () => {
      mockPrisma.pet.findFirst.mockResolvedValueOnce(mockPet);
      mockPrisma.feedLog.count.mockResolvedValueOnce(0);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pet',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.pet).toBeDefined();
      expect(data.pet.name).toBe('測試雞');
      expect(data.pet.remainingResets).toBe(5);
      expect(data.pet.dailyFeedLimit).toBe(3); // floor(50/20) + 1
      expect(data.pet.dailyFeedCount).toBe(0);
    });

    it('應該返回 null 當用戶沒有寵物', async () => {
      mockPrisma.pet.findFirst.mockResolvedValueOnce(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/pet',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.pet).toBeNull();
    });

    it('應該拒絕未授權的請求', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pet',
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/pet/reroll', () => {
    it('應該成功重置寵物屬性', async () => {
      const petNotFed = { ...mockPet, feedCount: 0, resetCount: 0 };
      mockPrisma.pet.findFirst.mockResolvedValueOnce(petNotFed);
      mockPrisma.pet.update.mockResolvedValueOnce({
        ...petNotFed,
        resetCount: 1,
        hp: 72,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/reroll',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.pet).toBeDefined();
      expect(data.remainingResets).toBe(4);
      expect(mockPrisma.pet.update).toHaveBeenCalled();
    });

    it('應該拒絕已餵食的寵物重置', async () => {
      const fedPet = { ...mockPet, feedCount: 5 };
      mockPrisma.pet.findFirst.mockResolvedValueOnce(fedPet);

      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/reroll',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.error).toBe('Cannot reset a pet that has already been fed');
    });

    it('應該拒絕達到重置上限的寵物', async () => {
      const maxResetPet = { ...mockPet, feedCount: 0, resetCount: 5 };
      mockPrisma.pet.findFirst.mockResolvedValueOnce(maxResetPet);

      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/reroll',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.error).toBe('Reset limit reached (maximum 5 resets)');
    });

    it('應該返回 404 當沒有寵物', async () => {
      mockPrisma.pet.findFirst.mockResolvedValueOnce(null);

      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/reroll',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(404);
      const data = JSON.parse(response.body);
      expect(data.error).toBe('No alive pet found');
    });
  });

  describe('POST /api/pet/feed', () => {
    it('應該成功餵食寵物', async () => {
      mockPrisma.pet.findFirst.mockResolvedValueOnce(mockPet);
      mockPrisma.feedLog.count.mockResolvedValueOnce(0);

      const fedPet = {
        ...mockPet,
        hp: 78,
        feedCount: 1,
        lastFedAt: new Date(),
      };
      mockPrisma.$transaction.mockResolvedValueOnce([fedPet, {}]);

      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/feed',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.result).toBeDefined();
      expect(data.result.dice1).toBeGreaterThanOrEqual(1);
      expect(data.result.dice1).toBeLessThanOrEqual(6);
      expect(data.result.dice2).toBeGreaterThanOrEqual(1);
      expect(data.result.dice2).toBeLessThanOrEqual(6);
      expect(data.result.eventName).toBeDefined();
      expect(data.result.pet).toBeDefined();
    });

    it('應該拒絕超過每日餵食上限的請求', async () => {
      mockPrisma.pet.findFirst.mockResolvedValueOnce(mockPet);
      mockPrisma.feedLog.count.mockResolvedValueOnce(3); // 已達上限

      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/feed',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(400);
      const data = JSON.parse(response.body);
      expect(data.error).toBe('今日餵食次數已達上限');
    });

    it('應該返回 404 當沒有寵物', async () => {
      mockPrisma.pet.findFirst.mockResolvedValueOnce(null);

      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/feed',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(response.statusCode).toBe(404);
      const data = JSON.parse(response.body);
      expect(data.error).toBe('No alive pet found');
    });

    it('應該拒絕未授權的請求', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pet/feed',
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
