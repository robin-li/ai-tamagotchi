/**
 * 電子雞個性系統
 * 定義 24 種不同個性，影響成長、衰退、餵食效果
 */

export interface PersonalityTrait {
  id: string;              // 英文識別碼
  name: string;            // 中文名稱
  description: string;     // 個性描述
  emoji: string;           // 代表表情符號
  decayMultiplier: number; // 影響衰退速度（1.0 = 正常）
  growthBonus: number;     // 影響成長速度（0-10額外加成）
  feedMultiplier: number;  // 影響餵食效果（0.8-1.2）
}

export const PERSONALITIES: PersonalityTrait[] = [
  {
    id: 'energetic',
    name: '活潑外向',
    description: '精力充沛，喜歡與人互動，成長迅速',
    emoji: '🌟',
    decayMultiplier: 1.1,
    growthBonus: 3,
    feedMultiplier: 1.0,
  },
  {
    id: 'sleepy',
    name: '愛睏懶散',
    description: '總是昏昏欲睡，成長緩慢但不易餓',
    emoji: '😴',
    decayMultiplier: 0.8,
    growthBonus: -2,
    feedMultiplier: 0.9,
  },
  {
    id: 'glutton',
    name: '貪吃暴食',
    description: '食慾旺盛，餵食效果更好，成長快速',
    emoji: '🍖',
    decayMultiplier: 1.2,
    growthBonus: 5,
    feedMultiplier: 1.2,
  },
  {
    id: 'shy',
    name: '膽小害羞',
    description: '容易受驚嚇，成長緩慢，餵食效果較弱',
    emoji: '🙈',
    decayMultiplier: 0.9,
    growthBonus: -1,
    feedMultiplier: 0.8,
  },
  {
    id: 'mischievous',
    name: '調皮搗蛋',
    description: '充滿好奇心，活潑好動，衰退速度快',
    emoji: '😈',
    decayMultiplier: 1.3,
    growthBonus: 2,
    feedMultiplier: 1.0,
  },
  {
    id: 'independent',
    name: '獨立自主',
    description: '不需要太多照顧，衰退速度慢',
    emoji: '🦅',
    decayMultiplier: 0.7,
    growthBonus: 1,
    feedMultiplier: 0.95,
  },
  {
    id: 'clingy',
    name: '黏人依賴',
    description: '需要大量關注，餵食效果佳',
    emoji: '🤗',
    decayMultiplier: 1.15,
    growthBonus: 3,
    feedMultiplier: 1.1,
  },
  {
    id: 'curious',
    name: '好奇冒險',
    description: '探索慾強，成長快但體力消耗大',
    emoji: '🔍',
    decayMultiplier: 1.25,
    growthBonus: 4,
    feedMultiplier: 1.05,
  },
  {
    id: 'calm',
    name: '沉穩冷靜',
    description: '情緒穩定，成長均衡，衰退緩慢',
    emoji: '😌',
    decayMultiplier: 0.85,
    growthBonus: 1,
    feedMultiplier: 1.0,
  },
  {
    id: 'grumpy',
    name: '暴躁易怒',
    description: '容易生氣，衰退快，餵食效果不穩',
    emoji: '😠',
    decayMultiplier: 1.4,
    growthBonus: 0,
    feedMultiplier: 0.9,
  },
  {
    id: 'playful',
    name: '貪玩愛玩',
    description: '喜歡玩耍，精力旺盛，成長迅速',
    emoji: '🎮',
    decayMultiplier: 1.2,
    growthBonus: 4,
    feedMultiplier: 1.0,
  },
  {
    id: 'elegant',
    name: '優雅從容',
    description: '舉止優雅，衰退緩慢，餵食效果佳',
    emoji: '💎',
    decayMultiplier: 0.75,
    growthBonus: 2,
    feedMultiplier: 1.1,
  },
  {
    id: 'loyal',
    name: '忠誠友善',
    description: '對主人忠誠，餵食效果好',
    emoji: '🐕',
    decayMultiplier: 1.0,
    growthBonus: 2,
    feedMultiplier: 1.15,
  },
  {
    id: 'naughty',
    name: '調皮活潑',
    description: '精力無窮，成長快，衰退也快',
    emoji: '🤪',
    decayMultiplier: 1.3,
    growthBonus: 5,
    feedMultiplier: 1.0,
  },
  {
    id: 'steady',
    name: '穩重踏實',
    description: '步調穩定，成長均衡，衰退慢',
    emoji: '🐢',
    decayMultiplier: 0.8,
    growthBonus: 1,
    feedMultiplier: 1.0,
  },
  {
    id: 'carefree',
    name: '隨性自在',
    description: '無拘無束，衰退速度正常',
    emoji: '🌈',
    decayMultiplier: 1.0,
    growthBonus: 2,
    feedMultiplier: 1.0,
  },
  {
    id: 'sensitive',
    name: '敏感纖細',
    description: '容易受環境影響，餵食效果不穩',
    emoji: '🥺',
    decayMultiplier: 1.1,
    growthBonus: 0,
    feedMultiplier: 0.85,
  },
  {
    id: 'brave',
    name: '勇敢無畏',
    description: '勇往直前，成長快速，餵食效果佳',
    emoji: '🦁',
    decayMultiplier: 1.15,
    growthBonus: 4,
    feedMultiplier: 1.1,
  },
  {
    id: 'lazy',
    name: '懶散悠閒',
    description: '喜歡休息，成長緩慢，衰退也慢',
    emoji: '🦥',
    decayMultiplier: 0.7,
    growthBonus: -1,
    feedMultiplier: 0.9,
  },
  {
    id: 'clever',
    name: '機靈聰明',
    description: '聰明伶俐，餵食效果好，成長快',
    emoji: '🧠',
    decayMultiplier: 1.0,
    growthBonus: 3,
    feedMultiplier: 1.15,
  },
  {
    id: 'stubborn',
    name: '固執倔強',
    description: '堅持己見，餵食效果差，衰退慢',
    emoji: '😤',
    decayMultiplier: 0.85,
    growthBonus: 1,
    feedMultiplier: 0.85,
  },
  {
    id: 'gentle',
    name: '溫柔體貼',
    description: '溫和友善，成長穩定，餵食效果佳',
    emoji: '🌸',
    decayMultiplier: 0.9,
    growthBonus: 2,
    feedMultiplier: 1.1,
  },
  {
    id: 'active',
    name: '活潑好動',
    description: '停不下來，衰退快，成長迅速',
    emoji: '⚡',
    decayMultiplier: 1.3,
    growthBonus: 5,
    feedMultiplier: 1.05,
  },
  {
    id: 'composed',
    name: '淡定從容',
    description: '處變不驚，衰退緩慢，成長穩定',
    emoji: '🧘',
    decayMultiplier: 0.75,
    growthBonus: 1,
    feedMultiplier: 1.0,
  },
];

/**
 * 根據名稱獲取個性定義
 */
export function getPersonalityByName(name: string): PersonalityTrait | undefined {
  return PERSONALITIES.find((p) => p.name === name);
}

/**
 * 隨機選擇一個個性
 */
export function getRandomPersonality(): PersonalityTrait {
  const index = Math.floor(Math.random() * PERSONALITIES.length);
  return PERSONALITIES[index];
}

/**
 * 取得所有個性名稱列表
 */
export function getAllPersonalityNames(): string[] {
  return PERSONALITIES.map((p) => p.name);
}
