import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import PixelButton from '../components/PixelButton';

export default function DeathPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();

  const petName = params.get('petName') ?? '電子雞';
  const totalFeedings = Number(params.get('totalFeedings') ?? 0);

  // 禁止返回上一頁
  useEffect(() => {
    const block = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', block);
    return () => window.removeEventListener('popstate', block);
  }, []);

  const handleAdopt = () => {
    // 清除 pet 相關快取
    queryClient.removeQueries({ queryKey: ['pet'] });
    navigate('/init', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      {/* 墓碑區 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center"
      >
        <span className="text-8xl drop-shadow-lg">🪦</span>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-6 font-pixel text-sm text-brown-dark"
        >
          {petName} 已經永遠離開了…
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mt-3 font-pixel text-[10px] text-brown-light"
        >
          曾被餵食 {totalFeedings} 次
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-2 font-pixel text-[10px] text-brown-light"
        >
          感謝你的陪伴 🕊️
        </motion.p>
      </motion.div>

      {/* 分隔線 */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.8, duration: 0.6 }}
        className="my-8 h-[2px] w-48 bg-brown-light opacity-40"
      />

      {/* 領養新電子雞按鈕 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.6 }}
      >
        <PixelButton onClick={handleAdopt}>
          🌱 領養新電子雞
        </PixelButton>
      </motion.div>
    </div>
  );
}
