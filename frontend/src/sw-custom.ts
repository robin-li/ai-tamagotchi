/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// 立即接管所有 clients
self.addEventListener('install', () => {
  void self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Workbox precache manifest injection point
precacheAndRoute(self.__WB_MANIFEST);

// Runtime caching: GET /api/pet — NetworkFirst，離線時 fallback 到 cache
registerRoute(
  ({ url }) => url.pathname === '/api/pet',
  new NetworkFirst({
    cacheName: 'api-pet',
    networkTimeoutSeconds: 5,
  }),
);

// Runtime caching: GET /api/auth/me — StaleWhileRevalidate
registerRoute(
  ({ url }) => url.pathname === '/api/auth/me',
  new StaleWhileRevalidate({
    cacheName: 'api-auth',
  }),
);

/** push event handler */
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
