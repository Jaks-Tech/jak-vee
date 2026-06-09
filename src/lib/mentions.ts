import { db } from "@/lib/db";

type MentionNotification = {
  authorName: string;
  sourceType: string;
  sourceTitle: string;
  body: string;
  path: string;
};

type MentionProfile = {
  person_name: "Jak" | "Vee";
  display_name: string;
  mention_handles: string[];
  discord_user_id: string | null;
  discord_mentions_enabled: boolean;
};

function normalizeHandle(handle: string) {
  return handle.trim().replace(/^@+/, "").toLowerCase();
}

function mentionedHandles(text: string) {
  return new Set(
    Array.from(text.matchAll(/(^|[\s([{])@([a-zA-Z0-9_.-]{1,40})\b/g)).map(
      (match) => normalizeHandle(match[2]),
    ),
  );
}

async function getMentionProfiles() {
  const result = await db.query<MentionProfile>(`
    select
      person_name,
      display_name,
      mention_handles,
      discord_user_id,
      discord_mentions_enabled
    from public.couple_profiles
    where discord_mentions_enabled = true
  `);

  return result.rows;
}

function discordTarget(profile: MentionProfile) {
  return profile.discord_user_id
    ? `<@${profile.discord_user_id}>`
    : `@${profile.display_name}`;
}

function privateNotificationTitle(authorName: string) {
  if (authorName === "Jak" || authorName === "Vee") {
    return "Your baby left something for you";
  }

  return `${authorName} left something for you`;
}

export async function sendMentionNotification({
  authorName,
  sourceType,
  sourceTitle,
  body,
  path,
}: MentionNotification) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const text = `${sourceTitle}\n${body}`;
  const handles = mentionedHandles(text);
  if (handles.size === 0) return;

  let profiles: MentionProfile[] = [];

  try {
    profiles = await getMentionProfiles();
  } catch (error) {
    console.error("Unable to load mention profiles:", error);
    return;
  }

  const wantsBoth =
    handles.has("both") || handles.has("everyone") || handles.has("us");
  const targets = profiles.filter((profile) => {
    if (wantsBoth) return true;

    return profile.mention_handles
      .map(normalizeHandle)
      .some((handle) => handles.has(handle));
  });

  if (targets.length === 0) return;

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://jak-vee.us").replace(/\/$/, "");
  const link = baseUrl ? `${baseUrl}${path}` : path;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Jak & Vee Notifications",
        content: `Mention for ${targets.map(discordTarget).join(", ")}`,
        allowed_mentions: {
          parse: [],
          users: targets
            .map((target) => target.discord_user_id)
            .filter((id): id is string => Boolean(id)),
        },
        embeds: [
          {
            title: privateNotificationTitle(authorName),
            url: link,
            description: "Check it out",
            color: 16748459,
            fields: [
              { name: "Page", value: sourceType, inline: true },
              { name: "Open", value: `[View in Jak & Vee](${link})`, inline: false },
            ],
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Discord mention notification failed:", error);
  }
}
