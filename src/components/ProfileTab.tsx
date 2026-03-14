import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Settings, LogOut, Heart, FileText, Users, Edit2, Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BEZIER = [0.16, 1, 0.3, 1] as const;

interface Profile {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  hobby_interests: string[];
}

interface Stats {
  posts: number;
  followers: number;
  following: number;
  totalLikes: number;
}

interface ProfileTabProps {
  onLoginRequest: () => void;
}

export default function ProfileTab({ onLoginRequest }: ProfileTabProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ posts: 0, followers: 0, following: 0, totalLikes: 0 });
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setProfile({
          display_name: data.display_name,
          username: data.username,
          avatar_url: data.avatar_url,
          bio: data.bio,
          hobby_interests: (data.hobby_interests as string[]) || [],
        });
        setEditBio(data.bio || "");
        setEditName(data.display_name || "");
      }
    };

    const fetchStats = async () => {
      const [postsRes, followersRes, followingRes] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("follows").select("id", { count: "exact" }).eq("following_id", user.id),
        supabase.from("follows").select("id", { count: "exact" }).eq("follower_id", user.id),
      ]);
      setStats({
        posts: postsRes.count || 0,
        followers: followersRes.count || 0,
        following: followingRes.count || 0,
        totalLikes: 0,
      });
    };

    fetchProfile();
    fetchStats();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: editName, bio: editBio })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      setProfile((p) => p ? { ...p, display_name: editName, bio: editBio } : p);
      setEditing(false);
      toast.success("Profile updated!");
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="px-6 pt-20 pb-32 max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: BEZIER }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <User size={36} className="text-primary" />
          </div>
          <h2 className="text-2xl mb-2">Your Profile</h2>
          <p className="text-muted-foreground mb-8">Sign in to track your hobby journey</p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onLoginRequest}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium shadow-ceramic-lg cursor-pointer"
          >
            Sign In or Create Account
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-14 pb-32 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: BEZIER }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl">Profile</h1>
          <button
            onClick={async () => { await signOut(); toast.success("Signed out"); }}
            className="p-2.5 bg-card rounded-full cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Avatar & Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-primary" />
              )}
            </div>
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xl font-semibold bg-card border border-border rounded-lg px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            ) : (
              <>
                <h2 className="text-xl font-semibold">{profile?.display_name || "User"}</h2>
                <p className="text-sm text-muted-foreground">@{profile?.username || "user"}</p>
              </>
            )}
          </div>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="p-2.5 bg-card rounded-full cursor-pointer text-muted-foreground hover:text-primary transition-colors"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Edit2 size={18} />}
          </button>
        </div>

        {/* Bio */}
        {editing ? (
          <textarea
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            placeholder="Write a short bio..."
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20"
          />
        ) : (
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {profile?.bio || "No bio yet. Tap edit to add one!"}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Posts", value: stats.posts, icon: <FileText size={16} /> },
            { label: "Followers", value: stats.followers, icon: <Users size={16} /> },
            { label: "Following", value: stats.following, icon: <Heart size={16} /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 text-center shadow-ceramic">
              <div className="flex items-center justify-center text-primary mb-1">{stat.icon}</div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Hobby Interests */}
        {profile?.hobby_interests && profile.hobby_interests.length > 0 && (
          <section className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.hobby_interests.map((h) => (
                <span key={h} className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {h}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Account Info */}
        <section className="bg-card rounded-[1.5rem] p-5 shadow-ceramic">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Account</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Settings size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Camera size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
