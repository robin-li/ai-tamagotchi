/**
 * 衰退值計算模組
 * 根據距離上次餵食的時間計算各屬性應扣除的值
 */

export interface DecayValues {
  hp: number;
  stamina: number;
  appetite: number;
  bodySize: number;
}

/**
 * 計算衰退值（累計制）
 * - 2 小時：hp -2, stamina -1
 * - 4 小時：hp -3, stamina -2, appetite -2
 * - 8 小時：hp -5, stamina -3, appetite -3, bodySize -1
 * - 12 小時：hp -8（額外懲罰）
 */
export function calculateDecay(lastFedAt: Date): DecayValues {
  const hours = (Date.now() - lastFedAt.getTime()) / 3600000;

  let hp = 0;
  let stamina = 0;
  let appetite = 0;
  let bodySize = 0;

  // 2 小時門檻
  if (hours >= 2) {
    hp += 2;
    stamina += 1;
  }

  // 4 小時門檻
  if (hours >= 4) {
    hp += 3;
    stamina += 2;
    appetite += 2;
  }

  // 8 小時門檻
  if (hours >= 8) {
    hp += 5;
    stamina += 3;
    appetite += 3;
    bodySize += 1;
  }

  // 12 小時門檻（額外 hp 懲罰）
  if (hours >= 12) {
    hp += 8;
  }

  return { hp, stamina, appetite, bodySize };
}
