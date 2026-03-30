/**
 * 前後端資料格式轉換工具
 * 
 * Backend (Prisma):  hp, bodySize, stage: egg|infant|growing|mature|elder
 * Frontend (TypeScript): health, size, stage: egg|baby|child|adult|elder
 */

const STAGE_MAP: Record<string, string> = {
  egg: 'egg',
  infant: 'baby',
  growing: 'child',
  mature: 'adult',
  elder: 'elder',
};

const STAGE_REVERSE_MAP: Record<string, string> = {
  egg: 'egg',
  baby: 'infant',
  child: 'growing',
  adult: 'mature',
  elder: 'elder',
};

/** 將 Prisma Pet 轉為 Frontend 格式 */
export function toFrontendPet(pet: {
  id: string;
  name: string;
  hp: number;
  stamina: number;
  appetite: number;
  bodySize: number;
  resetCount: number;
  feedCount: number;
  stage: string;
  isAlive: boolean;
  lastFedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}) {
  return {
    id: pet.id,
    name: pet.name,
    stats: {
      health: pet.hp,
      stamina: pet.stamina,
      appetite: pet.appetite,
      size: pet.bodySize,
    },
    stage: STAGE_MAP[pet.stage] ?? pet.stage,
    totalFeedings: pet.feedCount,
    remainingResets: 5 - pet.resetCount,
    isAlive: pet.isAlive,
    lastFedAt: pet.lastFedAt ? new Date(pet.lastFedAt).toISOString() : new Date().toISOString(),
    createdAt: new Date(pet.createdAt).toISOString(),
  };
}

/** 將 Frontend stage 轉為 Backend (Prisma) 格式 */
export function toBackendStage(stage: string): string {
  return STAGE_REVERSE_MAP[stage] ?? stage;
}
