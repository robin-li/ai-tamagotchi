import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { calculateDecay } from '../lib/decay';

/**
 * 啟動衰退排程
 * 每 30 分鐘執行一次，對所有存活且有 lastFedAt 的寵物計算衰退
 */
export function startDecayJob(): void {
  // 每 30 分鐘執行
  cron.schedule('*/30 * * * *', async () => {
    console.log('[DecayJob] 開始執行衰退計算...');

    try {
      // 查詢所有存活且有 lastFedAt 的寵物
      const pets = await prisma.pet.findMany({
        where: {
          isAlive: true,
          lastFedAt: { not: null },
        },
      });

      let processedCount = 0;

      for (const pet of pets) {
        // lastFedAt 已確認不為 null
        const decay = calculateDecay(pet.lastFedAt as Date);

        // 若所有衰退值都是 0 則跳過
        if (decay.hp === 0 && decay.stamina === 0 && decay.appetite === 0 && decay.bodySize === 0) {
          continue;
        }

        // 計算新的屬性值
        const newHp = Math.max(0, pet.hp - decay.hp);
        const newStamina = Math.max(1, pet.stamina - decay.stamina);
        const newAppetite = Math.max(1, pet.appetite - decay.appetite);
        const newBodySize = Math.max(1, pet.bodySize - decay.bodySize);

        // 判斷是否死亡
        const isDead = newHp <= 0;

        // 更新寵物屬性
        await prisma.pet.update({
          where: { id: pet.id },
          data: {
            hp: newHp,
            stamina: newStamina,
            appetite: newAppetite,
            bodySize: newBodySize,
            isAlive: !isDead,
          },
        });

        processedCount++;

        if (isDead) {
          console.log(`[DecayJob] 寵物 ${pet.name} (${pet.id}) 已死亡`);
        }
      }

      console.log(`[DecayJob] 完成，處理了 ${processedCount} 隻寵物`);
    } catch (error) {
      console.error('[DecayJob] 執行失敗:', error);
    }
  });

  console.log('[DecayJob] 衰退排程已啟動（每 30 分鐘執行）');
}
