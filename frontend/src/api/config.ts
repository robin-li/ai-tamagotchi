import client from './client';

export interface AiConfig {
  includePattern?: string;
  excludePattern?: string;
}

export async function getConfig(): Promise<AiConfig> {
  try {
    const res = await client.get('/config');
    return res.data ?? {};
  } catch {
    return {};
  }
}
