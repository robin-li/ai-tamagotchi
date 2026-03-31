import { useState, useCallback, useEffect, useRef } from 'react';
import { sendChatMessage, type ChatMessage } from '../services/aiChat';
import type { Provider } from '../services/aiModels';
import type { Emotion } from '../components/PetSpeech';

const LAST_TAP_KEY = 'last_tap_time';

interface Personality {
  name: string;
  systemPrompt: string;
}

interface FeedContext {
  diceTotal: number;
  eventName: string;
  statChanges: Record<string, number>;
}

interface AIChatOptions {
  trigger: 'tap' | 'feed';
  petName: string;
  petHP: number;
  personality?: Personality;
  feedContext?: FeedContext;
}

interface AIChatResult {
  message: string | null;
  emotion: Emotion;
  loading: boolean;
  cooldownText: string | null;
  isCoolingDown: boolean;
  trigger: (options: AIChatOptions) => void;
}

/** 依 HP 決定冷卻秒數 */
function getCooldownMs(hp: number): number {
  if (hp >= 70) return 5 * 60 * 1000;
  if (hp >= 40) return 3 * 60 * 1000;
  return 1 * 60 * 1000;
}

/** 依 HP 決定 fallback emotion */
function getEmotionByHP(hp: number): Emotion {
  if (hp >= 70) return 'happy';
  if (hp >= 40) return 'neutral';
  return 'sad';
}

/** 從 AI 回應文字猜測 emotion */
function detectEmotion(text: string, hp: number): Emotion {
  if (/[！!🎉🏆✨😊😆🥳開心高興太棒]/.test(text)) return 'excited';
  if (/[😢😭😞難過傷心好累餓]/.test(text)) return 'sad';
  if (/[🎉😄❤️喜歡愛幸福]/.test(text)) return 'happy';
  return getEmotionByHP(hp);
}

function formatCooldown(ms: number): string {
  if (ms <= 0) return '';
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min} 分 ${sec} 秒`;
}

export default function useAIChat(): AIChatResult {
  const [message, setMessage] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [loading, setLoading] = useState(false);
  const [cooldownText, setCooldownText] = useState<string | null>(null);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** 更新冷卻倒計時 */
  const updateCooldown = useCallback((hp: number) => {
    const last = Number(localStorage.getItem(LAST_TAP_KEY) || '0');
    if (!last) {
      setCooldownText(null);
      setIsCoolingDown(false);
      return false;
    }
    const elapsed = Date.now() - last;
    const cooldownMs = getCooldownMs(hp);
    const remaining = cooldownMs - elapsed;
    if (remaining <= 0) {
      setCooldownText(null);
      setIsCoolingDown(false);
      return false;
    }
    setCooldownText(formatCooldown(remaining));
    setIsCoolingDown(true);
    return true;
  }, []);

  /** 啟動冷卻倒計時 interval */
  const startCooldownTimer = useCallback(
    (hp: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      updateCooldown(hp);
      intervalRef.current = setInterval(() => {
        const still = updateCooldown(hp);
        if (!still && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 1000);
    },
    [updateCooldown],
  );

  // 清理 interval
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const trigger = useCallback(
    async (options: AIChatOptions) => {
      const { trigger: triggerType, petName, petHP, personality, feedContext } = options;

      // 讀取 AI 設定
      const provider = localStorage.getItem('ai_provider') as Provider | null;
      const apiKey = localStorage.getItem('ai_api_key');
      const model = localStorage.getItem('ai_model');

      // 無 API Key → 靜默跳過
      if (!apiKey || !provider || !model) {
        setMessage(null);
        setLoading(false);
        return;
      }

      // tap 觸發時檢查冷卻
      if (triggerType === 'tap') {
        const last = Number(localStorage.getItem(LAST_TAP_KEY) || '0');
        if (last) {
          const elapsed = Date.now() - last;
          const cooldownMs = getCooldownMs(petHP);
          if (elapsed < cooldownMs) {
            startCooldownTimer(petHP);
            setLoading(false);
            return;
          }
        }
      }

      // 組 system prompt
      const personalityLine = personality
        ? `個性是${personality.name}。\n${personality.systemPrompt}`
        : '個性活潑可愛。';

      const systemContent = `你是一隻叫 ${petName} 的電子雞，${personalityLine}\n規則：用繁體中文回應，10~30字，只說回應本身，不要解釋。`;

      // 組 user message
      let userContent: string;
      if (triggerType === 'feed' && feedContext) {
        const statSummary = Object.entries(feedContext.statChanges)
          .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`)
          .join('、');
        userContent = `今天的骰子結果是 ${feedContext.diceTotal}點，代表「${feedContext.eventName}」，屬性變化是 ${statSummary}。說一句話形容今天的心情！`;
      } else {
        userContent = '點點我';
      }

      const messages: ChatMessage[] = [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ];

      setLoading(true);
      setMessage(null);

      try {
        const reply = await sendChatMessage(provider, apiKey, model, messages);
        const detectedEmotion = detectEmotion(reply, petHP);
        setMessage(reply);
        setEmotion(detectedEmotion);

        // tap 觸發時記錄時間 + 啟動冷卻
        if (triggerType === 'tap') {
          localStorage.setItem(LAST_TAP_KEY, String(Date.now()));
          startCooldownTimer(petHP);
        }
      } catch {
        // API 失敗 → 靜默，不顯示錯誤
        setMessage(null);
      } finally {
        setLoading(false);
      }
    },
    [startCooldownTimer],
  );

  return { message, emotion, loading, cooldownText, isCoolingDown, trigger };
}
