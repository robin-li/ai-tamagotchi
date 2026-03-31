import { motion, AnimatePresence } from 'framer-motion';

export type Emotion = 'excited' | 'neutral' | 'sad' | 'happy';

export interface PetSpeechProps {
  message: string;
  emotion: Emotion;
  visible: boolean;
}

const EMOTION_EMOJI: Record<Emotion, string> = {
  excited: '\u{1F60A}', // 😊
  neutral: '\u{1F610}', // 😐
  sad: '\u{1F622}',     // 😢
  happy: '\u{1F389}',   // 🎉
};

export default function PetSpeech({ message, emotion, visible }: PetSpeechProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative mt-3 max-w-[260px]"
        >
          {/* 上方小三角（指向電子雞） */}
          <div className="mx-auto h-0 w-0 border-x-8 border-b-8 border-x-transparent border-b-brown" />

          {/* 泡泡本體 */}
          <div className="border-2 border-brown bg-cream-dark rounded-xl shadow-sm px-4 py-2 text-center">
            <span className="mr-1 text-sm">{EMOTION_EMOJI[emotion]}</span>
            <span className="font-pixel text-xs text-brown-dark leading-relaxed">
              {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
