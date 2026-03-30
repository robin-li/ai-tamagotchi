/**
 * 完整流程整合測試
 *
 * 使用 supertest 對 Fastify app 發送真實 HTTP 請求，
 * 透過 mock Prisma 層驗證完整 API 流程。
 */

// ─── Mock Prisma (must be before imports) ───
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  pet: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  feedLog: {
    count: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
};

jest.mock('../lib/prisma', () => ({
  prisma: mockPrisma,
}));

import supertest from 'supertest';
import { build } from '../app';
import bcrypt from 'bcryptjs';

process.env.JWT_SECRET = 'test-secret-key-for-integration';
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

const TEST_PASSWORD = 'Test1234!';
const TEST_EMAIL = 'flow-test@example.com';
const TEST_USER_ID = 'user-uuid-001';
const TEST_PET_ID = 'pet-uuid-001';

describe('完整流程整合測試', () => {
  let app: Awaited<ReturnType<typeof build>>;
  let authToken: string;
  let hashedPassword: string;

  beforeAll(async () => {
    app = await build();
    await app.ready();
    hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Test 1: 註冊新用戶 ───
  test('POST /api/auth/register - 註冊新用戶', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      createdAt: new Date().toISOString(),
    });

    const res = await supertest(app.server)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .expect(201);

    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(TEST_EMAIL);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user).toHaveProperty('createdAt');

    authToken = res.body.token;
  });

  // ─── Test 2: 重複註冊應失敗 ───
  test('POST /api/auth/register - 重複 email 應回傳 409', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: TEST_USER_ID,
      email: TEST_EMAIL,
    });

    const res = await supertest(app.server)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .expect(409);

    expect(res.body.error).toBe('Email already exists');
  });

  // ─── Test 3: 登入成功 ───
  test('POST /api/auth/login - 登入成功', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      passwordHash: hashedPassword,
    });

    const res = await supertest(app.server)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(TEST_EMAIL);

    authToken = res.body.token;
  });

  // ─── Test 4: 錯誤密碼登入 ───
  test('POST /api/auth/login - 錯誤密碼應回傳 401', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      passwordHash: hashedPassword,
    });

    const res = await supertest(app.server)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPassword!' })
      .expect(401);

    expect(res.body.error).toBe('Invalid email or password');
  });

  // ─── Test 5: 未認證存取應失敗 ───
  test('GET /api/pet - 未帶 token 應回傳 401', async () => {
    await supertest(app.server)
      .get('/api/pet')
      .expect(401);
  });

  // ─── Test 6: 初始化寵物 ───
  test('POST /api/pet/init - 建立電子雞', async () => {
    // Ensure we have a valid token
    mockPrisma.user.findUnique.mockResolvedValue({
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      passwordHash: hashedPassword,
    });
    const loginRes = await supertest(app.server)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    authToken = loginRes.body.token;

    mockPrisma.pet.findFirst.mockResolvedValue(null); // no existing pet
    mockPrisma.pet.create.mockResolvedValue({
      id: TEST_PET_ID,
      name: '小雞',
      hp: 75,
      stamina: 50,
      appetite: 40,
      bodySize: 30,
      resetCount: 0,
      feedCount: 0,
      stage: 'egg',
      isAlive: true,
      createdAt: new Date().toISOString(),
    });

    const res = await supertest(app.server)
      .post('/api/pet/init')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '小雞' })
      .expect(201);

    expect(res.body).toHaveProperty('pet');
    const pet = res.body.pet;
    expect(pet.name).toBe('小雞');
    expect(pet.stage).toBe('egg');
    expect(pet.isAlive).toBe(true);
    expect(pet.feedCount).toBe(0);
    expect(pet.resetCount).toBe(0);
  });

  // ─── Test 7: 不能重複建立寵物 ───
  test('POST /api/pet/init - 已有寵物應回傳 400', async () => {
    mockPrisma.pet.findFirst.mockResolvedValue({
      id: TEST_PET_ID,
      isAlive: true,
    });

    const res = await supertest(app.server)
      .post('/api/pet/init')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '小雞二' })
      .expect(400);

    expect(res.body.error).toBe('You already have an alive pet');
  });

  // ─── Test 8: 查詢寵物狀態 ───
  test('GET /api/pet - 查詢寵物狀態', async () => {
    mockPrisma.pet.findFirst.mockResolvedValue({
      id: TEST_PET_ID,
      name: '小雞',
      hp: 75,
      stamina: 50,
      appetite: 40,
      bodySize: 30,
      resetCount: 0,
      feedCount: 0,
      stage: 'egg',
      isAlive: true,
      lastFedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockPrisma.feedLog.count.mockResolvedValue(0);

    const res = await supertest(app.server)
      .get('/api/pet')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('pet');
    const pet = res.body.pet;
    expect(pet.name).toBe('小雞');
    expect(pet.isAlive).toBe(true);
    expect(pet).toHaveProperty('remainingResets');
    expect(pet).toHaveProperty('dailyFeedLimit');
    expect(pet).toHaveProperty('dailyFeedCount');
    expect(pet.remainingResets).toBe(5);
    expect(pet.dailyFeedLimit).toBe(3); // floor(50/20) + 1
    expect(pet.dailyFeedCount).toBe(0);
  });

  // ─── Test 9: Reroll 寵物屬性 ───
  test('POST /api/pet/reroll - 重骰屬性', async () => {
    mockPrisma.pet.findFirst.mockResolvedValue({
      id: TEST_PET_ID,
      name: '小雞',
      hp: 75,
      stamina: 50,
      appetite: 40,
      bodySize: 30,
      resetCount: 0,
      feedCount: 0,
      stage: 'egg',
      isAlive: true,
    });
    mockPrisma.pet.update.mockResolvedValue({
      id: TEST_PET_ID,
      name: '小雞',
      hp: 78,
      stamina: 60,
      appetite: 35,
      bodySize: 25,
      resetCount: 1,
      feedCount: 0,
      stage: 'egg',
      isAlive: true,
      createdAt: new Date().toISOString(),
    });

    const res = await supertest(app.server)
      .post('/api/pet/reroll')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('pet');
    expect(res.body).toHaveProperty('remainingResets');
    expect(res.body.pet.resetCount).toBe(1);
    expect(res.body.remainingResets).toBe(4);
  });

  // ─── Test 10: Reroll 次數上限 ───
  test('POST /api/pet/reroll - 超過 5 次應失敗', async () => {
    mockPrisma.pet.findFirst.mockResolvedValue({
      id: TEST_PET_ID,
      resetCount: 5,
      feedCount: 0,
      isAlive: true,
    });

    const res = await supertest(app.server)
      .post('/api/pet/reroll')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);

    expect(res.body.error).toBe('Reset limit reached (maximum 5 resets)');
  });

  // ─── Test 11: 餵食寵物 ───
  test('POST /api/pet/feed - 餵食電子雞', async () => {
    mockPrisma.pet.findFirst.mockResolvedValue({
      id: TEST_PET_ID,
      name: '小雞',
      hp: 75,
      stamina: 50,
      appetite: 40,
      bodySize: 30,
      resetCount: 0,
      feedCount: 0,
      stage: 'egg',
      isAlive: true,
    });
    mockPrisma.feedLog.count.mockResolvedValue(0); // no feeds today

    const updatedPet = {
      id: TEST_PET_ID,
      name: '小雞',
      hp: 78,
      stamina: 51,
      appetite: 41,
      bodySize: 31,
      resetCount: 0,
      feedCount: 1,
      stage: 'egg',
      isAlive: true,
      lastFedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPrisma.$transaction.mockResolvedValue([updatedPet, {}]);

    const res = await supertest(app.server)
      .post('/api/pet/feed')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('result');
    const result = res.body.result;
    expect(result).toHaveProperty('dice1');
    expect(result).toHaveProperty('dice2');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('eventName');
    expect(result).toHaveProperty('statChanges');
    expect(result).toHaveProperty('pet');
    expect(result).toHaveProperty('isDead');

    expect(result.dice1).toBeGreaterThanOrEqual(1);
    expect(result.dice1).toBeLessThanOrEqual(6);
    expect(result.dice2).toBeGreaterThanOrEqual(1);
    expect(result.dice2).toBeLessThanOrEqual(6);
    expect(result.total).toBe(result.dice1 + result.dice2);
    expect(result.pet.feedCount).toBe(1);
  });

  // ─── Test 12: 餵食後不能 reroll ───
  test('POST /api/pet/reroll - 餵食後重骰應失敗', async () => {
    mockPrisma.pet.findFirst.mockResolvedValue({
      id: TEST_PET_ID,
      resetCount: 1,
      feedCount: 1,
      isAlive: true,
    });

    const res = await supertest(app.server)
      .post('/api/pet/reroll')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);

    expect(res.body.error).toBe('Cannot reset a pet that has already been fed');
  });

  // ─── Test 13: 餵食次數達上限 ───
  test('POST /api/pet/feed - 今日餵食次數達上限', async () => {
    mockPrisma.pet.findFirst.mockResolvedValue({
      id: TEST_PET_ID,
      hp: 75,
      stamina: 50, // dailyFeedLimit = floor(50/20) + 1 = 3
      feedCount: 10,
      isAlive: true,
    });
    mockPrisma.feedLog.count.mockResolvedValue(3); // already fed 3 times today

    const res = await supertest(app.server)
      .post('/api/pet/feed')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);

    expect(res.body.error).toBe('今日餵食次數已達上限');
  });

  // ─── Test 14: 沒有寵物時餵食 ───
  test('POST /api/pet/feed - 沒有寵物應回傳 404', async () => {
    mockPrisma.pet.findFirst.mockResolvedValue(null);

    const res = await supertest(app.server)
      .post('/api/pet/feed')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    expect(res.body.error).toBe('No alive pet found');
  });

  // ─── Test 15: 查詢不存在的寵物 ───
  test('GET /api/pet - 沒有寵物應回傳 null', async () => {
    mockPrisma.pet.findFirst.mockResolvedValue(null);

    const res = await supertest(app.server)
      .get('/api/pet')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.pet).toBeNull();
  });

  // ─── Test 16: Health check ───
  test('GET /health - 健康檢查', async () => {
    const res = await supertest(app.server)
      .get('/health')
      .expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  // ─── Test 17: 無效 token ───
  test('GET /api/pet - 無效 token 應回傳 401', async () => {
    await supertest(app.server)
      .get('/api/pet')
      .set('Authorization', 'Bearer invalid-token-here')
      .expect(401);
  });

  // ─── Test 18: 註冊驗證 - 密碼太短 ───
  test('POST /api/auth/register - 密碼太短應回傳 400', async () => {
    const res = await supertest(app.server)
      .post('/api/auth/register')
      .send({ email: 'x@test.com', password: 'short' })
      .expect(400);

    expect(res.body.error).toBe('Validation error');
  });

  // ─── Test 19: 名稱驗證 - 太短 ───
  test('POST /api/pet/init - 名稱太短應回傳 400', async () => {
    mockPrisma.pet.findFirst.mockResolvedValue(null);

    const res = await supertest(app.server)
      .post('/api/pet/init')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'A' })
      .expect(400);

    expect(res.body.error).toBe('Validation error');
  });

  // ─── Test 20: 名稱驗證 - 太長 ───
  test('POST /api/pet/init - 名稱太長應回傳 400', async () => {
    mockPrisma.pet.findFirst.mockResolvedValue(null);

    const res = await supertest(app.server)
      .post('/api/pet/init')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '這個名字真的太長了超過十個字' })
      .expect(400);

    expect(res.body.error).toBe('Validation error');
  });

  // ─── Test 21: 註冊驗證 - 無效 email ───
  test('POST /api/auth/register - 無效 email 應回傳 400', async () => {
    const res = await supertest(app.server)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: TEST_PASSWORD })
      .expect(400);

    expect(res.body.error).toBe('Validation error');
  });

  // ─── Test 22: rememberMe 登入 ───
  test('POST /api/auth/login - rememberMe 登入', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      passwordHash: hashedPassword,
    });

    const res = await supertest(app.server)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD, rememberMe: true })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe(TEST_EMAIL);
  });

  // ─── Test 23: 完整流程 - 註冊 → 命名 → 餵食 ───
  test('完整流程: 註冊 → 命名 → 餵食', async () => {
    const flowEmail = 'flow-full@example.com';
    const flowUserId = 'flow-user-001';
    const flowPetId = 'flow-pet-001';

    // Step 1: Register
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: flowUserId,
      email: flowEmail,
      createdAt: new Date().toISOString(),
    });

    const regRes = await supertest(app.server)
      .post('/api/auth/register')
      .send({ email: flowEmail, password: TEST_PASSWORD })
      .expect(201);

    const flowToken = regRes.body.token;
    expect(regRes.body.user.email).toBe(flowEmail);

    // Step 2: Init pet
    mockPrisma.pet.findFirst.mockResolvedValue(null);
    mockPrisma.pet.create.mockResolvedValue({
      id: flowPetId,
      name: '流程雞',
      hp: 80,
      stamina: 60,
      appetite: 50,
      bodySize: 40,
      resetCount: 0,
      feedCount: 0,
      stage: 'egg',
      isAlive: true,
      createdAt: new Date().toISOString(),
    });

    const initRes = await supertest(app.server)
      .post('/api/pet/init')
      .set('Authorization', `Bearer ${flowToken}`)
      .send({ name: '流程雞' })
      .expect(201);

    expect(initRes.body.pet.name).toBe('流程雞');
    expect(initRes.body.pet.stage).toBe('egg');

    // Step 3: Feed
    mockPrisma.pet.findFirst.mockResolvedValue({
      id: flowPetId,
      name: '流程雞',
      hp: 80,
      stamina: 60,
      appetite: 50,
      bodySize: 40,
      resetCount: 0,
      feedCount: 0,
      stage: 'egg',
      isAlive: true,
    });
    mockPrisma.feedLog.count.mockResolvedValue(0);
    mockPrisma.$transaction.mockResolvedValue([
      {
        id: flowPetId,
        name: '流程雞',
        hp: 83,
        stamina: 61,
        appetite: 51,
        bodySize: 41,
        resetCount: 0,
        feedCount: 1,
        stage: 'egg',
        isAlive: true,
        lastFedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {},
    ]);

    const feedRes = await supertest(app.server)
      .post('/api/pet/feed')
      .set('Authorization', `Bearer ${flowToken}`)
      .expect(200);

    expect(feedRes.body.result).toHaveProperty('dice1');
    expect(feedRes.body.result).toHaveProperty('dice2');
    expect(feedRes.body.result).toHaveProperty('eventName');
    expect(feedRes.body.result.pet.feedCount).toBe(1);

    // Step 4: Verify state
    mockPrisma.pet.findFirst.mockResolvedValue({
      id: flowPetId,
      name: '流程雞',
      hp: 83,
      stamina: 61,
      appetite: 51,
      bodySize: 41,
      resetCount: 0,
      feedCount: 1,
      stage: 'egg',
      isAlive: true,
      lastFedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    mockPrisma.feedLog.count.mockResolvedValue(1);

    const getRes = await supertest(app.server)
      .get('/api/pet')
      .set('Authorization', `Bearer ${flowToken}`)
      .expect(200);

    expect(getRes.body.pet.feedCount).toBe(1);
    expect(getRes.body.pet.dailyFeedCount).toBe(1);
    expect(getRes.body.pet.dailyFeedLimit).toBe(4); // floor(61/20) + 1
  });
});
