import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { feedPet } from '../api/pet';
import type { FeedResult, PetStats } from '../types';
import DiceDisplay from '../components/DiceDisplay';
import PixelButton from '../components/PixelButton';

const ROLL_DURATION = 2000; // 骰子動畫持續 2 秒

const EVENT_TABLE: Record<number, string> = {
  2:  '💥 暴食',
  3:  '🤢 消化不良',
  4:  '🥗 清淡飲食',
  5:  '🍎 普通進食',
  6:  '🍱 均衡營養',
  7:  '🍽️ 正常餵食',
  8:  '🥩 高蛋白',
  9:  '🍰 甜食',
  10: '🌟 美食饗宴',
  11: '💊 營養補充',
  12: '🏆 神級料理',
};

const STAT_LABELS: Record<keyof PetStats, { icon: string; label: string }> = {
  health:   { icon: '❤️', label: '生命' },
  stamina:  { icon: '⚡', label: '體力' },
  appetite: { icon: '🍽️', label: '胃口' },
  size:     { icon: '📏', label: '體型' },
};

type Phase = 'rolling' | 'result';

export default function FeedPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>('rolling');
  const [result, setResult] = useState<FeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rollStartRef = useRef(Date.now());
  const apiDoneRef = useRef(false);
  const resultRef = useRef<FeedResult | null>(null);

  const mutation = useMutation({
    mutationFn: feedPet,
    onSuccess: (data) => {
      resultRef.current = data;
      apiDoneRef.current = true;
      tryShowResult();
    },
    onError: (err: Error) => {
      setError(err.message || '餵食失敗，請稍後再試');
    },
  });

  // 啟動：呼叫 API + 開始動畫計時
  useEffect(() => {
    rollStartRef.current = Date.now();
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 動畫計時器：確保至少播放 ROLL_DURATION
  useEffect(() => {
    const timer = setTimeout(() => {
      tryShowResult();
    }, ROLL_DURATION);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryShowResult = useCallback(() => {
    const elapsed = Date.now() - rollStartRef.current;
    if (apiDoneRef.current && elapsed >= ROLL_DURATION && resultRef.current) {
      setResult(resultRef.current);
      setPhase('result');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleContinue() {
    queryClient.invalidateQueries({ queryKey: ['pet'] });
    navigate('/game', { replace: true });
  }

  // --- 錯誤畫面 ---
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
        <p className="mb-6 font-pixel text-sm text-red-500">{error}</p>
        <PixelButton onClick={() => navigate('/game', { replace: true })}>
          返回
        </PixelButton>
      </div>
    );
  }

  const isRolling = phase === 'rolling';
  const diceValues = result?.dice ?? [1, 1];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      {/* 標題 */}
      <h1 className="mb-4 sm:mb-8 font-pixel text-xs sm:text-sm text-brown-dark">
        {isRolling ? '擲骰中...' : '餵食結果'}
      </h1>

      {/* 骰子區 */}
      <div className="mb-4 sm:mb-8 flex gap-3 sm:gap-6">
        <DiceDisplay value={diceValues[0]} isRolling={isRolling} />
        <DiceDisplay value={diceValues[1]} isRolling={isRolling} />
      </div>

      {/* 結果展示 */}
      <AnimatePresence>
        {phase === 'result' && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="flex flex-col items-center"
          >
            {/* 點數總和 */}
            <p className="mb-2 font-pixel text-xs text-brown-light">
              {result.dice[0]} + {result.dice[1]} = {result.total}
            </p>

            {/* 事件名稱 */}
            <h2 className="mb-4 font-pixel text-lg sm:text-2xl text-brown-dark">
              {EVENT_TABLE[result.total] ?? result.eventName}
            </h2>

            {/* 屬性變化 */}
            <div className="mb-6 flex flex-wrap justify-center gap-3">
              {(Object.entries(result.statChanges) as [keyof PetStats, number][]).map(
                ([key, delta]) => {
                  if (!delta) return null;
                  const { icon, label } = STAT_LABELS[key];
                  const isPositive = delta > 0;
                  return (
                    <motion.span
                      key={key}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className={`font-pixel text-sm ${
                        isPositive ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {icon} {label} {isPositive ? '+' : ''}{delta}
                    </motion.span>
                  );
                },
              )}
            </div>

            {/* 進化提示 */}
            {result.newStage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-4 font-pixel text-xs text-orange-dark"
              >
                🎉 進化為 {result.newStage}！
              </motion.p>
            )}

            {/* 繼續按鈕 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <PixelButton onClick={handleContinue} className="w-full sm:w-auto">
                繼續 →
              </PixelButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
