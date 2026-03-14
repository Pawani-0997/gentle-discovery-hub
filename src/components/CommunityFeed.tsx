import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Calendar, MessageCircle, Plus, Loader2, Send, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import communityOrigami from "@/assets/community-origami.jpg";
import communityWatercolor from "@/assets/community-watercolor.jpg";
import communityHiking from "@/assets/community-hiking.jpg";
import communityChess from "@/assets/community-chess.jpg";

const BEZIER = [0.16, 1, 0.3, 1] as const;

interface CommunityPost {
  id: string;
  username: string;
  avatar: string;
  hobby: string;
  image: string;
  caption: string;
  daysActive: number;
  cheers: number;
  comments: number;
  isReal?: boolean;
  user_id?: string;
}

const MOCK_POSTS: CommunityPost[] = [
  {
    id: "mock-1",
    username: "PaperCraneKai",
    avatar: "🦢",
    hobby: "Origami",
    image: communityOrigami,
    caption: "Day 12 — folded 30 cranes so far! The modular ones are getting easier.",
    daysActive: 12,
    cheers: 24,
    comments: 5,
  },
  {
    id: "mock-2",
    username: "SunsetBrush",
    avatar: "🎨",
    hobby: "Watercolor",
    image: communityWatercolor,
    caption: "First sunset painting using only 3 colors. The wet-on-wet technique is magical!",
    daysActive: 7,
    cheers: 41,
    comments: 8,
  },
  {
    id: "mock-3",
    username: "TrailRunner_Mia",
    avatar: "🥾",
    hobby: "Hiking",
    image: communityHiking,
    caption: "Golden hour on the ridge trail. 5 miles today — my longest yet!",
    daysActive: 21,
    cheers: 63,
    comments: 12,
  },
  {
    id: "mock-4",
    username: "CheckmateNova",
    avatar: "♟️",
    hobby: "Chess",
    image: communityChess,
    caption: "Finally beat the 1200 bot! Focusing on controlling the center made all the difference.",
    daysActive: 14,
    cheers: 18,
    comments: 3,
  },
];

interface CommunityFeedProps {
  followedHobbies: string[];
}

export default function CommunityFeed({ followedHobbies }: CommunityFeedProps) {
  const { user } = useAuth();
  const [realPosts, setRealPosts] = useState<CommunityPost[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: postsData } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (postsData) {
        // Fetch like counts for these posts
        const postIds = postsData.map((p: any) => p.id);
        const { data: likeCounts } = await supabase
          .from("likes")
          .select("post_id")
          .in("post_id", postIds.length > 0 ? postIds : ["none"]);

        const likeMap: Record<string, number> = {};
        (likeCounts || []).forEach((l: any) => {
          likeMap[l.post_id] = (likeMap[l.post_id] || 0) + 1;
        });

        // Fetch profiles for usernames
        const userIds = [...new Set(postsData.map((p: any) => p.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds.length > 0 ? userIds : ["none"]);

        const profileMap: Record<string, any> = {};
        (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p; });

        const mapped: CommunityPost[] = postsData.map((p: any) => ({
          id: p.id,
          username: profileMap[p.user_id]?.display_name || "User",
          avatar: "👤",
          hobby: p.hobby,
          image: p.image_url || communityOrigami,
          caption: p.caption,
          daysActive: Math.max(1, Math.floor((Date.now() - new Date(p.created_at).getTime()) / 86400000)),
          cheers: likeMap[p.id] || 0,
          comments: 0,
          isReal: true,
          user_id: p.user_id,
        }));
        setRealPosts(mapped);
      }
    };
    fetchPosts();
  }, []);

  const allPosts = [...realPosts, ...MOCK_POSTS];
  const filteredPosts = followedHobbies.length > 0
    ? allPosts.filter((p) =>
        followedHobbies.some((h) => p.hobby.toLowerCase().includes(h.toLowerCase()))
      )
    : allPosts;
  const displayPosts = filteredPosts.length > 0 ? filteredPosts : allPosts;

  return (
    <section className="space-y-5 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground font-sans">
          Community Feed
        </h2>
        <div className="flex items-center gap-2">
          {followedHobbies.length > 0 && (
            <span className="text-[11px] font-medium text-primary/60 bg-primary/10 px-2.5 py-1 rounded-full">
              Following {followedHobbies.length}
            </span>
          )}
          {user && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowCreatePost(true)}
              className="p-2 bg-primary text-primary-foreground rounded-full cursor-pointer"
            >
              <Plus size={16} />
            </motion.button>
          )}
        </div>
      </div>

      {showCreatePost && user && (
        <CreatePostCard
          userId={user.id}
          onClose={() => setShowCreatePost(false)}
          onCreated={(post) => {
            setRealPosts((prev) => [post, ...prev]);
            setShowCreatePost(false);
          }}
        />
      )}

      <div className="space-y-4">
        {displayPosts.map((post, i) => (
          <FeedCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </section>
  );
}

function CreatePostCard({
  userId,
  onClose,
  onCreated,
}: {
  userId: string;
  onClose: () => void;
  onCreated: (post: CommunityPost) => void;
}) {
  const [caption, setCaption] = useState("");
  const [hobby, setHobby] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!caption.trim() || !hobby.trim()) {
      toast.error("Please fill in both fields");
      return;
    }
    setPosting(true);
    const { data, error } = await supabase
      .from("posts")
      .insert({ user_id: userId, caption, hobby })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create post");
    } else if (data) {
      onCreated({
        id: data.id,
        username: "You",
        avatar: "👤",
        hobby: data.hobby,
        image: communityOrigami,
        caption: data.caption,
        daysActive: 1,
        cheers: 0,
        comments: 0,
        isReal: true,
        user_id: data.user_id,
      });
      toast.success("Post shared! 🎉");
    }
    setPosting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="bg-card rounded-[1.5rem] p-5 shadow-ceramic overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Share Your Progress</h3>
        <button onClick={onClose} className="text-muted-foreground cursor-pointer"><X size={18} /></button>
      </div>
      <input
        placeholder="What hobby? (e.g. Origami)"
        value={hobby}
        onChange={(e) => setHobby(e.target.value)}
        className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm mb-2 border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
      />
      <textarea
        placeholder="Share what you've been working on..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="w-full px-4 py-2.5 bg-secondary rounded-lg text-sm mb-3 resize-none h-20 border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
      />
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handlePost}
        disabled={posting}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
      >
        {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        Post
      </motion.button>
    </motion.div>
  );
}

