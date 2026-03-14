import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bookmark, BookmarkCheck, Zap, ArrowLeft, Clock, DollarSign, BarChart3 } from "lucide-react";
import { HOBBIES, CATEGORIES, type Hobby } from "@/data/hobbies";

const BEZIER = [0.16, 1, 0.3, 1] as const;

interface ExploreTabProps {
  savedHobbies: string[];
  onToggleSave: (id: string) => void;
}

export default function ExploreTab({ savedHobbies, onToggleSave }: ExploreTabProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);

  const filtered = HOBBIES.filter((h) => {
    const matchesCategory = activeCategory === "All" || h.category === activeCategory;
    const matchesSearch =
      search === "" ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="px-6 pt-14 pb-32 max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: BEZIER }}
        >
          <h1 className="text-3xl mb-6">Explore</h1>

          {/* Search */}
          <div className="relative mb-5">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search hobbies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-card rounded-lg border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground border border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cards feed */}
        <div className="space-y-5">
          {filtered.map((hobby, i) => (
            <HobbyCard
              key={hobby.id}
              hobby={hobby}
              index={i}
              saved={savedHobbies.includes(hobby.id)}
              onToggleSave={() => onToggleSave(hobby.id)}
              onOpen={() => setSelectedHobby(hobby)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No hobbies found. Try a different search.
            </p>
          )}
        </div>
      </div>

      {/* Hobby detail page */}
      <AnimatePresence>
        {selectedHobby && (
          <HobbyDetailPage
            hobby={selectedHobby}
            saved={savedHobbies.includes(selectedHobby.id)}
            onToggleSave={() => onToggleSave(selectedHobby.id)}
            onClose={() => setSelectedHobby(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface HobbyCardProps {
  hobby: Hobby;
  index: number;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}

function HobbyCard({ hobby, index, saved, onToggleSave, onOpen }: HobbyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: BEZIER, delay: index * 0.08 }}
      className="rounded-[1.5rem] overflow-hidden bg-card shadow-ceramic group cursor-pointer"
      onClick={onOpen}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={hobby.image}
          alt={hobby.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        {/* Quick Tip badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Zap size={12} className="text-accent-foreground" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
            Quick Tip
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary/60 block mb-1">
              {hobby.category}
            </span>
            <h3 className="text-xl font-serif-display leading-tight mb-2">{hobby.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {hobby.quickTip}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className="p-2.5 rounded-full bg-secondary hover:bg-primary/10 transition-colors duration-300 flex-shrink-0 cursor-pointer"
            aria-label={saved ? "Remove from saved" : "Save to My Hobbies"}
          >
            {saved ? (
              <BookmarkCheck size={18} className="text-primary" />
            ) : (
              <Bookmark size={18} className="text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

interface HobbyDetailPageProps {
  hobby: Hobby;
  saved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
}

function HobbyDetailPage({ hobby, saved, onToggleSave, onClose }: HobbyDetailPageProps) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.6, ease: BEZIER }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      {/* Hero image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={hobby.image} alt={hobby.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2.5 bg-background/80 backdrop-blur-sm rounded-full cursor-pointer"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 -mt-12 relative z-10 pb-32 max-w-md mx-auto">
        <span className="text-[11px] font-bold uppercase tracking-widest text-primary/60 block mb-2">
          {hobby.category}
        </span>
        <h1 className="text-4xl leading-tight mb-2">{hobby.name}</h1>
        <p className="text-lg text-muted-foreground mb-6">{hobby.tagline}</p>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <MetaPill icon={<BarChart3 size={14} />} label={hobby.difficulty} />
          <MetaPill icon={<DollarSign size={14} />} label={hobby.cost} />
          <MetaPill icon={<Clock size={14} />} label={hobby.timeCommitment} />
        </div>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onToggleSave}
          className={`w-full py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2.5 mb-10 cursor-pointer transition-colors duration-300 ${
            saved
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary text-primary-foreground shadow-ceramic-lg"
          }`}
        >
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          <span>{saved ? "Saved to My Hobbies" : "Save to My Hobbies"}</span>
        </motion.button>

        {/* Beginner's Guide */}
        <section className="mb-8">
          <h2 className="text-2xl mb-4">Beginner's Guide</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">{hobby.guide.intro}</p>

          <div className="space-y-4">
            {hobby.guide.steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-foreground/90 leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* First Project */}
        <section className="bg-card rounded-[1.5rem] p-6 shadow-ceramic">
          <h3 className="text-xl mb-3 flex items-center gap-2">
            <Zap size={18} className="text-primary" />
            Your First Project
          </h3>
          <p className="text-muted-foreground leading-relaxed">{hobby.guide.firstProject}</p>
        </section>
      </div>
    </motion.div>
  );
}

function MetaPill({ icon, label }: { icon: React.ReactElement; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
      <span className="text-primary">{icon}</span>
      <span className="text-xs font-medium text-secondary-foreground">{label}</span>
    </div>
  );
}
