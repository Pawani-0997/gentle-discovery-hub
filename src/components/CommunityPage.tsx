import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MessageCircle, Users, Heart, Send, Crown, ChevronDown, ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BEZIER = [0.16, 1, 0.3, 1] as const;

interface Community {
  id: string;
  name: string;
  description: string;
  cover_image_url: string | null;
  tags: string[];
  creator_id: string;
  member_count: number;
}

interface DiscussionPost {
  id: string;
  community_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null; username: string | null };
}

interface Reply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null; username: string | null };
}

interface Member {
  user_id: string;
  role: string;
  joined_at: string;
  profile?: { display_name: string | null; avatar_url: string | null; username: string | null };
}

interface CommunityPageProps {
  community: Community;
  onClose: () => void;
}

export default function CommunityPage({ community, onClose }: CommunityPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"discussion" | "members">("discussion");
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [newPost, setNewPost] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .eq("community_id", community.id)
      .order("created_at", { ascending: false });

    if (!data) return;

    // Fetch profiles for post authors
    const userIds = [...new Set(data.map((p: any) => p.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, username")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    setPosts(
      data.map((p: any) => ({ ...p, profile: profileMap.get(p.user_id) }))
    );
  }, [community.id]);

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from("community_members")
      .select("*")
      .eq("community_id", community.id)
      .order("joined_at", { ascending: true });

    if (!data) return;

    const userIds = data.map((m: any) => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, username")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    setMembers(
      data.map((m: any) => ({ ...m, profile: profileMap.get(m.user_id) }))
    );
  }, [community.id]);

  const fetchLiked = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("community_likes")
      .select("target_id")
      .eq("user_id", user.id);
    if (data) setLikedIds(new Set(data.map((d: any) => d.target_id)));
  }, [user]);

  useEffect(() => {
    fetchPosts();
    fetchMembers();
    fetchLiked();
  }, [fetchPosts, fetchMembers, fetchLiked]);

  const handleCreatePost = async () => {
    if (!user || !newPost.trim()) return;
    setSubmitting(true);
    try {
      await supabase.from("community_posts").insert({
        community_id: community.id,
        user_id: user.id,
        content: newPost.trim(),
      });
      setNewPost("");
      fetchPosts();
      toast.success("Posted to the discussion!");
    } catch {
      toast.error("Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (targetId: string, targetType: "post" | "reply") => {
    if (!user) return;
    const liked = likedIds.has(targetId);
    try {
      if (liked) {
        await supabase.from("community_likes").delete()
          .eq("user_id", user.id).eq("target_id", targetId).eq("target_type", targetType);
        setLikedIds((prev) => { const n = new Set(prev); n.delete(targetId); return n; });

        // Decrement count
        const table = targetType === "post" ? "community_posts" : "community_replies";
        const item = targetType === "post"
          ? posts.find((p) => p.id === targetId)
          : null; // handled in PostThread
        if (targetType === "post" && item) {
          await supabase.from(table).update({ likes_count: Math.max(0, item.likes_count - 1) }).eq("id", targetId);
        }
      } else {
        await supabase.from("community_likes").insert({
          user_id: user.id, target_id: targetId, target_type: targetType,
        });
        setLikedIds((prev) => new Set(prev).add(targetId));

        if (targetType === "post") {
          const item = posts.find((p) => p.id === targetId);
          if (item) {
            await supabase.from("community_posts").update({ likes_count: item.likes_count + 1 }).eq("id", targetId);
          }
        }
      }
      fetchPosts();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const tabs = [
    { key: "discussion" as const, label: "Discussion", icon: MessageCircle },
    { key: "members" as const, label: "Members", icon: Users },
  ];

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.6, ease: BEZIER }}
      className="fixed inset-0 bg-background z-50 overflow-y-auto"
    >
      {/* Hero */}
      <div className="relative aspect-[16/7] overflow-hidden bg-card">
        {community.cover_image_url && (
          <img src={community.cover_image_url} alt={community.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2.5 bg-background/80 backdrop-blur-sm rounded-full cursor-pointer"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
      </div>

      <div className="px-6 -mt-10 relative z-10 pb-32 max-w-md mx-auto">
        <h1 className="text-3xl leading-tight mb-1">{community.name}</h1>
        <p className="text-muted-foreground mb-2 text-sm leading-relaxed">{community.description}</p>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Users size={13} /> {community.member_count} members
          </span>
          {community.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-full bg-secondary text-[11px] font-medium text-secondary-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-card rounded-xl p-1 mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === key
                  ? "bg-primary text-primary-foreground shadow-ceramic"
                  : "text-muted-foreground"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Discussion Tab */}
        {activeTab === "discussion" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* New post input */}
            {user && (
              <div className="bg-card rounded-[1.25rem] p-4 mb-5 shadow-ceramic">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Start a discussion or ask a question..."
                  rows={3}
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim() || submitting}
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={14} />
                    Post
                  </button>
                </div>
              </div>
            )}

            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <PostThread
                  key={post.id}
                  post={post}
                  liked={likedIds.has(post.id)}
                  likedIds={likedIds}
                  onLike={handleLike}
                  onRefresh={() => { fetchPosts(); fetchLiked(); }}
                />
              ))}
              {posts.length === 0 && (
                <p className="text-center text-muted-foreground py-12 text-sm">
                  No discussions yet. Be the first to start one!
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-3 bg-card rounded-[1.25rem] p-4 shadow-ceramic"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {member.profile?.avatar_url ? (
                    <img src={member.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {(member.profile?.display_name || "?")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {member.profile?.display_name || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{member.profile?.username || "user"}
                  </p>
                </div>
                {member.role === "admin" && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/40">
                    <Crown size={12} className="text-accent-foreground" />
                    <span className="text-[11px] font-medium text-accent-foreground">Admin</span>
                  </div>
                )}
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-center text-muted-foreground py-12 text-sm">
                No members yet.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Post Thread Component ── */

interface PostThreadProps {
  post: DiscussionPost;
  liked: boolean;
  likedIds: Set<string>;
  onLike: (targetId: string, targetType: "post" | "reply") => void;
  onRefresh: () => void;
}

function PostThread({ post, liked, likedIds, onLike, onRefresh }: PostThreadProps) {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReplies = async () => {
    const { data } = await supabase
      .from("community_replies")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (!data) return;

    const userIds = [...new Set(data.map((r: any) => r.user_id))];
    if (userIds.length === 0) { setReplies([]); return; }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url, username")
      .in("user_id", userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    setReplies(data.map((r: any) => ({ ...r, profile: profileMap.get(r.user_id) })));
  };

  const handleToggleReplies = () => {
    if (!showReplies) fetchReplies();
    setShowReplies(!showReplies);
  };

  const handleReply = async () => {
    if (!user || !replyText.trim()) return;
    setSubmitting(true);
    try {
      await supabase.from("community_replies").insert({
        post_id: post.id,
        user_id: user.id,
        content: replyText.trim(),
      });
      // increment replies_count
      await supabase.from("community_posts").update({ replies_count: post.replies_count + 1 }).eq("id", post.id);
      setReplyText("");
      fetchReplies();
      onRefresh();
    } catch {
      toast.error("Failed to reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeReply = async (replyId: string) => {
    if (!user) return;
    const isLiked = likedIds.has(replyId);
    onLike(replyId, "reply");

    // Update reply likes_count
    const reply = replies.find((r) => r.id === replyId);
    if (reply) {
      await supabase.from("community_replies").update({
        likes_count: isLiked ? Math.max(0, reply.likes_count - 1) : reply.likes_count + 1,
      }).eq("id", replyId);
      fetchReplies();
    }
  };

  const timeAgo = (date: string) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="bg-card rounded-[1.25rem] shadow-ceramic overflow-hidden">
      <div className="p-4">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
            {post.profile?.avatar_url ? (
              <img src={post.profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-primary">
                {(post.profile?.display_name || "?")[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {post.profile?.display_name || "Anonymous"}
            </p>
            <p className="text-[11px] text-muted-foreground">{timeAgo(post.created_at)}</p>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground/90 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

        {/* Action bar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(post.id, "post")}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
              liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
            }`}
          >
            <Heart size={15} fill={liked ? "currentColor" : "none"} />
            {post.likes_count > 0 && post.likes_count}
          </button>

          <button
            onClick={handleToggleReplies}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
          >
            <MessageCircle size={15} />
            {post.replies_count > 0 ? `${post.replies_count} replies` : "Reply"}
            {showReplies ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {/* Replies section */}
      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: BEZIER }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-3 bg-secondary/30">
              {/* Reply list */}
              <div className="space-y-3 mb-3">
                {replies.map((reply) => (
                  <div key={reply.id} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
                      {reply.profile?.avatar_url ? (
                        <img src={reply.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-primary">
                          {(reply.profile?.display_name || "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium text-foreground">
                          {reply.profile?.display_name || "Anonymous"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{timeAgo(reply.created_at)}</span>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed mt-0.5 whitespace-pre-wrap">{reply.content}</p>
                      <button
                        onClick={() => handleLikeReply(reply.id)}
                        className={`flex items-center gap-1 text-[11px] mt-1 transition-colors cursor-pointer ${
                          likedIds.has(reply.id) ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                        }`}
                      >
                        <Heart size={12} fill={likedIds.has(reply.id) ? "currentColor" : "none"} />
                        {reply.likes_count > 0 && reply.likes_count}
                      </button>
                    </div>
                  </div>
                ))}
                {replies.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No replies yet</p>
                )}
              </div>

              {/* Reply input */}
              {user && (
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply()}
                    placeholder="Write a reply..."
                    className="flex-1 px-3 py-2 bg-background rounded-lg border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || submitting}
                    className="p-2 rounded-lg bg-primary text-primary-foreground cursor-pointer disabled:opacity-50"
                  >
                    <Send size={14} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
