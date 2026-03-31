import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import InitPage from './pages/InitPage';
import GamePage from './pages/GamePage';
import FeedPage from './pages/FeedPage';
import DeathPage from './pages/DeathPage';
import SettingsPage from './pages/SettingsPage';
import OfflineBanner from './components/OfflineBanner';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // PWA: detect new SW version and prompt user to refresh
  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.info('[SW] Registered:', swUrl);
      // Auto-reload when new SW activates
      r &&
        setTimeout(() => {
          r.addEventListener('statechange', (e) => {
            if ((e.target as ServiceWorker).state === 'activated') {
              window.location.reload();
            }
          });
        }, 1000);
    },
    onRegisterError(error) {
      console.error('[SW] Registration error:', error);
    },
  });

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  // PWA: periodically check for SW updates (every 60s)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const interval = setInterval(() => {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const reg of registrations) {
            void reg.update();
          }
        });
      }, 60_000);
      // Check once on load
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) {
          void reg.update();
        }
      });
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="min-h-screen bg-cream text-brown-dark">
      {isOffline && <OfflineBanner />}
      {/* PWA update available banner */}
      {needRefresh && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t-4 border-orange bg-cream px-4 py-3 shadow-pixel">
          <div className="flex items-center justify-between max-w-md mx-auto gap-3">
            <p className="font-pixel text-xs text-brown-dark flex-1">
              🌟 新版本已就緒！
            </p>
            <button
              onClick={() => { void updateServiceWorker(); }}
              className="shrink-0 border-2 border-brown bg-orange px-3 py-1 font-pixel text-[10px] text-white shadow-pixel-sm hover:bg-orange-dark transition-colors"
            >
              重新載入
            </button>
          </div>
        </div>
      )}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/init" element={<PrivateRoute><InitPage /></PrivateRoute>} />
        <Route path="/game" element={<PrivateRoute><GamePage /></PrivateRoute>} />
        <Route path="/feed" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
        <Route path="/death" element={<PrivateRoute><DeathPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
export default App;
