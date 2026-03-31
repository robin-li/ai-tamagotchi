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
  // 加 10 秒 timeout，避免後端還沒實作時一直 loading
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await client.post<TestAiResult>('/ai/test', { provider, apiKey, model }, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.data;
  } catch (err: any) {
    clearTimeout(timeout);
    if (err?.name === 'CanceledError' || err?.message?.includes('cancel')) {
      return { ok: false, error: '連線逾時（10秒），請確認 API 設定是否正確' };
    }
    // 解析 axios 錯誤
    const apiError = err?.response?.data?.error;
    if (typeof apiError === 'string' && apiError) {
      return { ok: false, error: apiError };
    }
    return { ok: false, error: '測試連線失敗，請檢查 API Key 與模型設定' };
  }
}
