import client from './client';
import type { Provider } from '../services/aiModels';

export interface TestAiResult {
  ok: boolean;
  reply?: string;
  error?: string;
}

export async function testAiModel(
  provider: Provider,
  apiKey: string,
  model: string,
): Promise<TestAiResult> {
  const res = await client.post<TestAiResult>('/ai/test', { provider, apiKey, model });
  return res.data;
}
