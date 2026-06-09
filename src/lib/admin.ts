import { db } from "@/lib/db";

export type AdminField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "date" | "time" | "datetime-local" | "checkbox";
  required?: boolean;
  placeholder?: string;
};

export type AdminEntity = {
  key: string;
  title: string;
  table: string;
  orderBy: string;
  fields: AdminField[];
  createDefaults?: Record<string, string | boolean>;
};

export type AdminRow = Record<string, string | number | boolean | null>;

export const adminEntities: AdminEntity[] = [
  {
    key: "daily_checkins",
    title: "Daily Check-ins",
    table: "public.daily_checkins",
    orderBy: "created_at desc",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "body", label: "Message", type: "textarea" },
      { name: "checkin_type", label: "Type", required: true },
      { name: "mood", label: "Mood" },
      { name: "location_label", label: "Location" },
      { name: "meet_time", label: "Meet time", type: "datetime-local" },
      { name: "author_name", label: "Author", required: true },
    ],
    createDefaults: { checkin_type: "custom", author_name: "Jak", is_custom: true },
  },
  {
    key: "love_notes",
    title: "Notes Board",
    table: "public.love_notes",
    orderBy: "created_at desc",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "body", label: "Body", type: "textarea", required: true },
      { name: "note_type", label: "Type", required: true },
      { name: "scheduled_for", label: "Date", type: "date" },
      { name: "is_pinned", label: "Pinned", type: "checkbox" },
      { name: "author_name", label: "Author", required: true },
    ],
    createDefaults: { note_type: "Private note", author_name: "Jak" },
  },
  {
    key: "memories",
    title: "Memories",
    table: "public.memories",
    orderBy: "created_at desc",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "body", label: "Story", type: "textarea" },
      { name: "memory_type", label: "Type", required: true },
      { name: "memory_date", label: "Memory date", type: "date" },
      { name: "location_text", label: "Location" },
      { name: "is_favorite", label: "Favorite", type: "checkbox" },
      { name: "author_name", label: "Author", required: true },
    ],
    createDefaults: { memory_type: "memory", author_name: "Jak" },
  },
  {
    key: "shared_links",
    title: "Links And Favorites",
    table: "public.shared_links",
    orderBy: "created_at desc",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "url", label: "URL" },
      { name: "link_type", label: "Type", required: true },
      { name: "source_title", label: "Source" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "is_favorite", label: "Favorite", type: "checkbox" },
      { name: "author_name", label: "Author", required: true },
    ],
    createDefaults: { link_type: "Link", author_name: "Jak" },
  },
  {
    key: "anniversaries",
    title: "Reminders",
    table: "public.anniversaries",
    orderBy: "date_value asc, event_time asc",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "event_type", label: "Type", required: true },
      { name: "date_value", label: "Date", type: "date", required: true },
      { name: "event_time", label: "Time", type: "time" },
      { name: "reminder_rule", label: "Repeat", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
      { name: "email_enabled", label: "Email", type: "checkbox" },
      { name: "email_recipients", label: "Emails" },
      { name: "author_name", label: "Author", required: true },
    ],
    createDefaults: {
      event_type: "Special day",
      reminder_rule: "yearly",
      event_time: "09:00",
      author_name: "Jak",
    },
  },
  {
    key: "story_chapters",
    title: "Story",
    table: "public.story_chapters",
    orderBy: "coalesce(chapter_date, created_at::date) asc, created_at asc",
    fields: [
      { name: "title", label: "Title", required: true },
      { name: "body", label: "Body", type: "textarea" },
      { name: "chapter_type", label: "Type", required: true },
      { name: "chapter_date", label: "Date", type: "date" },
      { name: "mood", label: "Mood" },
      { name: "is_favorite", label: "Favorite", type: "checkbox" },
      { name: "author_name", label: "Author", required: true },
    ],
    createDefaults: { chapter_type: "Chapter", author_name: "Jak" },
  },
  {
    key: "chat_messages",
    title: "Chat",
    table: "public.chat_messages",
    orderBy: "created_at desc",
    fields: [
      { name: "body", label: "Message", type: "textarea", required: true },
      { name: "message_type", label: "Type", required: true },
      { name: "context_type", label: "Context", required: true },
      { name: "context_title", label: "Topic" },
      { name: "author_name", label: "Author", required: true },
    ],
    createDefaults: {
      message_type: "message",
      context_type: "general",
      author_name: "Jak",
    },
  },
  {
    key: "couple_profiles",
    title: "Profiles",
    table: "public.couple_profiles",
    orderBy: "person_name asc",
    fields: [
      { name: "person_name", label: "Person", required: true },
      { name: "display_name", label: "Display name", required: true },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "mention_handles", label: "Mention handles" },
      { name: "discord_user_id", label: "Discord user ID" },
      {
        name: "discord_mentions_enabled",
        label: "Discord mentions",
        type: "checkbox",
      },
    ],
  },
  {
    key: "comments",
    title: "Comments",
    table: "public.comments",
    orderBy: "created_at desc",
    fields: [
      { name: "target_type", label: "Target type", required: true },
      { name: "target_id", label: "Target ID", required: true },
      { name: "body", label: "Comment", type: "textarea", required: true },
    ],
  },
];

export function getAdminEntity(key: string) {
  return adminEntities.find((entity) => entity.key === key);
}

function normalizeRow(row: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      if (value instanceof Date) return [key, value.toISOString()];
      if (Array.isArray(value)) return [key, value.join(", ")];
      return [key, value as AdminRow[string]];
    }),
  ) as AdminRow;
}

export async function getAdminData() {
  const sections = await Promise.all(
    adminEntities.map(async (entity) => {
      try {
        const result = await db.query<Record<string, unknown>>(
          `select * from ${entity.table} order by ${entity.orderBy} limit 40`,
        );
        return { entity, rows: result.rows.map(normalizeRow), error: null };
      } catch (error) {
        return {
          entity,
          rows: [],
          error: error instanceof Error ? error.message : "Unable to load.",
        };
      }
    }),
  );

  return sections;
}
