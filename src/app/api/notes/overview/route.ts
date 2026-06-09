import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const notes: string[] = body?.notes ?? [];

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    const text = notes.join("\n\n");
    const prompt = `Provide a concise, friendly overview of these shared notes for a couple. Group similar items, call out any recurring themes, and list up to 3 clear action items. Keep it short.` + "\n\n" + text;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      const textErr = await res.text();
      console.error("OpenAI error:", textErr);
      return NextResponse.json({ error: "OpenAI request failed" }, { status: 502 });
    }

    const data = await res.json();
    const summary = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
