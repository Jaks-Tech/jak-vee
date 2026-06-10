import { db } from "@/lib/db";
import { sendMentionNotification } from "@/lib/mentions";

const defaultTypes = new Set([
  "Song",
  "Movie",
  "Podcast",
  "Video",
  "Place",
  "Article",
  "Book",
  "Show",
  "Date idea",
  "Link",
]);

export function normalizeSharedUrl(value: string) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function normalizeSharedLinkType(selectedType: string, customType = "") {
  if (selectedType === "Custom") {
    return customType.replace(/\s+/g, " ").slice(0, 60);
  }

  return defaultTypes.has(selectedType) ? selectedType : "";
}

export async function saveSharedLink({
  authorName,
  title,
  linkType,
  url,
  sourceTitle,
  description,
  isFavorite,
}: {
  authorName: string;
  title: string;
  linkType: string;
  url: string | null;
  sourceTitle: string | null;
  description: string | null;
  isFavorite: boolean;
}) {
  await db.query(
    `
      insert into public.shared_links (
        title,
        url,
        link_type,
        source_title,
        description,
        author_name,
        is_favorite
      )
      values ($1, $2, $3, $4, $5, $6, $7)
    `,
    [title, url, linkType, sourceTitle, description, authorName, isFavorite],
  );

  await sendMentionNotification({
    authorName,
    sourceType: "Favorites",
    sourceTitle: title,
    body: [description, sourceTitle, url].filter(Boolean).join("\n"),
    path: "/links",
  });
}
