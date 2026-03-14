import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BEZIER = [0.16, 1, 0.3, 1] as const;

interface LeaderboardEntry {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  post_count: number;
  total_likes: number;
  score: number;
}

export default function LeaderboardSection() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("leaderboard")
        .select("*")
        .limit(10);
      if (data) setEntries(data as unknown as LeaderboardEntry[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const rankIcons = [
    <Trophy size={20} className="text-yellow-500" />,
    <Medal size={20} className="text-gray-400" />,
    <Award size={20} className="text-amber-700" />,
  ];

  if (loading) {
    return (
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Leaderboard</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Leaderboard</h2>
        <div className="bg-card rounded-[1.5rem] p-6 shadow-ceramic text-center">
          <Flame size={28} className="text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No rankings yet. Be the first to post and claim the top spot!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
        Leaderboard
      </h2>
      <div className="space-y-3">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: BEZIER }}
            className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-ceramic"
          >
            <div className="w-8 flex items-center justify-center">
              {i < 3 ? rankIcons[i] : (
                <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              {entry.avatar_url ? (
                <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {(entry.display_name || "U")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{entry.display_name || "User"}</p>
              <p className="text-[11px] text-muted-foreground">
                {entry.post_count} posts · {entry.total_likes} likes
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">{entry.score}</p>
              <p className="text-[10px] text-muted-foreground uppercase">pts</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
