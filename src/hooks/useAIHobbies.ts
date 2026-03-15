import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchPexelsImage } from "@/lib/pexels";
import { HOBBY_NAMES } from "@/data/hobbyNames";
import { toast } from "sonner";

export type AIHobbyCategory = "Art" | "Tech" | "Outdoors" | "Mindfulness" | "Music" | "Sport" | "Culinary" | "Wellness";

export const AI_CATEGORIES = ["All", "Art", "Tech", "Outdoors", "Mindfulness", "Music", "Sport", "Culinary", "Wellness"] as const;

export interface AIHobby {
  id: string;
  name: string;
  category: AIHobbyCategory;
  image: string;          // small/tiny Pexels URL for card view
  imageHD: string;        // high-res Pexels URL (loaded lazily on detail)
  quickTip: string;
  tagline: string;
  difficulty: string;
  cost: string;
  timeCommitment: string;
  guide: {
    intro: string;
    steps: string[];
    firstProject: string;
  };
}

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick n random unique items */
function pickRandom(arr: string[], n: number): string[] {
  return shuffle(arr).slice(0, n);
}

export function useAIHobbies() {
  const [hobbies, setHobbies] = useState<AIHobby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);

  const loadHobbies = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // 1. Pick 20 random hobby names from the constant list
      const names = pickRandom(HOBBY_NAMES, 20);

      // 2. Call AI to generate full profiles for these specific names
      const { data, error } = await supabase.functions.invoke("generate-hobbies", {
        body: { hobbyNames: names },
      });

      let aiHobbies: AIHobby[];

      if (error || !data?.hobbies?.length) {
        console.error("AI generation failed, using names only:", error);
        // Fallback: create minimal cards from names
        aiHobbies = names.map((name, i) => ({
          id: `hobby-${i}-${Date.now()}`,
          name,
          category: "Art" as AIHobbyCategory,
          image: "",
          imageHD: "",
          quickTip: `Explore the art of ${name}`,
          tagline: `Discover ${name}`,
          difficulty: "Beginner",
          cost: "Varies",
          timeCommitment: "30 min sessions",
          guide: {
            intro: `${name} is a fascinating hobby to explore.`,
            steps: ["Research the basics online", "Gather starter materials", "Try your first session", "Join a local or online community", "Practice regularly"],
            firstProject: `Start with a simple ${name} exercise for beginners.`,
          },
        }));
      } else {
        aiHobbies = (data.hobbies as any[]).map((h: any) => ({
          ...h,
          image: "",
          imageHD: "",
        }));
      }

      // Show cards immediately (no images yet)
      setHobbies(aiHobbies);
      setIsLoading(false);
      setIsRefreshing(false);

      // 3. Fetch small Pexels images — first 4 with priority, rest lazy
      setLoadingImages(true);
      await fetchImagesProgressively(aiHobbies, setHobbies);
      setLoadingImages(false);
    } catch (e) {
      console.error("useAIHobbies error:", e);
      toast.error("Something went wrong. Please try refreshing.");
      setIsLoading(false);
      setIsRefreshing(false);
      setLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    loadHobbies();
  }, [loadHobbies]);

  const refreshFeed = useCallback(() => loadHobbies(true), [loadHobbies]);

  return { hobbies, isLoading, isRefreshing, loadingImages, refreshFeed };
}

/**
 * Fetch images progressively:
 * - First 4 immediately (priority) using "small" size
 * - Remaining in batches of 6 using "small" size
 */
async function fetchImagesProgressively(
  hobbies: AIHobby[],
  setHobbies: React.Dispatch<React.SetStateAction<AIHobby[]>>
) {
  const priorityCount = 4;
  const priority = hobbies.slice(0, priorityCount);
  const rest = hobbies.slice(priorityCount);

  // Priority batch — fetch all 4 in parallel
  const priorityResults = await Promise.all(
    priority.map(async (h) => {
      const url = await fetchPexelsImage(h.name, "small");
      return { name: h.name, url };
    })
  );

  // Update priority images immediately
  setHobbies((prev) =>
    prev.map((h) => {
      const match = priorityResults.find((r) => r.name === h.name);
      return match?.url ? { ...h, image: match.url } : h;
    })
  );

  // Rest — fetch in batches of 6
  const batchSize = 6;
  for (let i = 0; i < rest.length; i += batchSize) {
    const batch = rest.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (h) => {
        const url = await fetchPexelsImage(h.name, "small");
        return { name: h.name, url };
      })
    );

    setHobbies((prev) =>
      prev.map((h) => {
        const match = results.find((r) => r.name === h.name);
        return match?.url ? { ...h, image: match.url } : h;
      })
    );
  }
}
