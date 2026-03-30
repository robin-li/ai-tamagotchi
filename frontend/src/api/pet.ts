import client from './client';
import type { Pet, FeedResult } from '../types';

/** 初始化電子雞（後端自行骰屬性） */
export async function initPet(name: string): Promise<Pet> {
  const { data } = await client.post<Pet>('/pet/init', { name });
  return data;
}

/** 取得當前電子雞 */
export async function getPet(): Promise<Pet> {
  const { data } = await client.get<Pet>('/pet');
  return data;
}

/** 餵食電子雞（後端回傳 dice1/dice2，轉換為 dice: [number, number]） */
export async function feedPet(): Promise<FeedResult> {
  const { data } = await client.post<Omit<FeedResult, 'dice'> & { dice1: number; dice2: number }>('/pet/feed');
  return {
    ...data,
    dice: [data.dice1, data.dice2],
  };
}

/** 取得今日餵食次數 */
export async function getDailyFeedCount(): Promise<{ count: number; max: number }> {
  const { data } = await client.get<{ count: number; max: number }>('/pet/feed/today');
  return data;
}
