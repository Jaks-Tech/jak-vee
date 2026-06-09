import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CaptionSuggestion = {
  title: string;
  caption: string;
  story: string;
  memoryType: string;
  tags: string[];
};

type InputImage = {
  dataUrl: string;
  name?: string;
};

const allowedMemoryTypes = new Set([
  "photo",
  "video",
  "memory",
  "moment",
  "date",
  "trip",
  "gift",
  "place",
  "song",
  "anniversary",
  "surprise",
]);

function fallbackSuggestion(fileNames: string[]): CaptionSuggestion {
  const first = fileNames[0]?.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");

  return {
    title: first ? `Memory of ${first}` : "A sweet memory",
    caption: "A little piece of us worth keeping.",
    story: "This moment belongs in our story because it carries something soft, real, and ours.",
    memoryType: "memory",
    tags: ["special", "memory", "us"],
  };
}

function normalizeSuggestion(value: unknown, fileNames: string[]) {
  if (!value || typeof value !== "object") return fallbackSuggestion(fileNames);

  const item = value as Partial<CaptionSuggestion>;
  const tags = Array.isArray(item.tags)
    ? item.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim().toLowerCase().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 8)
    : [];

  const memoryType =
    typeof item.memoryType === "string" && allowedMemoryTypes.has(item.memoryType)
      ? item.memoryType
      : "memory";

  return {
    title: typeof item.title === "string" && item.title.trim()
      ? item.title.trim().slice(0, 90)
      : fallbackSuggestion(fileNames).title,
    caption: typeof item.caption === "string" && item.caption.trim()
      ? item.caption.trim().slice(0, 140)
      : fallbackSuggestion(fileNames).caption,
    story: typeof item.story === "string" && item.story.trim()
      ? item.story.trim().slice(0, 900)
      : fallbackSuggestion(fileNames).story,
    memoryType,
    tags: tags.length ? tags : fallbackSuggestion(fileNames).tags,
  };
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

function extractResponseText(data: {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
}) {
  if (data.output_text) return data.output_text;

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((part) => part.text ?? "")
      .join("") ?? ""
  );
}

function cleanJsonText(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first < 0 || last < first) return "";
  return cleaned.slice(first, last + 1);
}

export async function POST(request: Request) {
  if (!(await isAllowed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
  const body = await request.json().catch(() => null);
  const images = Array.isArray(body?.images) ? (body.images as InputImage[]).slice(0, 4) : [];
  const fileNames = Array.isArray(body?.fileNames)
    ? body.fileNames.filter((name: unknown): name is string => typeof name === "string").slice(0, 8)
    : [];
  const currentType = String(body?.memoryType ?? "memory");
  const hint = String(body?.hint ?? "").trim().slice(0, 400);

  if (!apiKey) {
    return NextResponse.json({
      suggestion: fallbackSuggestion(fileNames),
      warning: "OPENAI_API_KEY is not configured.",
    });
  }

  const prompt = `Suggest a romantic memory entry for Jak and Vee.
Current selected memory type: ${currentType}.
File names: ${fileNames.join(", ") || "none"}.
Extra hint from the user: ${hint || "none"}.

Return JSON only with:
{
  "title": "short warm title",
  "caption": "short attachment caption",
  "story": "one soft paragraph for the memory story",
  "memoryType": "one of photo, video, memory, moment, date, trip, gift, place, song, anniversary, surprise",
  "tags": ["date", "trip", "funny", "special"]
}
Keep it personal, clean, warm, and not explicit.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        instructions:
          "You write tasteful, private couple-memory captions. Return only valid JSON. Never include markdown.",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              ...images
                .filter((image) => typeof image.dataUrl === "string" && image.dataUrl.startsWith("data:image/"))
                .map((image) => ({
                  type: "input_image",
                  image_url: image.dataUrl,
                })),
            ],
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const text = extractResponseText(await response.json());
    const suggestion = normalizeSuggestion(JSON.parse(cleanJsonText(text)), fileNames);
    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Memory caption AI failed:", error);
    return NextResponse.json({
      suggestion: fallbackSuggestion(fileNames),
      warning: "AI could not read this upload, so a soft fallback was used.",
    });
  }
}