function FeedCard({ post, index }: { post: CommunityPost; index: number }) {
  const { user } = useAuth();
  const [cheered, setCheered] = useState(false);
  const [cheerCount, setCheerCount] = useState(post.cheers);
  const [loading, setLoading] = useState(false);

  // Check if user already liked this post
  useEffect(() => {
    if (!user || !post.isReal) return;
    supabase
      .from("likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data && data.length > 0) setCheered(true);
      });
  }, [user, post.id, post.isReal]);

  const handleCheer = async () => {
    // For mock posts or unauthenticated, just toggle locally
    if (!user || !post.isReal) {
      if (!cheered) setCheerCount((c) => c + 1);
      else setCheerCount((c) => c - 1);
      setCheered(!cheered);
      return;
    }

    setLoading(true);
    if (!cheered) {
      const { error } = await supabase
        .from("likes")
        .insert({ user_id: user.id, post_id: post.id });
      if (!error) {
        setCheerCount((c) => c + 1);
        setCheered(true);
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", post.id);
      if (!error) {
        setCheerCount((c) => c - 1);
        setCheered(false);
      }
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: BEZIER, delay: index * 0.08 }}
      className="bg-card rounded-[1.5rem] overflow-hidden shadow-ceramic"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg">
          {post.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{post.username}</p>
          <p className="text-[11px] text-muted-foreground">{post.hobby}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full">
          <Calendar size={12} className="text-primary" />
          <span className="text-[11px] font-bold text-primary">{post.daysActive}d active</span>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square overflow-hidden">
        <img src={post.image} alt={post.caption} className="w-full h-full object-cover" loading="lazy" />
      </div>

      {/* Actions */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-4 mb-3">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleCheer}
            disabled={loading}
            className="flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Heart
              size={20}
              className={cheered ? "fill-primary text-primary" : "text-muted-foreground"}
            />
            <span className={`text-sm font-medium ${cheered ? "text-primary" : "text-muted-foreground"}`}>
              {cheerCount}
            </span>
          </motion.button>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MessageCircle size={18} />
            <span className="text-sm">{post.comments}</span>
          </div>
          {cheered && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full"
            >
              Great Work! 🎉
            </motion.span>
          )}
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{post.caption}</p>
      </div>
    </motion.div>
  );
}
