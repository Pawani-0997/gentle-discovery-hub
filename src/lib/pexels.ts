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

export interface PexelsVideo {
  id: number;
  url: string;
  image: string;
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    link: string;
  }[];
}

const imageCache = new Map<string, string>();
const videoCache = new Map<string, PexelsVideo | null>();

export async function fetchPexelsImage(query: string): Promise<string | null> {
  if (imageCache.has(query)) return imageCache.get(query)!;

  try {
    const page = Math.floor(Math.random() * 2) + 1;
    const resp = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=10&page=${page}`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!resp.ok) return null;

    const data = await resp.json();
    const photos: PexelsPhoto[] = data.photos ?? [];
    if (photos.length === 0) return null;

    const photo = photos[Math.floor(Math.random() * photos.length)];
    const url = photo.src.large;
    imageCache.set(query, url);
    return url;
  } catch {
    return null;
  }
}

export async function fetchPexelsVideo(query: string): Promise<PexelsVideo | null> {
  if (videoCache.has(query)) return videoCache.get(query)!;

  try {
    const resp = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&page=1`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!resp.ok) return null;

    const data = await resp.json();
    const videos: PexelsVideo[] = data.videos ?? [];
    if (videos.length === 0) {
      videoCache.set(query, null);
      return null;
    }

    const video = videos[Math.floor(Math.random() * videos.length)];
    videoCache.set(query, video);
    return video;
  } catch {
    return null;
  }
}

// Get the best quality video file (prefer HD mp4)
export function getBestVideoFile(video: PexelsVideo): string | null {
  const files = video.video_files
    .filter((f) => f.file_type === "video/mp4")
    .sort((a, b) => {
      // Prefer HD (720-1080p width)
      const aScore = a.width >= 720 && a.width <= 1280 ? 1 : 0;
      const bScore = b.width >= 720 && b.width <= 1280 ? 1 : 0;
      if (aScore !== bScore) return bScore - aScore;
      return b.width - a.width;
    });
  return files[0]?.link ?? null;
}

// Batch fetch images for multiple queries with concurrency control
export async function fetchImagesBatch(
  queries: string[],
  concurrency = 6
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const queue = [...queries];

  const worker = async () => {
    while (queue.length > 0) {
      const q = queue.shift()!;
      const url = await fetchPexelsImage(q);
      if (url) results.set(q, url);
    }
  };

  const workers = Array.from({ length: Math.min(concurrency, queries.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
