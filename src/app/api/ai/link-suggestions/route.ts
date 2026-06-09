import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateJson } from "@/lib/openai";

type Suggestion = {
  title: string;
  type: string;
  source: string;
  url: string;
  description: string;
};

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

function validSuggestions(value: unknown, type: string, query: string) {
  if (!Array.isArray(value)) return fallbackSuggestions(type, query);

  const suggestions = value
    .filter((item): item is Suggestion => {
      return (
        item &&
        typeof item === "object" &&
        typeof (item as Suggestion).title === "string" &&
        typeof (item as Suggestion).url === "string"
      );
    })
    .map((item) => ({
      title: item.title,
      type: item.type || type,
      source: item.source || "AI suggestion",
      url: item.url,
      description: item.description || "Saved from an AI suggestion.",
    }));

  return suggestions.length > 0 ? suggestions : fallbackSuggestions(type, query);
}

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

export async function POST(request: Request) {
  if (!(await isAllowed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const query = String(body?.query ?? "").trim();
  const type = String(body?.type ?? "Movie").trim();

  if (!query) {
    return NextResponse.json({ error: "Tell AI what to find." }, { status: 400 });
  }

  try {
    const suggestions = await generateJson<unknown>(
      `Suggest 3 ${type} items for a couple based on this request: "${query}".
For songs use official music/video pages when possible.
For movies or shows use useful public pages like IMDb, TMDb, streaming pages, or trailers.
For podcasts use official pages or Spotify/Apple pages.
Each item needs title, type, source, url, and a romantic/useful description under 35 words.
Return JSON array only.`,
      "You suggest tasteful shared favorites for a couple. Prefer real, searchable public links. Do not invent obscure URLs.",
    );

    return NextResponse.json({
      suggestions: validSuggestions(suggestions, type, query).slice(0, 5),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      suggestions: fallbackSuggestions(type, query),
      warning: "AI returned an invalid response, so fallback suggestions were used.",
    });
  }
}
