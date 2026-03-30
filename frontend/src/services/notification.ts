/** 檢查瀏覽器是否支援通知 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/** 取得目前通知權限狀態 */
export function getPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/** 請求通知權限 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  return Notification.requestPermission();
}

/** 顯示本地通知 */
export function showNotification(title: string, options?: NotificationOptions): void {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  // 優先透過 Service Worker 發送（PWA 支援）
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        ...options,
      });
    });
  } else {
    new Notification(title, {
      icon: '/icons/icon-192.png',
      ...options,
    });
  }
}
