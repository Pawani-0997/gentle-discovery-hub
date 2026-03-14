import { useState, useEffect, useCallback } from "react";
import { HOBBIES, type Hobby } from "@/data/hobbies";
import { fetchMultiplePexelsImages } from "@/lib/pexels";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PEXELS_QUERIES: Record<string, string> = {
  watercolor: "watercolor painting art",
  electronics: "arduino electronics circuit",
  hiking: "trail hiking nature",
  origami: "origami paper folding",
  chess: "chess game strategy",
  photography: "nature photography landscape",
  linocut: "linocut printmaking art",
  esports: "esports gaming competition",
};

export function useShuffledHobbies() {
  const [hobbies, setHobbies] = useState<Hobby[]>(() => shuffle(HOBBIES));
  const [pexelsImages, setPexelsImages] = useState<Map<string, string>>(new Map());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPexelsImages = useCallback(async () => {
    const queries = Object.values(PEXELS_QUERIES);
    const images = await fetchMultiplePexelsImages(queries);
    // Map hobby id -> image url
    const idMap = new Map<string, string>();
    for (const [id, query] of Object.entries(PEXELS_QUERIES)) {
      const url = images.get(query);
      if (url) idMap.set(id, url);
    }
    setPexelsImages(idMap);
  }, []);

  useEffect(() => {
    loadPexelsImages();
  }, [loadPexelsImages]);

  const refreshFeed = useCallback(async () => {
    setIsRefreshing(true);
    // Clear cache to get fresh images
    const { fetchPexelsImage } = await import("@/lib/pexels");
    // Re-shuffle
    setHobbies(shuffle(HOBBIES));
    // Fetch new images (cache will give different results due to random page)
    const queries = Object.values(PEXELS_QUERIES);
    const freshResults = new Map<string, string>();
    await Promise.all(
      queries.map(async (q) => {
        // Force fresh by adding random seed to query
        const freshQ = `${q} ${["inspiration", "creative", "beautiful", "stunning", "amazing"][Math.floor(Math.random() * 5)]}`;
        const url = await fetchPexelsImage(freshQ);
        if (url) freshResults.set(q, url);
      })
    );
    const idMap = new Map<string, string>();
    for (const [id, query] of Object.entries(PEXELS_QUERIES)) {
      const url = freshResults.get(query) || pexelsImages.get(id);
      if (url) idMap.set(id, url);
    }
    setPexelsImages(idMap);
    setIsRefreshing(false);
  }, [pexelsImages]);

  const getImage = useCallback(
    (hobby: Hobby) => pexelsImages.get(hobby.id) || hobby.image,
    [pexelsImages]
  );

  return { hobbies, getImage, refreshFeed, isRefreshing };
}
