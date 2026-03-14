import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bookmark, BookmarkCheck, Zap, ArrowLeft, Clock, DollarSign, BarChart3, Plus, Users, Crown } from "lucide-react";
import { HOBBIES, CATEGORIES, type Hobby } from "@/data/hobbies";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import CreateCommunityForm from "./CreateCommunityForm";
import CommunityPage from "./CommunityPage";
import CommunityQuickChat from "./CommunityQuickChat";

const BEZIER = [0.16, 1, 0.3, 1] as const;

interface Community {
  id: string;
  name: string;
  description: string;
  cover_image_url: string | null;
  tags: string[];
  creator_id: string;
  member_count: number;
  created_at: string;
}

interface ExploreTabProps {
  savedHobbies: string[];
  onToggleSave: (id: string) => void;
}

export default function ExploreTab({ savedHobbies, onToggleSave }: ExploreTabProps) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [chatCommunity, setChatCommunity] = useState<Community | null>(null);

  const fetchCommunities = async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setCommunities(data as Community[]);
  };

  const fetchJoined = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("community_members")
      .select("community_id")
      .eq("user_id", user.id);
    if (data) setJoinedIds(new Set(data.map((d: any) => d.community_id)));
  };

  useEffect(() => {
    fetchCommunities();
    fetchJoined();
  }, [user]);

  const handleJoin = async (communityId: string, communityName: string) => {
    if (!user) return;
    setJoiningId(communityId);
    try {
      if (joinedIds.has(communityId)) {
        await supabase.from("community_members").delete().eq("community_id", communityId).eq("user_id", user.id);
        await supabase.from("communities").update({ member_count: Math.max(0, (communities.find(c => c.id === communityId)?.member_count ?? 1) - 1) }).eq("id", communityId);
        setJoinedIds((prev) => { const n = new Set(prev); n.delete(communityId); return n; });
        toast(`Left ${communityName}`);
      } else {
        await supabase.from("community_members").insert({ community_id: communityId, user_id: user.id, role: "member" });
        await supabase.from("communities").update({ member_count: (communities.find(c => c.id === communityId)?.member_count ?? 0) + 1 }).eq("id", communityId);
        setJoinedIds((prev) => new Set(prev).add(communityId));
        toast.success(`Welcome to the ${communityName} tribe! 🎉`);
      }
      fetchCommunities();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setJoiningId(null);
    }
  };

  const filtered = HOBBIES.filter((h) => {
    const matchesCategory = activeCategory === "All" || h.category === activeCategory;
    const matchesSearch =
      search === "" ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredCommunities = communities.filter(
    (c) =>
      search === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

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
              placeholder="Search hobbies & communities..."
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

        {/* User Communities Section */}
        {filteredCommunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: BEZIER, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Hobby Communities
            </h2>
            <div className="space-y-4">
              {filteredCommunities.map((community, i) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  index={i}
                  joined={joinedIds.has(community.id)}
                  isCreator={community.creator_id === user?.id}
                  joining={joiningId === community.id}
                  onJoin={() => handleJoin(community.id, community.name)}
                  onOpen={() => setSelectedCommunity(community)}
                  onDiscussion={() => setChatCommunity(community)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Hobbies Cards */}
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
          {filtered.length === 0 && filteredCommunities.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No hobbies or communities found. Try a different search.
            </p>
          )}
        </div>
      </div>

      {/* Floating Create Button */}
      {user && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCreateForm(true)}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-ceramic-lg flex items-center justify-center cursor-pointer z-40"
          aria-label="Create community"
        >
          <Plus size={24} />
        </motion.button>
      )}

      {/* Create Community Form */}
      <CreateCommunityForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onCreated={() => { fetchCommunities(); fetchJoined(); }}
      />

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
        {selectedCommunity && (
          <CommunityPage
            community={selectedCommunity}
            onClose={() => setSelectedCommunity(null)}
          />
        )}
        {chatCommunity && (
          <CommunityQuickChat
            communityId={chatCommunity.id}
            communityName={chatCommunity.name}
            isMember={joinedIds.has(chatCommunity.id) || chatCommunity.creator_id === user?.id}
            onClose={() => setChatCommunity(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Community Card ── */

interface CommunityCardProps {
  community: Community;
  index: number;
  joined: boolean;
  isCreator: boolean;
  joining: boolean;
  onJoin: () => void;
  onOpen: () => void;
}

function CommunityCard({ community, index, joined, isCreator, joining, onJoin, onOpen }: CommunityCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: BEZIER, delay: index * 0.06 }}
      className="rounded-[1.5rem] overflow-hidden bg-card shadow-ceramic cursor-pointer"
      onClick={onOpen}
    >
      {/* Cover */}
      {community.cover_image_url && (
        <div className="aspect-[16/7] overflow-hidden">
          <img
            src={community.cover_image_url}
            alt={community.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-serif-display leading-tight">{community.name}</h3>
          {isCreator && (
            <Crown size={14} className="text-accent-foreground flex-shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {community.description}
        </p>
        {community.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {community.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-secondary text-[11px] font-medium text-secondary-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users size={13} />
            {community.member_count} {community.member_count === 1 ? "member" : "members"}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onJoin(); }}
          disabled={joining || isCreator}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            isCreator
              ? "bg-accent/40 text-accent-foreground cursor-default"
              : joined
              ? "bg-secondary text-secondary-foreground border border-border"
              : "bg-primary text-primary-foreground shadow-ceramic"
          }`}
        >
          {isCreator ? (
            <><Crown size={15} /> Admin</>
          ) : joined ? (
            <><Users size={15} /> Member ✓</>
          ) : (
            <><Users size={15} /> Join Community</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Hobby Card (unchanged) ── */

interface HobbyCardProps {
  hobby: Hobby;
  index: number;
  saved: boolean;
  onToggleSave: () => void;
  onOpen: () => void;
}

function HobbyCard({ hobby, index, saved, onToggleSave, onOpen }: HobbyCardProps) {
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave();
    if (!saved) {
      toast.success(`Welcome to the ${hobby.name} tribe! 🎉`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: BEZIER, delay: index * 0.08 }}
      className="rounded-[1.5rem] overflow-hidden bg-card shadow-ceramic group cursor-pointer"
      onClick={onOpen}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={hobby.image}
          alt={hobby.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Zap size={12} className="text-accent-foreground" />
          <span className="text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
            Quick Tip
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
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
            onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
            className="p-2.5 rounded-full bg-secondary hover:bg-primary/10 transition-colors duration-300 flex-shrink-0 cursor-pointer"
            aria-label={saved ? "Remove from saved" : "Save to My Hobbies"}
          >
            {saved ? <BookmarkCheck size={18} className="text-primary" /> : <Bookmark size={18} className="text-muted-foreground" />}
          </button>
        </div>
        <button
          onClick={handleJoinClick}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            saved
              ? "bg-secondary text-secondary-foreground border border-border"
              : "bg-primary text-primary-foreground shadow-ceramic"
          }`}
        >
          {saved ? (
            <><Users size={15} /> Member ✓</>
          ) : (
            <><Users size={15} /> Join Community</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

/* ── Hobby Detail Page (unchanged) ── */

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
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={hobby.image} alt={hobby.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <button onClick={onClose} className="absolute top-6 left-6 p-2.5 bg-background/80 backdrop-blur-sm rounded-full cursor-pointer">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
      </div>
      <div className="px-6 -mt-12 relative z-10 pb-32 max-w-md mx-auto">
        <span className="text-[11px] font-bold uppercase tracking-widest text-primary/60 block mb-2">{hobby.category}</span>
        <h1 className="text-4xl leading-tight mb-2">{hobby.name}</h1>
        <p className="text-lg text-muted-foreground mb-6">{hobby.tagline}</p>
        <div className="flex flex-wrap gap-2 mb-8">
          <MetaPill icon={<BarChart3 size={14} />} label={hobby.difficulty} />
          <MetaPill icon={<DollarSign size={14} />} label={hobby.cost} />
          <MetaPill icon={<Clock size={14} />} label={hobby.timeCommitment} />
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onToggleSave}
          className={`w-full py-4 px-6 rounded-lg font-medium flex items-center justify-center gap-2.5 mb-10 cursor-pointer transition-colors duration-300 ${
            saved ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground shadow-ceramic-lg"
          }`}
        >
          {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          <span>{saved ? "Saved to My Hobbies" : "Save to My Hobbies"}</span>
        </motion.button>
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
