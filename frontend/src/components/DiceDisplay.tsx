import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'] as const;

interface DiceDisplayProps {
  value: number;       // 1-6
  isRolling: boolean;
}

export default function DiceDisplay({ value, isRolling }: DiceDisplayProps) {
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    if (!isRolling) return;
    const interval = setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % 6);
    }, 80);
    return () => clearInterval(interval);
  }, [isRolling]);

  const face = isRolling ? DICE_FACES[displayIndex] : DICE_FACES[value - 1];

  return (
    <motion.div
      className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center border-4 border-brown bg-cream-dark"
      animate={
        isRolling
          ? { rotate: [0, 10, -10, 5, -5, 0], scale: [1, 1.05, 0.95, 1] }
          : { rotate: 0, scale: 1 }
      }
      transition={
        isRolling
          ? { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 300, damping: 20 }
      }
    >
      <span className="text-5xl sm:text-7xl leading-none">{face}</span>
    </motion.div>
  );
}
