import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PixelButton from '../components/PixelButton';
import { getConfig } from '../api/config';
import { testAiModel } from '../api/ai';
import {
  type Provider,
  fetchModelsByProvider,
  filterModels,
} from '../services/aiModels';

const AI_PROVIDER_KEY = 'ai_provider';
const AI_API_KEY_KEY = 'ai_api_key';
const AI_MODEL_KEY = 'ai_model';

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'minimax', label: 'MiniMax' },
];

type Toast = { message: string; type: 'success' | 'error' } | null;

export default function SettingsPage() {
  const navigate = useNavigate();

  const [provider, setProvider] = useState<Provider>(
    () => (localStorage.getItem(AI_PROVIDER_KEY) as Provider) || 'openai',
  );
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(AI_API_KEY_KEY) || '',
  );
  const [model, setModel] = useState(
    () => localStorage.getItem(AI_MODEL_KEY) || 'gpt-4o-mini',
  );
  const [showKey, setShowKey] = useState(false);
  const [models, setModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleFetchModels = useCallback(async () => {
    if (!apiKey.trim()) {
      setToast({ message: '請先輸入 API Key', type: 'error' });
      return;
    }
    setLoadingModels(true);
    setModels([]);
    try {
      const [rawModels, config] = await Promise.all([
        fetchModelsByProvider(provider, apiKey.trim()),
        getConfig(),
      ]);
      const filtered = filterModels(
        rawModels,
        config.includePattern,
        config.excludePattern,
      );
      setModels(filtered);
      if (filtered.length > 0 && !filtered.includes(model)) {
        setModel(filtered[0]);
      }
      if (filtered.length === 0) {
        setToast({ message: '過濾後無可用模型', type: 'error' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '取得模型列表失敗';
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoadingModels(false);
    }
  }, [provider, apiKey, model]);

  const handleSave = () => {
    localStorage.setItem(AI_PROVIDER_KEY, provider);
    localStorage.setItem(AI_API_KEY_KEY, apiKey);
    localStorage.setItem(AI_MODEL_KEY, model);
    setToast({ message: '設定已儲存', type: 'success' });
  };

  const handleTestModel = useCallback(async () => {
    if (!apiKey.trim()) {
      setToast({ message: '請先輸入 API Key', type: 'error' });
      return;
    }
    if (!model.trim()) {
      setToast({ message: '請先選擇模型', type: 'error' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testAiModel(provider, apiKey.trim(), model.trim());
      if (result.ok) {
        setTestResult({ ok: true, message: `✅ 成功！AI 回應：「${result.reply}」` });
      } else {
        setTestResult({ ok: false, message: `❌ 失敗：${result.error}` });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '測試失敗';
      setTestResult({ ok: false, message: `❌ 失敗：${msg}` });
    } finally {
      setTesting(false);
    }
  }, [provider, apiKey, model]);

  const selectClass =
    'w-full border-4 border-brown bg-cream px-3 py-2 font-pixel text-xs text-brown-dark shadow-pixel-sm outline-none focus:border-orange';

  const inputClass =
    'flex-1 border-4 border-brown bg-cream px-3 py-2 font-pixel text-xs text-brown-dark shadow-pixel-sm outline-none focus:border-orange';

  return (
    <div className="flex min-h-screen flex-col items-center bg-cream px-4 py-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 z-50 border-4 px-4 py-2 font-pixel text-xs shadow-pixel ${
            toast.type === 'success'
              ? 'border-green-700 bg-green-100 text-green-800'
              : 'border-red-700 bg-red-100 text-red-800'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex w-full max-w-md items-center justify-between">
        <h1 className="font-pixel text-xs sm:text-sm text-brown-dark">AI 設定</h1>
        <PixelButton
          variant="secondary"
          onClick={() => navigate('/game')}
          className="!px-3 !py-1 !text-[10px] !border-2"
        >
          返回
        </PixelButton>
      </div>

      {/* Form */}
      <div className="w-full max-w-md border-4 border-brown bg-cream-dark p-4 shadow-pixel">
        <div className="grid gap-4">
          {/* Provider */}
          <div>
            <label className="mb-1 block font-pixel text-[10px] text-brown">
              Provider
            </label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value as Provider);
                setModels([]);
              }}
              className={selectClass}
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="mb-1 block font-pixel text-[10px] text-brown">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={inputClass}
              />
              <PixelButton
                variant="secondary"
                onClick={() => setShowKey(!showKey)}
                className="!px-2 !py-1 !text-[10px] !border-2 shrink-0"
              >
                {showKey ? '隱藏' : '顯示'}
              </PixelButton>
            </div>
          </div>

          {/* Fetch Models */}
          <PixelButton
            variant="secondary"
            onClick={handleFetchModels}
            disabled={loadingModels || !apiKey.trim()}
            className="!py-2 !text-[10px]"
          >
            {loadingModels ? '載入中...' : '取得模型列表'}
          </PixelButton>

          {/* Model Select */}
          {models.length > 0 && (
            <div>
              <label className="mb-1 block font-pixel text-[10px] text-brown">
                模型
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={selectClass}
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Save */}
          <PixelButton onClick={handleSave} className="!py-3 mt-2">
            儲存設定
          </PixelButton>

          {/* Test Model */}
          <PixelButton
            variant="secondary"
            onClick={handleTestModel}
            disabled={testing || !apiKey.trim() || !model.trim()}
            className="!py-2 !text-[10px]"
          >
            {testing ? '測試中...' : '測試模型'}
          </PixelButton>

          {/* Test Result */}
          {testResult && (
            <div
              className={`border-2 px-3 py-2 font-pixel text-[10px] ${
                testResult.ok
                  ? 'border-green-700 bg-green-100 text-green-800'
                  : 'border-red-700 bg-red-100 text-red-800'
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
