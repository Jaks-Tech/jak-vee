import { db } from "@/lib/db";
import { generateJson } from "@/lib/openai";

export type LoveDropRecord = {
  id: string;
  recipient_name: string;
  title: string;
  body: string;
  time_label: string | null;
  media_id: string | null;
  sent_to_discord: boolean;
  sent_at: string | null;
  created_at: string;
  image_url: string | null;
};

type LoveDropRow = Omit<LoveDropRecord, "created_at" | "sent_at" | "image_url"> & {
  created_at: Date | string;
  sent_at: Date | string | null;
};

type RandomMedia = {
  id: string;
  memory_title: string;
  caption: string | null;
  memory_type: string;
};

type GeneratedLoveDrop = {
  title: string;
  body: string;
};

function nowInNairobi() {
  return new Date();
}

function timeLabelFor(date: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Nairobi",
      hour: "2-digit",
      hour12: false,
    }).format(date),
  );

  if (hour < 5) return "late night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function normalizeDrop(value: unknown, timeLabel: string) {
  const fallback = {
    title: `${timeLabel[0].toUpperCase()}${timeLabel.slice(1)} love note`,
    body: "Baby, pause for a second and remember that you are loved, chosen, and held close in my heart today.",
  };

  if (!value || typeof value !== "object") return fallback;
  const item = value as Partial<GeneratedLoveDrop>;

  return {
    title:
      typeof item.title === "string" && item.title.trim()
        ? item.title.trim().slice(0, 90)
        : fallback.title,
    body:
      typeof item.body === "string" && item.body.trim()
        ? item.body.trim().slice(0, 650)
        : fallback.body,
  };
}

function mapDrop(row: LoveDropRow): LoveDropRecord {
  return {
    ...row,
    created_at: new Date(row.created_at).toISOString(),
    sent_at: row.sent_at ? new Date(row.sent_at).toISOString() : null,
    image_url: row.media_id ? `/api/memories/media/${row.media_id}` : null,
  };
}

async function randomPublicMemoryImage() {
  const result = await db.query<RandomMedia>(`
    select
      mm.id,
      m.title as memory_title,
      mm.caption,
      m.memory_type
    from public.memory_media mm
    join public.memories m on m.id = mm.memory_id
    where mm.media_type = 'image'
      and m.is_private = false
    order by random()
    limit 1
  `);

  return result.rows[0] ?? null;
}

async function generateLoveDrop(media: RandomMedia | null, timeLabel: string) {
  try {
    const generated = await generateJson<unknown>(
      `Write a short romantic surprise message from Jak to his girlfriend.
Time of day: ${timeLabel}.
Memory photo context: ${media ? `${media.memory_title}${media.caption ? ` - ${media.caption}` : ""}` : "no photo context"}.

Return JSON only:
{
  "title": "short title under 8 words",
  "body": "sweet message under 80 words"
}

Use affectionate names like baby, darling, my love, sweetheart, beautiful, or love. Do not call her Vee in the message. Make it warm, personal, clean, and natural. Do not mention AI.`,
      "You write soft, tasteful relationship messages for a private couple dashboard.",
    );

    return normalizeDrop(generated, timeLabel);
  } catch (error) {
    console.error("Love drop AI failed:", error);
    return normalizeDrop(null, timeLabel);
  }
}

async function discordTargetForVee() {
  const result = await db.query<{
    display_name: string;
    discord_user_id: string | null;
    discord_mentions_enabled: boolean;
  }>(`
    select display_name, discord_user_id, discord_mentions_enabled
    from public.couple_profiles
    where person_name = 'Vee'
    limit 1
  `);

  const profile = result.rows[0];
  if (!profile || !profile.discord_mentions_enabled) return { content: "For baby", users: [] as string[] };
  if (profile.discord_user_id) {
    return { content: `<@${profile.discord_user_id}>`, users: [profile.discord_user_id] };
  }

  return { content: `@${profile.display_name || "Vee"}`, users: [] as string[] };
}

async function sendLoveDropDiscord(drop: LoveDropRecord) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return false;

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://jak-vee.us").replace(/\/$/, "");
  const link = `${baseUrl}/?loveDrop=${drop.id}`;
  const target = await discordTargetForVee();

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Jak & Vee Love Drops",
        content: `${target.content} a sweet surprise is waiting for you.`,
        allowed_mentions: {
          parse: [],
          users: target.users,
        },
        embeds: [
          {
            title: "Your baby left a sweet message for you",
            url: link,
            description: "Open Jak & Vee to read it privately.",
            color: 16748459,
            fields: [{ name: "Open", value: `[Read it here](${link})` }],
          },
        ],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Love drop Discord notification failed:", error);
    return false;
  }
}

export async function createLoveDrop({ notify = true } = {}) {
  const timeLabel = timeLabelFor(nowInNairobi());
  const media = await randomPublicMemoryImage();
  const generated = await generateLoveDrop(media, timeLabel);

  const result = await db.query<LoveDropRow>(
    `
      insert into public.love_drops (
        recipient_name,
        title,
        body,
        time_label,
        media_id
      )
      values ('Vee', $1, $2, $3, $4)
      returning *
    `,
    [generated.title, generated.body, timeLabel, media?.id ?? null],
  );

  let drop = mapDrop(result.rows[0]);

  if (notify) {
    const sent = await sendLoveDropDiscord(drop);
    const update = await db.query<LoveDropRow>(
      `
        update public.love_drops
        set sent_to_discord = $1, sent_at = case when $1 then now() else sent_at end
        where id = $2
        returning *
      `,
      [sent, drop.id],
    );
    drop = mapDrop(update.rows[0]);
  }

  return drop;
}

export async function getLoveDrops(limit = 12) {
  const result = await db.query<LoveDropRow>(
    `
      select *
      from public.love_drops
      order by created_at desc
      limit $1
    `,
    [limit],
  );

  return result.rows.map(mapDrop);
}

export async function getLoveDrop(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const result = await db.query<LoveDropRow>(
    `
      select *
      from public.love_drops
      where id = $1
      limit 1
    `,
    [id],
  );

  return result.rows[0] ? mapDrop(result.rows[0]) : null;
}
