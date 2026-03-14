import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BEZIER = [0.16, 1, 0.3, 1] as const;
const SUGGESTED_TAGS = ["Art", "Music", "Outdoors", "Tech", "Crafts", "Fitness", "Gaming", "Cooking", "Photography", "Reading"];

interface CreateCommunityFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCommunityForm({ open, onClose, onCreated }: CreateCommunityFormProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setCustomTag("");
  };

  const handleSubmit = async () => {
    if (!user || !name.trim()) return;
    setSubmitting(true);

    try {
      let coverUrl: string | null = null;

      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `communities/${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("post-images")
          .upload(path, coverFile, { upsert: true });
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from("post-images").getPublicUrl(path);
        coverUrl = urlData.publicUrl;
      }

      const { data: community, error: insertErr } = await supabase
        .from("communities")
        .insert({
          name: name.trim(),
          description: description.trim(),
          cover_image_url: coverUrl,
          tags,
          creator_id: user.id,
        })
        .select("id")
        .single();

      if (insertErr) throw insertErr;

      // Add creator as admin member
      await supabase.from("community_members").insert({
        community_id: community.id,
        user_id: user.id,
        role: "admin",
      });

      toast.success("🎉 Your hobby tribe has been founded!");
      resetForm();
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create community");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setTags([]);
    setCustomTag("");
    setCoverFile(null);
    setCoverPreview(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: BEZIER }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] max-h-[90vh] overflow-y-auto p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif-display">Create Community</h2>
              <button onClick={onClose} className="p-2 rounded-full bg-secondary cursor-pointer">
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Cover Image */}
            <div
              onClick={() => fileRef.current?.click()}
              className="relative aspect-[16/9] rounded-[1.25rem] overflow-hidden bg-card border-2 border-dashed border-border mb-5 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors group"
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary/60 transition-colors">
                  <ImageIcon size={32} />
                  <span className="text-sm font-medium">Upload cover image</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Name */}
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Community Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekend Watercolorists"
              className="w-full px-4 py-3 bg-card rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
            />

            {/* Description */}
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's your community about?"
              rows={3}
              className="w-full px-4 py-3 bg-card rounded-xl border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-4"
            />

            {/* Tags */}
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    tags.includes(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-6">
              <input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                placeholder="Add custom tag..."
                className="flex-1 px-3 py-2 bg-card rounded-lg border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={addCustomTag}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium cursor-pointer hover:bg-primary/10 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Selected custom tags */}
            {tags.filter((t) => !SUGGESTED_TAGS.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags
                  .filter((t) => !SUGGESTED_TAGS.includes(t))
                  .map((tag) => (
                    <span
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-primary text-primary-foreground cursor-pointer"
                    >
                      {tag} ×
                    </span>
                  ))}
              </div>
            )}

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={!name.trim() || submitting}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-ceramic-lg"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Found My Tribe
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
