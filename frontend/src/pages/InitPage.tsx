import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { initPet } from '../api/pet';
import type { PetStats } from '../types';
import PixelButton from '../components/PixelButton';

const MAX_RESETS = 5;

const STAT_CONFIG = [
  { key: 'health' as const, icon: '❤️', label: '生命', min: 70, max: 80 },
  { key: 'stamina' as const, icon: '⚡', label: '體力', min: 30, max: 70 },
  { key: 'appetite' as const, icon: '🍽️', label: '胃口', min: 30, max: 70 },
  { key: 'size' as const, icon: '📏', label: '體型', min: 20, max: 50 },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollStats(): PetStats {
  return {
    health: randomInt(70, 80),
    stamina: randomInt(30, 70),
    appetite: randomInt(30, 70),
    size: randomInt(20, 50),
  };
}

export default function InitPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [stats, setStats] = useState<PetStats | null>(null);
  const [resetsLeft, setResetsLeft] = useState(MAX_RESETS);

  const nameValid = name.length >= 2 && name.length <= 10;
  const canConfirm = nameValid && stats !== null;

  const mutation = useMutation({
    mutationFn: () => initPet(name), // 只傳 name，後端自行骰屬性
    onSuccess: () => navigate('/game'),
  });

  function handleRoll() {
    if (stats === null) {
      // first roll doesn't consume a reset
      setStats(rollStats());
    } else if (resetsLeft > 0) {
      setStats(rollStats());
      setResetsLeft((n) => n - 1);
    }
  }

  const canRoll = stats === null || resetsLeft > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-4">
      <div className="w-full max-w-md space-y-5 sm:space-y-6 border-4 border-brown bg-cream-dark p-4 sm:p-8">
        {/* Title */}
        <h1 className="text-center font-pixel text-sm sm:text-lg text-brown">
          初始化你的電子雞
        </h1>

        {/* Name input */}
        <div className="space-y-2">
          <label className="block font-pixel text-xs text-brown">
            名字（2-10 字元）
          </label>
          <input
            type="text"
            maxLength={10}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="輸入電子雞名字..."
            className="w-full border-2 border-brown bg-cream px-3 py-2 font-pixel text-xs text-brown-dark outline-none placeholder:text-brown-light focus:border-orange min-h-[48px]"
          />
          {name.length > 0 && !nameValid && (
            <p className="font-pixel text-[10px] text-red-500">
              名字需要 2-10 個字元
            </p>
          )}
        </div>

        {/* Stats display */}
        {stats && (
          <div className="grid grid-cols-1 min-[361px]:grid-cols-2 gap-3">
            {STAT_CONFIG.map(({ key, icon, label }) => (
              <div
                key={key}
                className="flex items-center gap-2 border-2 border-brown bg-cream-dark p-3"
              >
                <span className="text-xl">{icon}</span>
                <div>
                  <p className="font-pixel text-[10px] text-brown-light">
                    {label}
                  </p>
                  <p className="font-pixel text-sm text-brown-dark">
                    {stats[key]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resets remaining */}
        {stats && (
          <p className="text-center font-pixel text-xs text-brown-light">
            剩餘重置次數：{resetsLeft}/{MAX_RESETS}
          </p>
        )}

        {/* Roll button */}
        <PixelButton
          onClick={handleRoll}
          disabled={!canRoll || mutation.isPending}
          className="w-full"
        >
          🎲 {stats === null ? '隨機初始化' : '重新骰屬性'}
        </PixelButton>

        {/* Confirm button */}
        <PixelButton
          variant="secondary"
          onClick={() => mutation.mutate()}
          disabled={!canConfirm || mutation.isPending}
          className="w-full"
        >
          {mutation.isPending ? '送出中...' : '✅ 確認，開始遊戲'}
        </PixelButton>

        {/* Error */}
        {mutation.isError && (
          <p className="text-center font-pixel text-[10px] text-red-500">
            {(mutation.error as Error).message || '初始化失敗，請重試'}
          </p>
        )}
      </div>
    </div>
  );
}
