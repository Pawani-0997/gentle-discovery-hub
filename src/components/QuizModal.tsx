import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const BEZIER = [0.16, 1, 0.3, 1] as const;

const QUIZ_STEPS = [
  {
    id: 1,
    question: "How do you want to feel?",
    options: ["Energized", "Calm", "Productive", "Creative"],
  },
  {
    id: 2,
    question: "Where is your focus?",
    options: ["Hands-on", "Intellectual", "Outdoors", "Digital-to-Physical"],
  },
  {
    id: 3,
    question: "Available time daily?",
    options: ["15 mins", "1 hour", "Weekends only"],
  },
];

interface QuizModalProps {
  onClose: () => void;
}

export default function QuizModal({ onClose }: QuizModalProps) {
  const [step, setStep] = useState(0);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.6, ease: BEZIER }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      <div className="p-6 flex justify-between items-center">
        <div className="h-1.5 w-32 bg-card rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{
              width: `${((step + 1) / QUIZ_STEPS.length) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: BEZIER }}
          />
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-card rounded-full text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 px-8 pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: BEZIER }}
          >
            <h2 className="text-3xl mb-10">{QUIZ_STEPS[step].question}</h2>
            <div className="grid gap-4">
              {QUIZ_STEPS[step].options.map((option) => (
                <motion.button
                  key={option}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    step < QUIZ_STEPS.length - 1
                      ? setStep(step + 1)
                      : onClose()
                  }
                  className="w-full p-6 text-left rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 flex justify-between items-center group"
                >
                  <span className="text-lg font-medium">{option}</span>
                  <div className="w-6 h-6 rounded-full border-2 border-border group-hover:border-primary flex items-center justify-center transition-colors">
                    <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
