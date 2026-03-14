import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";

const BEZIER = [0.16, 1, 0.3, 1] as const;

const QUIZ_STEPS = [
  {
    id: 1,
    question: "What draws you in?",
    options: [
      { label: "Creative", description: "Making things with your hands" },
      { label: "Analytical", description: "Solving puzzles & problems" },
    ],
  },
  {
    id: 2,
    question: "Where do you thrive?",
    options: [
      { label: "Indoor", description: "Cozy spaces, rain or shine" },
      { label: "Outdoor", description: "Fresh air & open skies" },
    ],
  },
  {
    id: 3,
    question: "How much time can you commit?",
    options: [
      { label: "15 mins/day", description: "Quick daily ritual" },
      { label: "1+ hour/day", description: "Deep, focused sessions" },
    ],
  },
  {
    id: 4,
    question: "What's your budget?",
    options: [
      { label: "$0", description: "Free or nearly free" },
      { label: "$$$", description: "Happy to invest in gear" },
    ],
  },
];

type Answers = Record<number, string>;

interface HobbyResult {
  name: string;
  tagline: string;
  emoji: string;
}

function getHobbyResult(answers: Answers): HobbyResult {
  const style = answers[1];
  const place = answers[2];
  const budget = answers[4];

  if (style === "Creative" && place === "Indoor" && budget === "$0") {
    return { name: "Sketching or Origami", tagline: "Zero cost, infinite expression", emoji: "✏️" };
  }
  if (style === "Creative" && place === "Outdoor" && budget === "$$$") {
    return { name: "Photography", tagline: "Capture the world through your lens", emoji: "📷" };
  }
  if (style === "Analytical" && place === "Indoor" && budget === "$0") {
    return { name: "Coding or Chess", tagline: "Sharpen your mind, one move at a time", emoji: "♟️" };
  }
  if (style === "Creative" && place === "Indoor" && budget === "$$$") {
    return { name: "Pottery or Painting", tagline: "Invest in your craft, shape something real", emoji: "🎨" };
  }
  if (style === "Creative" && place === "Outdoor" && budget === "$0") {
    return { name: "Nature Journaling", tagline: "Sketch and document the world around you", emoji: "🌿" };
  }
  if (style === "Analytical" && place === "Outdoor" && budget === "$0") {
    return { name: "Birdwatching or Geocaching", tagline: "Explore patterns in the wild", emoji: "🐦" };
  }
  if (style === "Analytical" && place === "Outdoor" && budget === "$$$") {
    return { name: "Amateur Astronomy", tagline: "Map the cosmos from your backyard", emoji: "🔭" };
  }
  if (style === "Analytical" && place === "Indoor" && budget === "$$$") {
    return { name: "Electronics or 3D Printing", tagline: "Build the future with your hands and mind", emoji: "🔧" };
  }
  return { name: "Journaling", tagline: "A timeless practice for any path", emoji: "📓" };
}

interface QuizModalProps {
  onClose: () => void;
  onJoinCommunity?: (hobbyName: string) => void;
}

export default function QuizModal({ onClose, onJoinCommunity }: QuizModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option: string) => {
    const newAnswers = { ...answers, [step + 1]: option };
    setAnswers(newAnswers);

    if (step < QUIZ_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const result = showResult ? getHobbyResult(answers) : null;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.6, ease: BEZIER }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <div className="h-1.5 flex-1 max-w-[10rem] bg-card rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{
              width: showResult
                ? "100%"
                : `${((step + 1) / QUIZ_STEPS.length) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: BEZIER }}
          />
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-card rounded-full text-foreground ml-4"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 pt-8 flex flex-col">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: BEZIER }}
              className="flex-1"
            >
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary/60 mb-3">
                Question {step + 1} of {QUIZ_STEPS.length}
              </p>
              <h2 className="text-3xl mb-10">{QUIZ_STEPS[step].question}</h2>
              <div className="grid gap-4">
                {QUIZ_STEPS[step].options.map((option) => (
                  <motion.button
                    key={option.label}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(option.label)}
                    className="w-full p-6 text-left rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300 flex justify-between items-center group cursor-pointer"
                  >
                    <div>
                      <span className="text-lg font-medium block">
                        {option.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                    <ArrowRight
                      size={18}
                      className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300"
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: BEZIER }}
                className="flex-1 flex flex-col items-center justify-center text-center pb-20"
              >
                <motion.span
                  className="text-7xl mb-6 block"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, ease: BEZIER, delay: 0.2 }}
                >
                  {result.emoji}
                </motion.span>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary/60 mb-3">
                  Your perfect match
                </p>
                <h2 className="text-4xl mb-3">{result.name}</h2>
                <p className="text-lg text-muted-foreground mb-12 max-w-xs">
                  {result.tagline}
                </p>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className="w-full max-w-xs py-5 px-8 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-3 shadow-ceramic-lg cursor-pointer"
                >
                  <Sparkles size={18} />
                  <span>Join Community</span>
                </motion.button>

                <button
                  onClick={() => {
                    setStep(0);
                    setAnswers({});
                    setShowResult(false);
                  }}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Retake quiz
                </button>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
