type ResponsesTextPart = {
  type?: string;
  text?: string;
};

type ResponsesOutputItem = {
  content?: ResponsesTextPart[];
};

type ResponsesPayload = {
  output_text?: string;
  output?: ResponsesOutputItem[];
};

function extractResponseText(data: ResponsesPayload) {
  if (data.output_text) return data.output_text;

  return (
    data.output
      ?.flatMap((item) => item.content ?? [])
      .map((part) => part.text ?? "")
      .join("") ?? ""
  );
}

function cleanJsonText(text: string) {
  let cleaned = text.trim();

  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  const firstArray = cleaned.indexOf("[");
  const firstObject = cleaned.indexOf("{");
  const firstJson =
    firstArray === -1
      ? firstObject
      : firstObject === -1
        ? firstArray
        : Math.min(firstArray, firstObject);

  if (firstJson > 0) cleaned = cleaned.slice(firstJson);

  const lastArray = cleaned.lastIndexOf("]");
  const lastObject = cleaned.lastIndexOf("}");
  const lastJson = Math.max(lastArray, lastObject);

  if (lastJson >= 0) cleaned = cleaned.slice(0, lastJson + 1);

  return cleaned.trim();
}

export async function generateText(prompt: string, system?: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      ...(system ? { instructions: system } : {}),
      input: prompt,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const data = (await response.json()) as ResponsesPayload;
  return extractResponseText(data).trim();
}

export async function generateJson<T>(prompt: string, system?: string) {
  const text = await generateText(
    `${prompt}\n\nReturn only valid JSON. Do not include markdown.`,
    system,
  );
  const jsonText = cleanJsonText(text);

  if (!jsonText) {
    throw new Error("OpenAI returned an empty response.");
  }

  return JSON.parse(jsonText) as T;
}
