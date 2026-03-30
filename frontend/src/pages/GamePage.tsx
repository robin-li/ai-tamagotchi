import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPet } from '../api/pet';
import StatBar from '../components/StatBar';
import PixelSprite from '../components/PixelSprite';
import PixelButton from '../components/PixelButton';

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

  // TODO: T10 完成後改接真實 GET /api/pet/feed/today
  const feedInfo = { count: 0, max: 3 };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  // 錯誤時導向初始化頁（useEffect 避免渲染中 navigate 警告）
  useEffect(() => {
    if (isError || (!isLoading && !pet)) {
      navigate('/init', { replace: true });
    }
  }, [isError, isLoading, pet, navigate]);

  // --- 載入中 ---
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="animate-bounce font-pixel text-brown">載入中...</p>
      </div>
    );
  }

  // --- 錯誤 / 電子雞不存在（等 useEffect 導向）---
  if (isError || !pet) {
    return null;
  }

  const remaining = feedInfo.max - feedInfo.count;
  const maxFeeds = feedInfo.max;
  const feedsUsed = feedInfo.count;
  const canFeed = remaining > 0;
  const hungry = isHungry(pet.lastFedAt);

  return (
    <div className="flex min-h-screen flex-col items-center bg-cream px-4 py-6">
      {/* 頂部：名字 + 登出 */}
      <div className="mb-6 flex w-full max-w-md items-center justify-between">
        <h1 className="font-pixel text-sm text-brown-dark">{pet.name}</h1>
        <PixelButton variant="secondary" onClick={handleLogout} className="!px-3 !py-1 !text-[10px] !border-2">
          登出
        </PixelButton>
      </div>

      {/* 中央主視覺 */}
      <div className="mb-4 flex flex-col items-center">
        <PixelSprite stage={pet.stage} size="lg" />
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
      <PixelButton
        disabled={!canFeed}
        onClick={() => navigate('/feed')}
        className="w-full max-w-md !py-4 !text-sm"
      >
        {canFeed ? '🍽️ 餵食！' : '今日餵食次數已用完'}
      </PixelButton>
    </div>
  );
}
