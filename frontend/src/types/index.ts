/** 電子雞屬性 */
export interface PetStats {
  health: number;   // 生命 ❤️ (0-100)
  stamina: number;  // 體力 ⚡ (1-100)
  appetite: number; // 胃口 🍽️ (1-100)
  size: number;     // 體型 📏 (1-100)
}

/** 成長階段 */
export type GrowthStage = 'egg' | 'baby' | 'child' | 'adult' | 'elder';

/** 電子雞 */
export interface Pet {
  id: string;
  name: string;
  stats: PetStats;
  stage: GrowthStage;
  totalFeedings: number;
  remainingResets: number;
  lastFedAt: string;
  isAlive: boolean;
  createdAt: string;
}

/** 餵食結果 */
export interface FeedResult {
  dice: [number, number];
  total: number;
  eventName: string;
  statChanges: Partial<PetStats>;
  newStats: PetStats;
  newStage?: GrowthStage;
}

/** 使用者 */
export interface User {
  id: string;
  email: string;
}

/** 登入回應 */
export interface AuthResponse {
  token: string;
  user: User;
}
