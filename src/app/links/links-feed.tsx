"use client";

import {
  BookOpen,
  ExternalLink,
  Film,
  Heart,
  Link2,
  MapPin,
  Mic2,
  Music,
  Play,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Interactions } from "@/components/interactions";
import type { SharedLinkRecord } from "@/lib/links";
import { LinkPreviewCard } from "./link-preview-card";

const preferredOrder = [
  "Song",
  "Movie",
  "Podcast",
  "Video",
  "Show",
  "Book",
  "Article",
  "Place",
  "Date idea",
  "Link",
];

function iconFor(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes("song") || lower.includes("music")) return Music;
  if (lower.includes("movie") || lower.includes("film") || lower.includes("show")) return Film;
  if (lower.includes("podcast")) return Mic2;
  if (lower.includes("video")) return Play;
  if (lower.includes("place")) return MapPin;
  if (lower.includes("book") || lower.includes("article")) return BookOpen;
  return Link2;
}

function categoryFor(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes("song") || lower.includes("music")) return "Song";
  if (lower.includes("movie") || lower.includes("film")) return "Movie";
  if (lower.includes("podcast")) return "Podcast";
  if (lower.includes("video")) return "Video";
  if (lower.includes("show") || lower.includes("series")) return "Show";
  if (lower.includes("book")) return "Book";
  if (lower.includes("article")) return "Article";
  if (lower.includes("place") || lower.includes("restaurant")) return "Place";
  if (lower.includes("date")) return "Date idea";
  if (lower.includes("link")) return "Link";
  return type || "Other";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function displayAuthor(authorName: string, currentPerson?: string) {
  if (!currentPerson) return authorName;
  if (authorName === currentPerson) return `Me - ${authorName}`;
  if (authorName === "Jak" || authorName === "Vee") return `My baby - ${authorName}`;
  return authorName;
}

function orderCategories(categories: string[]) {
  return categories.sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a);
    const bIndex = preferredOrder.indexOf(b);
    if (aIndex !== -1 || bIndex !== -1) {
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    }
    return a.localeCompare(b);
  });
}

function LinkCard({
  item,
  currentPerson,
}: Readonly<{
  item: SharedLinkRecord;
  currentPerson?: string;
}>) {
  const Icon = iconFor(item.link_type);

  return (
    <article className="mb-4 inline-block w-full break-inside-avoid rounded-3xl border border-[#FFD6E8] bg-white p-5 align-top shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD6E8] text-[#8c4058]">
          <Icon size={20} />
        </div>
        {item.is_favorite ? (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF7FA] text-[#FF8FAB]">
            <Heart size={16} fill="currentColor" />
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#a1435e]">
          {item.link_type}
        </p>
        <p className="text-xs font-semibold text-[#a1435e]">
          {formatDate(item.created_at)}
        </p>
      </div>
      <h2 className="mt-2 text-xl font-semibold text-[#2d1b22]">
        {item.title}
      </h2>
      {item.source_title ? (
        <p className="mt-2 text-sm font-semibold text-[#8c4058]">
          {item.source_title}
        </p>
      ) : null}
      <p className="mt-2 text-xs font-semibold text-[#8c4058]">
        {displayAuthor(item.author_name, currentPerson)}
      </p>
      {item.description ? (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#765061]">
          {item.description}
        </p>
      ) : null}
      {item.url ? (
        <>
          <LinkPreviewCard url={item.url} />
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFF7FA] px-4 py-2 text-sm font-semibold text-[#8c4058]"
          >
            <ExternalLink size={15} />
            Open
          </a>
        </>
      ) : (
        <p className="mt-4 rounded-2xl bg-[#FFF7FA] px-4 py-3 text-xs font-semibold text-[#8c4058]">
          Saved without a link.
        </p>
      )}
      <Interactions
        targetType="shared_link"
        targetId={item.id}
        path={`/links?item=${item.id}`}
        title={item.title}
      />
    </article>
  );
}

export function LinksFeed({
  links,
  currentPerson,
}: Readonly<{
  links: SharedLinkRecord[];
  currentPerson?: string;
}>) {
  const grouped = useMemo(() => {
    return links.reduce<Record<string, SharedLinkRecord[]>>((groups, item) => {
      const category = categoryFor(item.link_type);
      groups[category] ??= [];
      groups[category].push(item);
      return groups;
    }, {});
  }, [links]);

  const categories = useMemo(
    () => orderCategories(Object.keys(grouped)),
    [grouped],
  );
  const [activeCategory, setActiveCategory] = useState("all");

  if (links.length === 0) {
    return (
      <div className="rounded-3xl border border-[#FFD6E8] bg-white p-6 text-sm leading-6 text-[#765061] shadow-sm">
        No shared items yet. Save a song, movie, podcast, place, or anything you want to keep for both of you.
      </div>
    );
  }

  const visibleCategories =
    activeCategory === "all" ? categories : categories.filter((category) => category === activeCategory);

  return (
    <section className="grid gap-5">
      <div className="rounded-3xl border border-[#FFD6E8] bg-white p-4 shadow-sm">
        <label className="grid gap-2 text-sm font-semibold text-[#704153]">
          Category
          <select
            value={activeCategory}
            onChange={(event) => setActiveCategory(event.target.value)}
            className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none"
          >
            <option value="all">All ({links.length})</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category} ({grouped[category].length})
              </option>
            ))}
          </select>
        </label>
      </div>

      {visibleCategories.map((category) => {
        const Icon = iconFor(category);

        return (
          <section
            key={category}
            className="rounded-3xl border border-[#FFD6E8] bg-[#FFF7FA] p-4 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#8c4058]">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#a1435e]">
                    {category}
                  </p>
                  <h2 className="text-2xl font-semibold text-[#2d1b22]">
                    {grouped[category].length} saved
                  </h2>
                </div>
              </div>
            </div>

            <div className="columns-1 gap-4 md:columns-2">
              {grouped[category].map((item) => (
                <LinkCard
                  key={item.id}
                  item={item}
                  currentPerson={currentPerson}
                />
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}
