/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

// Workbox precache manifest injection point
precacheAndRoute(self.__WB_MANIFEST);

/** 預留 push event handler — 等後端實作後可直接啟用 */
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? '🍽️ 餵食提醒';
  const options: NotificationOptions = {
    body: data.body ?? '你的電子雞餓了！快回來餵食！',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url ?? '/game' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

/** 點擊通知時開啟遊戲頁面 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data?.url as string) ?? '/game';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
