import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fetchImagesBatch } from "@/lib/pexels";
import { HOBBIES, type Hobby } from "@/data/hobbies";
import { toast } from "sonner";

export type AIHobbyCategory = "Art" | "Tech" | "Outdoors" | "Mindfulness" | "Music" | "Sport" | "Culinary" | "Wellness";

export const AI_CATEGORIES = ["All", "Art", "Tech", "Outdoors", "Mindfulness", "Music", "Sport", "Culinary", "Wellness"] as const;

export interface AIHobby {
  id: string;
  name: string;
  category: AIHobbyCategory;
  image: string;
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useAIHobbies() {
  const [hobbies, setHobbies] = useState<AIHobby[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const loadHobbies = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // Call the AI edge function
      const { data, error } = await supabase.functions.invoke("generate-hobbies");

      if (error) {
        console.error("Failed to generate hobbies:", error);
        toast.error("Couldn't generate hobbies. Showing curated picks instead.");
        // Fallback to static hobbies
        const fallback: AIHobby[] = shuffle(HOBBIES).map((h) => ({
          ...h,
          category: h.category as AIHobbyCategory,
        }));
        setHobbies(fallback);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const aiHobbies: AIHobby[] = (data.hobbies || []).map((h: any) => ({
        ...h,
        image: "", // placeholder until Pexels loads
      }));

      // Show hobbies immediately (without images)
      setHobbies(shuffle(aiHobbies));
      setIsLoading(false);
      setIsRefreshing(false);

      // Then fetch images in background
      setLoadingImages(true);
      const names = aiHobbies.map((h) => h.name);
      const images = await fetchImagesBatch(names, 6);

      setHobbies((prev) =>
        prev.map((h) => ({
          ...h,
          image: images.get(h.name) || h.image,
        }))
      );
      setLoadingImages(false);
    } catch (e) {
      console.error("useAIHobbies error:", e);
      toast.error("Something went wrong. Showing curated picks.");
      const fallback: AIHobby[] = shuffle(HOBBIES).map((h) => ({
        ...h,
        category: h.category as AIHobbyCategory,
      }));
      setHobbies(fallback);
      setIsLoading(false);
      setIsRefreshing(false);
      setLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    loadHobbies();
    return () => abortRef.current?.abort();
  }, [loadHobbies]);

  const refreshFeed = useCallback(() => loadHobbies(true), [loadHobbies]);

  return { hobbies, isLoading, isRefreshing, loadingImages, refreshFeed };
}
