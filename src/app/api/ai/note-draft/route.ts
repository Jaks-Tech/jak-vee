import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateJson } from "@/lib/openai";

type NoteDraft = {
  title: string;
  noteType: string;
  body: string;
};

const noteTypes = new Set([
  "Our to-do",
  "Words of affirmation",
  "Plans of the day",
  "Private note",
  "Reminder",
  "Prayer or wish",
  "Date idea",
]);

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

function fallbackDraft(instruction: string, noteType: string): NoteDraft {
  return {
    title: instruction.slice(0, 70) || "A little plan for us",
    noteType: noteTypes.has(noteType) ? noteType : "Private note",
    body: [
      "- Write the main idea here.",
      "- Add what needs to happen next.",
      "- Mention @vee or @jak if one of you should see this quickly.",
    ].join("\n"),
  };
}

function normalizeDraft(value: unknown, instruction: string, noteType: string) {
  if (!value || typeof value !== "object") return fallbackDraft(instruction, noteType);

  const draft = value as Partial<NoteDraft>;
  const selectedType =
    typeof draft.noteType === "string" && noteTypes.has(draft.noteType)
      ? draft.noteType
      : noteTypes.has(noteType)
        ? noteType
        : "Private note";

  return {
    title:
      typeof draft.title === "string" && draft.title.trim()
        ? draft.title.trim().slice(0, 90)
        : fallbackDraft(instruction, selectedType).title,
    noteType: selectedType,
    body:
      typeof draft.body === "string" && draft.body.trim()
        ? draft.body.trim().slice(0, 1400)
        : fallbackDraft(instruction, selectedType).body,
  };
}

export async function POST(request: Request) {
  if (!(await isAllowed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const instruction = String(body?.instruction ?? "").trim().slice(0, 700);
  const noteType = String(body?.noteType ?? "Private note").trim();

  if (!instruction) {
    return NextResponse.json({ error: "Tell AI what to write." }, { status: 400 });
  }

  try {
    const draft = await generateJson<unknown>(
      `Create a useful note draft for a private couple dashboard.
Selected note type: ${noteType}
User instruction: ${instruction}

Return JSON only:
{
  "title": "short practical title",
  "noteType": "one of Our to-do, Words of affirmation, Plans of the day, Private note, Reminder, Prayer or wish, Date idea",
  "body": "brief clear note"
}

Rules:
- If the user asks for ideas, use brief bullet points.
- If the user gives a plan of the day, organize it into morning/afternoon/evening or time blocks.
- If it is romantic, keep it soft and personal.
- If it is practical, keep it clear and actionable.
- Include a final short line reminding that @vee or @jak can be used if someone should be notified.
- Do not use markdown headings.`,
      "You help Jak and Vee write useful shared notes, plans, affirmations, date ideas, reminders, and to-dos.",
    );

    return NextResponse.json({
      draft: normalizeDraft(draft, instruction, noteType),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      draft: fallbackDraft(instruction, noteType),
      warning: "AI could not draft this one, so a simple fallback was used.",
    });
  }
}
