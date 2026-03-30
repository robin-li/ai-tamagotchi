import { getLastSyncTime } from '../services/offlineStorage';

export default function OfflineBanner() {
  const lastSync = getLastSyncTime();
  const formatted = lastSync
    ? new Date(lastSync).toLocaleString('zh-TW')
    : '未知';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b-2 border-orange-500 bg-yellow-200 px-4 py-2 text-center font-pixel text-[10px] text-orange-800 sm:text-xs">
      📴 目前離線，最後同步：{formatted}
    </div>
  );
}
