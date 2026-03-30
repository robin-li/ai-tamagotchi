import client from './client';
import type { Pet, PetStats } from '../types';

/** 初始化電子雞 */
export async function initPet(name: string, stats: PetStats): Promise<Pet> {
  const { data } = await client.post<Pet>('/pet/init', { name, stats });
  return data;
}

/** 取得當前電子雞 */
export async function getPet(): Promise<Pet> {
  const { data } = await client.get<Pet>('/pet');
  return data;
}
