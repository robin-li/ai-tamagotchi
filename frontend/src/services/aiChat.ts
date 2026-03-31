import type { Provider } from './aiModels';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Provider 對應的 chat completions endpoint */
const ENDPOINTS: Record<Provider, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  minimax: 'https://api.minimax.chat/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  gemini: '', // 動態組合
};

/**
 * 統一呼叫各 provider 的 chat API，回傳 AI 回應文字
 */
export async function sendChatMessage(
  provider: Provider,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  if (provider === 'anthropic') {
    return sendAnthropic(apiKey, model, messages);
  }
  if (provider === 'gemini') {
    return sendGemini(apiKey, model, messages);
  }
  // OpenAI / MiniMax 共用 OpenAI 格式
  return sendOpenAICompatible(ENDPOINTS[provider], apiKey, model, messages);
}

/** OpenAI 相容格式（OpenAI、MiniMax） */
async function sendOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, max_completion_tokens: 100 }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

/** Anthropic Messages API */
async function sendAnthropic(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const userMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch(ENDPOINTS.anthropic, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 100,
      system,
      messages: userMessages,
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text?.trim() ?? '';
}

/** Google Gemini API */
async function sendGemini(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
): Promise<string> {
  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents,
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}
