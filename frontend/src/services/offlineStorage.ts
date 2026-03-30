import type { Pet } from '../types';

const PET_KEY = 'tamagotchi:pet';
const SYNC_KEY = 'tamagotchi:lastSync';

export function savePetToCache(pet: Pet): void {
  localStorage.setItem(PET_KEY, JSON.stringify(pet));
  localStorage.setItem(SYNC_KEY, new Date().toISOString());
}

export function getPetFromCache(): Pet | null {
  const raw = localStorage.getItem(PET_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Pet;
  } catch {
    return null;
  }
}

export function removePetFromCache(): void {
  localStorage.removeItem(PET_KEY);
  localStorage.removeItem(SYNC_KEY);
}

export function getLastSyncTime(): string | null {
  return localStorage.getItem(SYNC_KEY);
}
