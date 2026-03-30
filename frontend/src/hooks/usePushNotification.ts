import { useState, useEffect, useCallback, useRef } from 'react';
import {
  isNotificationSupported,
  getPermission,
  requestPermission as reqPerm,
  showNotification,
} from '../services/notification';

const HUNGER_THRESHOLD_MS = 1.5 * 60 * 60 * 1000; // 1.5 小時

interface UsePushNotificationReturn {
  permission: NotificationPermission;
  supported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  sendNotification: (title: string, body: string, icon?: string) => void;
  checkAndNotify: (petName: string, lastFedAt: string) => void;
}

export default function usePushNotification(): UsePushNotificationReturn {
  const supported = isNotificationSupported();
  const [permission, setPermission] = useState<NotificationPermission>(getPermission());
  const notifiedRef = useRef(false);

  // 監聽權限變化
  useEffect(() => {
    setPermission(getPermission());
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await reqPerm();
    setPermission(result);
    return result;
  }, []);

  const sendNotification = useCallback(
    (title: string, body: string, icon?: string) => {
      showNotification(title, { body, icon: icon ?? '/icons/icon-192.png' });
    },
    [],
  );

  const checkAndNotify = useCallback(
    (petName: string, lastFedAt: string) => {
      if (notifiedRef.current) return;
      if (permission !== 'granted') return;

      const diff = Date.now() - new Date(lastFedAt).getTime();
      if (diff > HUNGER_THRESHOLD_MS) {
        sendNotification(
          '🍽️ 餵食提醒',
          `${petName} 餓了！快回來餵食！`,
        );
        notifiedRef.current = true;
      }
    },
    [permission, sendNotification],
  );

  return { permission, supported, requestPermission, sendNotification, checkAndNotify };
}
