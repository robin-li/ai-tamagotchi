import { motion } from 'framer-motion';
import type { GrowthStage } from '../types';

const STAGE_EMOJI: Record<GrowthStage, string> = {
  egg: '\u{1F95A}',
  baby: '\u{1F423}',
  child: '\u{1F425}',
  adult: '\u{1F414}',
  elder: '\u{1F474}\u{1F414}',
};

interface PixelSpriteProps {
  stage: GrowthStage;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const SIZE_MAP = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
} as const;

export default function PixelSprite({ stage, size = 'lg', animate = true }: PixelSpriteProps) {
  return (
    <motion.span
      className={`inline-block ${SIZE_MAP[size]} leading-none`}
      animate={animate ? { y: [0, -10, 0] } : undefined}
      transition={animate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {STAGE_EMOJI[stage]}
    </motion.span>
  );
}
