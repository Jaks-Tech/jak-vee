import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Suggestion = {
  title: string;
  type: string;
  source: string;
  url: string;
  description: string;
};

type YouTubeItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    description?: string;
  };
};

type TmdbItem = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
};

const movieGenreHints: Record<string, string> = {
  action: "28",
  adventure: "12",
  animation: "16",
  comedy: "35",
  funny: "35",
  crime: "80",
  documentary: "99",
  drama: "18",
  family: "10751",
  fantasy: "14",
  horror: "27",
  romantic: "10749",
  romance: "10749",
  sci: "878",
  thriller: "53",
};

async function isAllowed() {
  const cookieStore = await cookies();
  const session = cookieStore.get("jak_vee_session")?.value;
  const person = cookieStore.get("jak_vee_person")?.value;

  return (
    Boolean(process.env.AUTH_SESSION_SECRET) &&
    session === process.env.AUTH_SESSION_SECRET &&
    (person === "Jak" || person === "Vee")
  );
}

function fallbackSuggestions(type: string, query: string): Suggestion[] {
  const encoded = encodeURIComponent(`${query} ${type}`);

  return [
    {
      title: `${type} search for ${query}`,
      type,
      source: "Google",
      url: `https://www.google.com/search?q=${encoded}`,
      description: "Open this search and choose the result that feels right for both of you.",
    },
    {
      title: `${type} videos for ${query}`,
      type: "Video",
      source: "YouTube",
      url: `https://www.youtube.com/results?search_query=${encoded}`,
      description: "Browse trailers, songs, clips, or recommendations together.",
    },
  ];
}

function cleanText(value: string | undefined, fallback: string) {
  return (value || fallback)
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();
}

function categoryFor(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes("movie") || lower.includes("film")) return "movie";
  if (lower.includes("show") || lower.includes("series")) return "show";
  if (lower.includes("song") || lower.includes("music")) return "song";
  if (lower.includes("podcast")) return "podcast";
  if (lower.includes("video")) return "video";
  return "other";
}

function youtubeQuery(type: string, query: string) {
  const category = categoryFor(type);
  if (category === "song") return `${query} official music video`;
  if (category === "podcast") return `${query} podcast`;
  return query;
}

async function searchYouTube(type: string, query: string): Promise<Suggestion[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  const params = new URLSearchParams({
    part: "snippet",
    maxResults: "5",
    q: youtubeQuery(type, query),
    type: "video",
    videoEmbeddable: "true",
    key,
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) {
    console.error("YouTube search failed:", await response.text());
    return [];
  }

  const data = (await response.json()) as { items?: YouTubeItem[] };

  return (data.items ?? [])
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      title: cleanText(item.snippet?.title, "YouTube result"),
      type: categoryFor(type) === "song" ? "Song" : categoryFor(type) === "podcast" ? "Podcast" : "Video",
      source: cleanText(item.snippet?.channelTitle, "YouTube"),
      url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
      description: cleanText(
        item.snippet?.description,
        "A YouTube result you can save and watch together.",
      ).slice(0, 180),
    }));
}

function tmdbDescription(item: TmdbItem) {
  const date = item.release_date || item.first_air_date;
  const year = date ? new Date(date).getFullYear() : null;
  const overview = item.overview?.trim() || "A TMDb result you can save and explore together.";
  return `${year ? `${year}. ` : ""}${overview}`.slice(0, 220);
}

async function searchTmdbText(type: string, query: string): Promise<Suggestion[]> {
  const key = process.env.TMDB_API_KEY || process.env.TMBD_API_KEY;
  if (!key) return [];

  const category = categoryFor(type);
  const endpoint = category === "show" ? "tv" : "movie";
  const params = new URLSearchParams({
    api_key: key,
    query,
    include_adult: "false",
    language: "en-US",
    page: "1",
  });

  const response = await fetch(
    `https://api.themoviedb.org/3/search/${endpoint}?${params.toString()}`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) {
    console.error("TMDb search failed:", await response.text());
    return [];
  }

  const data = (await response.json()) as { results?: TmdbItem[] };

  return (data.results ?? []).slice(0, 5).map((item) => ({
    title: item.title || item.name || "TMDb result",
    type: category === "show" ? "Show" : "Movie",
    source: "TMDb",
    url: `https://www.themoviedb.org/${category === "show" ? "tv" : "movie"}/${item.id}`,
    description: tmdbDescription(item),
  }));
}

function genreFromQuery(query: string) {
  const lower = query.toLowerCase();
  return Object.entries(movieGenreHints).find(([word]) => lower.includes(word))?.[1];
}

async function discoverTmdb(type: string, query: string): Promise<Suggestion[]> {
  const key = process.env.TMDB_API_KEY || process.env.TMBD_API_KEY;
  if (!key) return [];

  const category = categoryFor(type);
  const endpoint = category === "show" ? "tv" : "movie";
  const params = new URLSearchParams({
    api_key: key,
    include_adult: "false",
    language: "en-US",
    page: "1",
    sort_by: "popularity.desc",
  });
  const genre = genreFromQuery(query);
  if (genre) params.set("with_genres", genre);

  const response = await fetch(
    `https://api.themoviedb.org/3/discover/${endpoint}?${params.toString()}`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) return [];

  const data = (await response.json()) as { results?: TmdbItem[] };

  return (data.results ?? []).slice(0, 5).map((item) => ({
    title: item.title || item.name || "TMDb result",
    type: category === "show" ? "Show" : "Movie",
    source: "TMDb",
    url: `https://www.themoviedb.org/${category === "show" ? "tv" : "movie"}/${item.id}`,
    description: tmdbDescription(item),
  }));
}

export async function POST(request: Request) {
  if (!(await isAllowed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const query = String(body?.query ?? "").trim();
  const type = String(body?.type ?? "Movie").trim();

  if (!query) {
    return NextResponse.json({ error: "Tell us what to find." }, { status: 400 });
  }

  const category = categoryFor(type);
  let suggestions: Suggestion[] = [];

  if (category === "movie" || category === "show") {
    suggestions = await searchTmdbText(type, query);
    if (suggestions.length === 0 || /weekend|suggest|recommend|romantic|funny|cozy|date/i.test(query)) {
      const discovered = await discoverTmdb(type, query);
      suggestions = [...suggestions, ...discovered];
    }
  } else if (category === "song" || category === "video" || category === "podcast") {
    suggestions = await searchYouTube(type, query);
  } else {
    suggestions = [
      ...(await searchYouTube(type, query)),
      ...(await searchTmdbText(type, query)),
    ];
  }

  const unique = Array.from(
    new Map(suggestions.map((item) => [item.url, item])).values(),
  ).slice(0, 6);

  return NextResponse.json({
    suggestions: unique.length > 0 ? unique : fallbackSuggestions(type, query),
    provider: category === "movie" || category === "show" ? "tmdb" : "youtube",
  });
}
