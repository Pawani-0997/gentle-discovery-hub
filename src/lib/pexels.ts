const PEXELS_API_KEY = "uCGiNfJIHYMX7VNDMiTMjQHVMzkLJOGEBW3rxpZvcLqO3pBrvkHOiCKP";

export interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
  alt: string;
  photographer: string;
}

const imageCache = new Map<string, string>();

export async function fetchPexelsImage(query: string): Promise<string | null> {
  if (imageCache.has(query)) return imageCache.get(query)!;

  try {
    const page = Math.floor(Math.random() * 3) + 1;
    const resp = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!resp.ok) return null;

    const data = await resp.json();
    const photos: PexelsPhoto[] = data.photos ?? [];
    if (photos.length === 0) return null;

    const photo = photos[Math.floor(Math.random() * photos.length)];
    const url = photo.src.large; // good quality, fast loading
    imageCache.set(query, url);
    return url;
  } catch {
    return null;
  }
}

export async function fetchMultiplePexelsImages(
  queries: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const promises = queries.map(async (q) => {
    const url = await fetchPexelsImage(q);
    if (url) results.set(q, url);
  });
  await Promise.all(promises);
  return results;
}
