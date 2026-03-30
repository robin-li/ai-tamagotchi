import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPet, getDailyFeedCount } from '../api/pet';
import type { GrowthStage } from '../types';
import StatBar from '../components/StatBar';

const STAGE_EMOJI: Record<GrowthStage, string> = {
  egg: '\u{1F95A}',
  baby: '\u{1F423}',
  child: '\u{1F425}',
  adult: '\u{1F414}',
  elder: '\u{1F474}\u{1F414}',
};

/** 距離上次餵食是否超過 1.5 小時 */
function isHungry(lastFedAt: string): boolean {
  const diff = Date.now() - new Date(lastFedAt).getTime();
  return diff > 1.5 * 60 * 60 * 1000;
}

export default function GamePage() {
  const navigate = useNavigate();

  const {
    data: pet,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['pet'],
    queryFn: getPet,
    refetchInterval: 30_000,
    retry: 1,
  });

  const { data: feedInfo } = useQuery({
    queryKey: ['dailyFeed'],
    queryFn: getDailyFeedCount,
    refetchInterval: 30_000,
    enabled: !!pet,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  // --- 載入中 ---
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="animate-bounce font-pixel text-brown">載入中...</p>
      </div>
    );
  }

  // --- 錯誤 / 電子雞不存在 ---
  if (isError || !pet) {
    // 若 pet 不存在，導向初始化頁
    navigate('/init', { replace: true });
    return null;
  }

  const remaining = feedInfo ? feedInfo.max - feedInfo.count : 0;
  const maxFeeds = feedInfo?.max ?? 0;
  const feedsUsed = feedInfo?.count ?? 0;
  const canFeed = remaining > 0;
  const hungry = isHungry(pet.lastFedAt);

  return (
    <div className="flex min-h-screen flex-col items-center bg-cream px-4 py-6">
      {/* 頂部：名字 + 登出 */}
      <div className="mb-6 flex w-full max-w-md items-center justify-between">
        <h1 className="font-pixel text-sm text-brown-dark">{pet.name}</h1>
        <button
          onClick={handleLogout}
          className="border-2 border-brown bg-cream-dark px-3 py-1 font-pixel text-[10px] text-brown transition-colors hover:bg-brown hover:text-cream"
        >
          登出
        </button>
      </div>

      {/* 中央主視覺 */}
      <div className="mb-4 flex flex-col items-center">
        <span className="animate-float text-8xl">{STAGE_EMOJI[pet.stage]}</span>
        <p className="mt-3 font-pixel text-xs text-brown">{pet.name}</p>
        <p className="mt-1 font-pixel text-[10px] text-brown-light">
          累計餵食 {pet.totalFeedings} 次
        </p>
      </div>

      {/* 衰退警告 */}
      {hungry && (
        <div className="mb-4 w-full max-w-md animate-pulse border-2 border-red-500 bg-red-100 p-3 text-center font-pixel text-[10px] text-red-700">
          &#x26A0;&#xFE0F; 電子雞餓了！快來餵食！
        </div>
      )}

      {/* 屬性面板 */}
      <div className="mb-4 grid w-full max-w-md grid-cols-2 gap-3">
        <StatBar icon="❤️" label="生命" value={pet.stats.health} warningThreshold={30} />
        <StatBar icon="⚡" label="體力" value={pet.stats.stamina} />
        <StatBar icon="🍽️" label="胃口" value={pet.stats.appetite} />
        <StatBar icon="📏" label="體型" value={pet.stats.size} />
      </div>

      {/* 今日餵食次數 */}
      <p className="mb-4 font-pixel text-[10px] text-brown">
        今日餵食：{feedsUsed} / {maxFeeds}次
      </p>

      {/* 餵食按鈕 */}
      <button
        disabled={!canFeed}
        onClick={() => navigate('/feed')}
        className={`w-full max-w-md border-4 border-orange-dark px-6 py-4 font-pixel text-sm transition-all ${
          canFeed
            ? 'bg-orange text-white hover:-translate-y-0.5 hover:bg-orange-dark hover:shadow-lg active:translate-y-0'
            : 'cursor-not-allowed bg-gray-300 text-gray-500'
        }`}
      >
        {canFeed ? '🍽️ 餵食！' : '今日餵食次數已用完'}
      </button>
    </div>
  );
}
