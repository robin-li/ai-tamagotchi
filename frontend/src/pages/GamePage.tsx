import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPet } from '../api/pet';
import StatBar from '../components/StatBar';
import PixelSprite from '../components/PixelSprite';
import PixelButton from '../components/PixelButton';
import PetSpeech from '../components/PetSpeech';
import NotificationPrompt from '../components/NotificationPrompt';
import usePushNotification from '../hooks/usePushNotification';
import useAIChat from '../hooks/useAIChat';
import { getPetFromCache } from '../services/offlineStorage';

/** 距離上次餵食是否超過 1.5 小時 */
function isHungry(lastFedAt: string): boolean {
  const diff = Date.now() - new Date(lastFedAt).getTime();
  return diff > 1.5 * 60 * 60 * 1000;
}

export default function GamePage() {
  const navigate = useNavigate();
  const { permission, supported, requestPermission, checkAndNotify } = usePushNotification();

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

  const aiChat = useAIChat();

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

  // 檢查是否需要發送餵食提醒通知
  useEffect(() => {
    if (pet?.lastFedAt && pet?.name) {
      checkAndNotify(pet.name, pet.lastFedAt);
    }
  }, [pet, checkAndNotify]);

  // --- 載入中：離線時嘗試使用快取 ---
  if (isLoading) {
    if (!navigator.onLine) {
      const cached = getPetFromCache();
      if (cached) {
        return <OfflineGameView pet={cached} navigate={navigate} />;
      }
      return (
        <div className="flex min-h-screen items-center justify-center bg-cream">
          <p className="font-pixel text-brown text-center text-xs px-4">
            📴 無網路且無快取資料，請連線後再試
          </p>
        </div>
      );
    }
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
      {/* 頂部：名字 + 設定 + 登出 */}
      <div className="mb-4 sm:mb-6 flex w-full max-w-md items-center justify-between">
        <h1 className="font-pixel text-xs sm:text-sm text-brown-dark">{pet.name}</h1>
        <div className="flex gap-2">
          <PixelButton variant="secondary" onClick={() => navigate('/settings')} className="!px-3 !py-1 !text-[10px] !border-2">
            設定
          </PixelButton>
          <PixelButton variant="secondary" onClick={handleLogout} className="!px-3 !py-1 !text-[10px] !border-2">
            登出
          </PixelButton>
        </div>
      </div>

      {/* 中央主視覺 */}
      <div className="mb-4 flex flex-col items-center">
        <PixelSprite
          stage={pet.stage}
          size="lg"
          onClick={() =>
            aiChat.trigger({
              trigger: 'tap',
              petName: pet.name,
              petHP: pet.stats.health,
            })
          }
        />
        <p className="mt-3 font-pixel text-xs text-brown">{pet.name}</p>
        <p className="mt-1 font-pixel text-[10px] text-brown-light">
          累計餵食 {pet.totalFeedings} 次
        </p>

        {/* AI 對話泡泡 */}
        {aiChat.loading && (
          <p className="mt-2 font-pixel text-[10px] text-brown-light animate-pulse">
            思考中...
          </p>
        )}
        {aiChat.isCoolingDown && !aiChat.message && (
          <PetSpeech
            message={`還在想事情，剩 ${aiChat.cooldownText}`}
            emotion="neutral"
            visible
          />
        )}
        {aiChat.message && (
          <PetSpeech
            message={aiChat.message}
            emotion={aiChat.emotion}
            visible
          />
        )}
      </div>

      {/* 衰退警告 */}
      {hungry && (
        <div className="mb-4 w-full max-w-md animate-pulse border-2 border-red-500 bg-red-100 p-3 text-center font-pixel text-[10px] text-red-700">
          &#x26A0;&#xFE0F; 電子雞餓了！快來餵食！
        </div>
      )}

      {/* 屬性面板 */}
      <div className="mb-4 grid w-full max-w-md grid-cols-2 gap-2 sm:gap-3">
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

      {/* 通知授權提示 */}
      {supported && (
        <NotificationPrompt permission={permission} onRequest={requestPermission} />
      )}
    </div>
  );
}

/** 離線時的唯讀遊戲畫面 */
function OfflineGameView({ pet, navigate }: { pet: import('../types').Pet; navigate: ReturnType<typeof useNavigate> }) {
  const hungry = isHungry(pet.lastFedAt);
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-cream px-4 py-6">
      <div className="mb-4 sm:mb-6 flex w-full max-w-md items-center justify-between">
        <h1 className="font-pixel text-xs sm:text-sm text-brown-dark">{pet.name}</h1>
        <PixelButton variant="secondary" onClick={handleLogout} className="!px-3 !py-1 !text-[10px] !border-2">
          登出
        </PixelButton>
      </div>

      <div className="mb-4 flex flex-col items-center">
        <PixelSprite stage={pet.stage} size="lg" />
        <p className="mt-3 font-pixel text-xs text-brown">{pet.name}</p>
        <p className="mt-1 font-pixel text-[10px] text-brown-light">
          累計餵食 {pet.totalFeedings} 次
        </p>
      </div>

      {hungry && (
        <div className="mb-4 w-full max-w-md animate-pulse border-2 border-red-500 bg-red-100 p-3 text-center font-pixel text-[10px] text-red-700">
          &#x26A0;&#xFE0F; 電子雞餓了！快來餵食！
        </div>
      )}

      <div className="mb-4 grid w-full max-w-md grid-cols-2 gap-2 sm:gap-3">
        <StatBar icon="❤️" label="生命" value={pet.stats.health} warningThreshold={30} />
        <StatBar icon="⚡" label="體力" value={pet.stats.stamina} />
        <StatBar icon="🍽️" label="胃口" value={pet.stats.appetite} />
        <StatBar icon="📏" label="體型" value={pet.stats.size} />
      </div>

      <PixelButton disabled className="w-full max-w-md !py-4 !text-sm">
        📴 離線中，無法餵食
      </PixelButton>
    </div>
  );
}
