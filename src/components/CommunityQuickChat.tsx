import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { X, Send, Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BEZIER = [0.16, 1, 0.3, 1] as const;

interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  profile?: { display_name: string | null; avatar_url: string | null };
}

interface CommunityQuickChatProps {
  communityId: string;
  communityName: string;
  isMember: boolean;
  onClose: () => void;
}

export default function CommunityQuickChat({
  communityId,
  communityName,
  isMember,
  onClose,
}: CommunityQuickChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .eq("community_id", communityId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (!data) return;

    const userIds = [...new Set(data.map((p: any) => p.user_id))];
    if (userIds.length === 0) {
      setMessages([]);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.user_id, p])
    );
    setMessages(
      data.map((p: any) => ({ ...p, profile: profileMap.get(p.user_id) }))
    );
  }, [communityId]);

  const fetchLiked = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("community_likes")
      .select("target_id")
      .eq("user_id", user.id)
      .eq("target_type", "post");
    if (data) setLikedIds(new Set(data.map((d: any) => d.target_id)));
  }, [user]);

  useEffect(() => {
    fetchMessages();
    fetchLiked();
  }, [fetchMessages, fetchLiked]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!user || !newMessage.trim() || !isMember) return;
    setSending(true);
    try {
      await supabase.from("community_posts").insert({
        community_id: communityId,
        user_id: user.id,
        content: newMessage.trim(),
      });
      setNewMessage("");
      fetchMessages();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleLike = async (msgId: string) => {
    if (!user) return;
    const isLiked = likedIds.has(msgId);
    try {
      if (isLiked) {
        await supabase
          .from("community_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("target_id", msgId)
          .eq("target_type", "post");
        setLikedIds((prev) => {
          const n = new Set(prev);
          n.delete(msgId);
          return n;
        });
        const msg = messages.find((m) => m.id === msgId);
        if (msg) {
          await supabase
            .from("community_posts")
            .update({ likes_count: Math.max(0, msg.likes_count - 1) })
            .eq("id", msgId);
        }
      } else {
        await supabase.from("community_likes").insert({
          user_id: user.id,
          target_id: msgId,
          target_type: "post",
        });
        setLikedIds((prev) => new Set(prev).add(msgId));
        const msg = messages.find((m) => m.id === msgId);
        if (msg) {
          await supabase
            .from("community_posts")
            .update({ likes_count: msg.likes_count + 1 })
            .eq("id", msgId);
        }
      }
      fetchMessages();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const timeAgo = (date: string) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return "now";
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.5, ease: BEZIER }}
      className="fixed inset-x-0 bottom-0 z-50 flex flex-col"
      style={{ height: "70vh" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 -top-[30vh] bg-foreground/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-background rounded-t-[2rem] flex flex-col h-full shadow-ceramic-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <MessageCircle size={18} className="text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                {communityName}
              </h3>
              <p className="text-[11px] text-muted-foreground">Discussion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-card cursor-pointer hover:bg-secondary transition-colors"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground text-center">
                No messages yet. {isMember ? "Start the conversation!" : ""}
              </p>
            </div>
          )}
          {messages.map((msg) => {
            const isOwn = msg.user_id === user?.id;
            const liked = likedIds.has(msg.id);
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {msg.profile?.avatar_url ? (
                    <img
                      src={msg.profile.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] font-bold text-primary">
                      {(msg.profile?.display_name || "?")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className={`max-w-[75%] ${isOwn ? "items-end" : ""}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-medium text-foreground">
                      {msg.profile?.display_name || "Anonymous"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo(msg.created_at)}
                    </span>
                  </div>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "bg-card text-foreground rounded-tl-md shadow-ceramic"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <button
                    onClick={() => handleLike(msg.id)}
                    className={`flex items-center gap-1 mt-1 text-[11px] transition-colors cursor-pointer ${
                      liked
                        ? "text-destructive"
                        : "text-muted-foreground hover:text-destructive"
                    }`}
                  >
                    <Heart
                      size={12}
                      fill={liked ? "currentColor" : "none"}
                    />
                    {msg.likes_count > 0 && msg.likes_count}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input area */}
        {isMember ? (
          <div className="px-4 py-3 border-t border-border bg-background">
            <div className="flex items-center gap-2.5">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a message..."
                className="flex-1 bg-card rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 border border-border"
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="p-3 rounded-xl bg-primary text-primary-foreground cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 border-t border-border bg-card/50 text-center">
            <p className="text-sm text-muted-foreground">
              🔒 Join the community to start chatting
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
