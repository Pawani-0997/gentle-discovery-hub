import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface BadgeCelebrationProps {
  badge: { name: string; icon: string; description: string } | null;
  onClose: () => void;
}

export default function BadgeCelebration({ badge, onClose }: BadgeCelebrationProps) {
  useEffect(() => {
    if (!badge) return;
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#4a7c59", "#d4a853", "#e8d5b7"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#4a7c59", "#d4a853", "#e8d5b7"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [badge]);

  if (!badge) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-[2rem] p-8 max-w-xs w-full mx-6 text-center shadow-ceramic-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, damping: 10 }}
          className="text-6xl mb-4"
        >
          {badge.icon}
        </motion.div>
        <h2 className="text-2xl mb-2 text-foreground">Badge Earned!</h2>
        <p className="text-lg font-semibold text-primary mb-1">{badge.name}</p>
        <p className="text-sm text-muted-foreground mb-6">{badge.description}</p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onClose}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer"
        >
          Awesome!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
