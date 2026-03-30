import { toFrontendPet, toBackendStage } from '../petMapper';

describe('petMapper', () => {
  describe('toFrontendPet', () => {
    it('正確轉換 Prisma pet 格式', () => {
      const prismaPet = {
        id: 'pet-1',
        name: '小黃',
        hp: 75,
        stamina: 50,
        appetite: 40,
        bodySize: 30,
        resetCount: 2,
        feedCount: 15,
        stage: 'growing',
        isAlive: true,
        lastFedAt: new Date('2026-03-31T05:00:00Z'),
        createdAt: new Date('2026-03-30T00:00:00Z'),
        updatedAt: new Date('2026-03-31T00:00:00Z'),
      };

      const frontend = toFrontendPet(prismaPet);

      expect(frontend.id).toBe('pet-1');
      expect(frontend.name).toBe('小黃');
      expect(frontend.stats.health).toBe(75);
      expect(frontend.stats.stamina).toBe(50);
      expect(frontend.stats.appetite).toBe(40);
      expect(frontend.stats.size).toBe(30);
      expect(frontend.stage).toBe('child'); // growing → child
      expect(frontend.totalFeedings).toBe(15);
      expect(frontend.remainingResets).toBe(3); // 5 - 2
      expect(frontend.isAlive).toBe(true);
      expect(frontend.lastFedAt).toBe('2026-03-31T05:00:00.000Z');
    });

    it('stage egg 保持不變', () => {
      const pet = {
        id: 'p1', name: 'test', hp: 80, stamina: 60, appetite: 50, bodySize: 40,
        resetCount: 0, feedCount: 0, stage: 'egg', isAlive: true,
        lastFedAt: null, createdAt: new Date(), updatedAt: new Date(),
      };
      expect(toFrontendPet(pet).stage).toBe('egg');
    });

    it('stage elder 保持不變', () => {
      const pet = {
        id: 'p1', name: 'test', hp: 80, stamina: 60, appetite: 50, bodySize: 40,
        resetCount: 0, feedCount: 55, stage: 'elder', isAlive: true,
        lastFedAt: null, createdAt: new Date(), updatedAt: new Date(),
      };
      expect(toFrontendPet(pet).stage).toBe('elder');
    });
  });

  describe('toBackendStage', () => {
    it('前端 stage 轉回後端格式', () => {
      expect(toBackendStage('baby')).toBe('infant');
      expect(toBackendStage('child')).toBe('growing');
      expect(toBackendStage('adult')).toBe('mature');
      expect(toBackendStage('elder')).toBe('elder');
      expect(toBackendStage('egg')).toBe('egg');
    });

    it('未知 stage 回傳原值', () => {
      expect(toBackendStage('unknown')).toBe('unknown');
    });
  });
});
