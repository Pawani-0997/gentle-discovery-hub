import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Calendar, MessageCircle } from "lucide-react";

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
}

const MOCK_POSTS: CommunityPost[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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
  const posts = followedHobbies.length > 0
    ? MOCK_POSTS.filter((p) =>
        followedHobbies.some((h) => p.hobby.toLowerCase().includes(h.toLowerCase()))
      )
    : MOCK_POSTS;

  const displayPosts = posts.length > 0 ? posts : MOCK_POSTS;

  return (
    <section className="space-y-5 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground font-sans">
          Community Feed
        </h2>
        {followedHobbies.length > 0 && (
          <span className="text-[11px] font-medium text-primary/60 bg-primary/10 px-2.5 py-1 rounded-full">
            Following {followedHobbies.length} {followedHobbies.length === 1 ? "hobby" : "hobbies"}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {displayPosts.map((post, i) => (
          <FeedCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </section>
  );
}

function FeedCard({ post, index }: { post: CommunityPost; index: number }) {
  const [cheered, setCheered] = useState(false);
  const [cheerCount, setCheerCount] = useState(post.cheers);

  const handleCheer = () => {
    if (!cheered) {
      setCheerCount((c) => c + 1);
    } else {
      setCheerCount((c) => c - 1);
    }
    setCheered(!cheered);
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
            className="flex items-center gap-1.5 cursor-pointer"
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
