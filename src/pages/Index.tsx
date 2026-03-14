import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import QuizModal from "@/components/QuizModal";
import ExploreTab from "@/components/ExploreTab";
import MentorTab from "@/components/MentorTab";
import CommunityFeed from "@/components/CommunityFeed";
import hobbyImage from "@/assets/hobby-linocut.jpg";

const BEZIER = [0.16, 1, 0.3, 1] as const;

const Index = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [savedHobbies, setSavedHobbies] = useState<string[]>([]);
  const [followedHobbies, setFollowedHobbies] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    setSavedHobbies((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    );
  };

  const handleQuizComplete = (hobbyName: string) => {
    setFollowedHobbies((prev) =>
      prev.includes(hobbyName) ? prev : [...prev, hobbyName]
    );
    setIsQuizOpen(false);
  };

  return (
    <div className="min-h-svh bg-background text-foreground selection:bg-primary/20">
      {/* Home Tab */}
      {activeTab === "home" && (
        <main className="px-6 pt-20 pb-32 max-w-md mx-auto">
          <header className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: BEZIER }}
            >
              <span className="text-xs font-bold tracking-[0.15em] uppercase text-primary/60 mb-4 block">
                Digital Sobriety
              </span>
              <h1 className="text-5xl leading-[1.1] tracking-tight mb-6">
                Trade the scroll for a{" "}
                <span className="italic text-primary">soul-filling</span> craft.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                HobbyPulse helps you reclaim your attention by matching your
                energy to tactile reality.
              </p>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsQuizOpen(true)}
                className="w-full py-5 px-8 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-between group shadow-ceramic-lg cursor-pointer"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>
          </header>

          <section className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground font-sans">
              Today's Pulse
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: BEZIER, delay: 0.2 }}
              className="rounded-[2rem] aspect-[4/5] flex flex-col justify-end relative overflow-hidden group shadow-ceramic"
            >
              <img
                src={hobbyImage}
                alt="Linocut printing supplies on linen"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
              <div className="relative z-10 p-6">
                <h3 className="text-2xl text-primary-foreground mb-2">
                  Linocut Printing
                </h3>
                <p className="text-primary-foreground/80 text-sm">
                  Low cost · High tactile satisfaction
                </p>
              </div>
            </motion.div>
          </section>

          {/* Community Feed */}
          <CommunityFeed followedHobbies={followedHobbies} />
        </main>
      )}

      {/* Explore Tab */}
      {activeTab === "explore" && (
        <ExploreTab savedHobbies={savedHobbies} onToggleSave={toggleSave} />
      )}

      {/* AI Mentor Tab */}
      {activeTab === "ai" && <MentorTab />}

      {/* Profile placeholder */}
      {activeTab === "profile" && (
        <div className="px-6 pt-20 pb-32 max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground text-lg text-center">
            Profile — coming soon
          </p>
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence>
        {isQuizOpen && (
          <QuizModal
            onClose={() => setIsQuizOpen(false)}
            onJoinCommunity={handleQuizComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
