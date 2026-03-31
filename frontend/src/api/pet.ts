import client from './client';
import type { Pet, FeedResult } from '../types';

/** 初始化電子雞（後端自行骰屬性） */
export async function initPet(name: string): Promise<Pet> {
  const { data } = await client.post<{ pet: Pet }>('/pet/init', { name });
  return data.pet;
}

/** 取得當前電子雞 */
export async function getPet(): Promise<Pet | null> {
  const { data } = await client.get<{ pet: Pet | null }>('/pet');
  return data.pet;
}

/** 餵食電子雞 */
export async function feedPet(): Promise<FeedResult> {
  const { data } = await client.post<{ result: Omit<FeedResult, 'dice'> & { dice?: [number, number]; dice1?: number; dice2?: number } }>('/pet/feed');
  const r = data.result;
  return {
    ...r,
    dice: r.dice ?? [r.dice1 ?? 1, r.dice2 ?? 1],
  } as FeedResult;
}

/** 取得今日餵食次數 */
export async function getDailyFeedCount(): Promise<{ count: number; max: number }> {
  const { data } = await client.get<{ count: number; max: number }>('/pet/feed/today');
  return data;
}
