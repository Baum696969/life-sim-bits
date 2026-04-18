import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import logo from '@/assets/gitlife-logo.png';
import splashBg from '@/assets/splash-bg.jpg';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 2400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Cyberpunk background */}
          <img
            src={splashBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            width={1024}
            height={1536}
          />
          <div className="absolute inset-0 bg-background/40" />

          {/* Glowing pulse */}
          <motion.div
            className="absolute w-72 h-72 rounded-full bg-primary/30 blur-3xl"
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
          />

          {/* Logo */}
          <motion.img
            src={logo}
            alt="GitLife"
            className="relative z-10 w-72 md:w-96 h-auto drop-shadow-[0_0_30px_hsl(var(--primary)/0.6)]"
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            width={400}
            height={400}
          />

          {/* Tagline */}
          <motion.p
            className="text-foreground/80 font-mono mt-2 text-sm md:text-base relative z-10 tracking-wide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Dein Leben. Deine Entscheidungen.
          </motion.p>

          {/* Loading bar */}
          <motion.div
            className="mt-8 h-1 rounded-full bg-primary/30 w-48 overflow-hidden relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <motion.div
              className="h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.9, duration: 1.4, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
