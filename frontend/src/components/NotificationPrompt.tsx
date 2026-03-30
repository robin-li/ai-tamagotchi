import PixelButton from './PixelButton';

interface NotificationPromptProps {
  permission: NotificationPermission;
  onRequest: () => void;
}

export default function NotificationPrompt({ permission, onRequest }: NotificationPromptProps) {
  // 已授權或不需要顯示
  if (permission === 'granted') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[260px] border-4 border-brown bg-cream p-3 shadow-pixel">
      {permission === 'denied' ? (
        <p className="font-pixel text-[10px] leading-relaxed text-red-600">
          🔕 通知已被封鎖，請至瀏覽器設定解除封鎖以接收餵食提醒。
        </p>
      ) : (
        <>
          <p className="mb-2 font-pixel text-[10px] leading-relaxed text-brown-dark">
            🔔 開啟通知，讓電子雞餓了時提醒你！
          </p>
          <PixelButton
            onClick={onRequest}
            className="!w-full !py-2 !text-[10px] !border-2"
          >
            開啟通知提醒
          </PixelButton>
        </>
      )}
    </div>
  );
}
