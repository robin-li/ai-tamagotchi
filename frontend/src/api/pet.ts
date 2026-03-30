import client from './client';
import type { Pet } from '../types';

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
