import { motion } from "framer-motion";
import { Trophy, CheckSquare, Square, Zap } from "lucide-react";
import type { Badge, UserBadge, ChecklistItem } from "@/hooks/useProgress";

const BEZIER = [0.16, 1, 0.3, 1] as const;

interface ProgressSectionProps {
  level: number;
  xp: number;
  xpToNext: number;
  allBadges: Badge[];
  earnedBadges: UserBadge[];
  checklist: ChecklistItem[];
  onToggleChecklist: (key: string) => void;
}

export default function ProgressSection({
  level,
  xp,
  xpToNext,
  allBadges,
  earnedBadges,
  checklist,
  onToggleChecklist,
}: ProgressSectionProps) {
  const earnedIds = new Set(earnedBadges.map((eb) => eb.badge_id));
  const progress = Math.min((xp / xpToNext) * 100, 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: BEZIER, delay: 0.1 }}
      className="space-y-6 mb-8"
    >
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
        My Progress
      </h3>

      {/* Level Bar */}
      <div className="bg-card rounded-[1.5rem] p-5 shadow-ceramic">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Level {level}</span>
          </div>
          <span className="text-xs text-muted-foreground">{xp} / {xpToNext} XP</span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: BEZIER }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>

      {/* Badge Gallery */}
      <div className="bg-card rounded-[1.5rem] p-5 shadow-ceramic">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={16} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Badge Gallery</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {allBadges.map((badge) => {
            const earned = earnedIds.has(badge.id);
            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                className={`flex flex-col items-center p-3 rounded-xl transition-colors ${
                  earned
                    ? "bg-primary/10"
                    : "bg-secondary opacity-50"
                }`}
              >
                <span className={`text-2xl mb-1 ${earned ? "" : "grayscale"}`}>{badge.icon}</span>
                <span className="text-[11px] font-semibold text-foreground text-center leading-tight">
                  {badge.name}
                </span>
                {earned && (
                  <span className="text-[9px] text-primary font-medium mt-0.5">Earned ✓</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Hobby Checklist */}
      <div className="bg-card rounded-[1.5rem] p-5 shadow-ceramic">
        <h4 className="text-sm font-semibold text-foreground mb-3">Hobby Checklist</h4>
        <div className="space-y-2.5">
          {checklist.map((item) => (
            <motion.button
              key={item.item_key}
              whileTap={{ scale: 0.97 }}
              onClick={() => onToggleChecklist(item.item_key)}
              className="flex items-center gap-3 w-full text-left cursor-pointer group"
            >
              {item.completed ? (
                <CheckSquare size={20} className="text-primary flex-shrink-0" />
              ) : (
                <Square size={20} className="text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
              )}
              <span
                className={`text-sm ${
                  item.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {item.item_label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
