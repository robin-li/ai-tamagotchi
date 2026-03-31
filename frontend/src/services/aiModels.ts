export type Provider = 'openai' | 'gemini' | 'anthropic' | 'minimax';

export async function fetchOpenAIModels(apiKey: string): Promise<string[]> {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
  const data = await res.json();
  return (data.data as { id: string }[]).map((m) => m.id);
}

export async function fetchAnthropicModels(apiKey: string): Promise<string[]> {
  const res = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': apiKey,
      'anthropic-dangerous-direct-browser-access': 'true',
      'anthropic-version': '2023-06-01',
    },
  });
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
  const data = await res.json();
  return (data.data as { id: string }[]).map((m) => m.id);
}

export async function fetchGeminiModels(apiKey: string): Promise<string[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
  );
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  return (data.models as { name: string }[]).map((m) => m.name.replace('models/', ''));
}

export async function fetchMiniMaxModels(apiKey: string): Promise<string[]> {
  const res = await fetch('https://api.minimax.chat/v1/model_list', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`MiniMax API error: ${res.status}`);
  const data = await res.json();
  return (data.data as { id: string }[]).map((m) => m.id);
}

export function filterModels(
  models: string[],
  include?: string,
  exclude?: string,
): string[] {
  let result = models;
  if (include) {
    const re = new RegExp(include);
    result = result.filter((m) => re.test(m));
  }
  if (exclude) {
    const re = new RegExp(exclude);
    result = result.filter((m) => !re.test(m));
  }
  return result.sort();
}

const FETCHERS: Record<Provider, (key: string) => Promise<string[]>> = {
  openai: fetchOpenAIModels,
  anthropic: fetchAnthropicModels,
  gemini: fetchGeminiModels,
  minimax: fetchMiniMaxModels,
};

export function fetchModelsByProvider(provider: Provider, apiKey: string): Promise<string[]> {
  return FETCHERS[provider](apiKey);
}
