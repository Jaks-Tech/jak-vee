"use client";

import { Download, Expand, FileText, Play, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Interactions } from "@/components/interactions";
import { supabase } from "@/lib/supabase";
import type { MemoryMedia, MemoryRecord } from "@/lib/memories";

const filters = [
  { key: "all", label: "All" },
  { key: "text", label: "Text" },
  { key: "photo", label: "Photos" },
  { key: "video", label: "Videos" },
  { key: "memory", label: "Memories" },
  { key: "moment", label: "Moments" },
  { key: "date", label: "Dates" },
  { key: "trip", label: "Trips" },
  { key: "gift", label: "Gifts" },
  { key: "place", label: "Places" },
  { key: "letter", label: "Letters" },
  { key: "song", label: "Songs" },
  { key: "anniversary", label: "Anniversaries" },
  { key: "surprise", label: "Surprises" },
];

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
  if (authorName === "Jak" || authorName === "Vee") {
    return `My baby - ${authorName}`;
  }
  return authorName;
}

function formatFileSize(size: number | null) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaTile({
  media,
  title,
  memoryId,
  pathBase,
  onPreview,
  isPrimary = false,
}: Readonly<{
  media: MemoryMedia;
  title: string;
  memoryId: string;
  pathBase: string;
  onPreview: (media: MemoryMedia) => void;
  isPrimary?: boolean;
}>) {
  const label = media.caption || media.file_name || title;

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border border-[#FFD6E8] bg-white",
        isPrimary ? "col-span-2" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onPreview(media)}
        className={[
          "group relative block w-full overflow-hidden bg-[#FFD6E8] text-left",
          isPrimary ? "aspect-[4/3]" : "aspect-[3/4]",
        ].join(" ")}
        aria-label={`Preview ${label}`}
      >
        {media.media_type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.preview_url}
            alt={label}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
          />
        ) : media.media_type === "video" ? (
          <>
            <video
              src={media.preview_url}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-[#2d1b22]/20 text-white">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FF8FAB]">
                <Play size={22} fill="currentColor" />
              </span>
            </span>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#8c4058]">
            <FileText size={28} />
          </div>
        )}
        <span className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#8c4058]">
          <Expand size={15} />
        </span>
      </button>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-[#704153]">
            {label}
          </p>
          {formatFileSize(media.file_size) ? (
            <p className="mt-0.5 text-[11px] font-semibold text-[#a1435e]">
              {formatFileSize(media.file_size)}
            </p>
          ) : null}
        </div>
        <a
          href={media.download_url}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFF7FA] text-[#a1435e]"
          aria-label={`Download ${label}`}
        >
          <Download size={15} />
        </a>
      </div>
      <div className="px-3 pb-3">
        <Interactions
          targetType="memory_media"
          targetId={media.id}
          path={`${pathBase}?item=${memoryId}&media=${media.id}`}
          title={label}
          compact
        />
      </div>
    </div>
  );
}

function PreviewOverlay({
  media,
  title,
  onClose,
}: Readonly<{
  media: MemoryMedia | null;
  title: string;
  onClose: () => void;
}>) {
  if (!media) return null;

  const label = media.caption || media.file_name || title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d1b22]/80 p-4">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#FFD6E8] px-4 py-3">
          <p className="min-w-0 truncate text-sm font-semibold text-[#704153]">
            {label}
          </p>
          <div className="flex items-center gap-2">
            <a
              href={media.download_url}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF7FA] text-[#a1435e]"
              aria-label={`Download ${label}`}
            >
              <Download size={16} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FF8FAB] text-white"
              aria-label="Close preview"
            >
              <X size={17} />
            </button>
          </div>
        </div>
        <div className="max-h-[78vh] bg-[#FFF7FA]">
          {media.media_type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.preview_url}
              alt={label}
              className="mx-auto max-h-[78vh] w-auto max-w-full object-contain"
            />
          ) : media.media_type === "video" ? (
            <video
              src={media.preview_url}
              controls
              autoPlay
              className="mx-auto max-h-[78vh] w-full bg-black object-contain"
            />
          ) : (
            <div className="flex min-h-72 items-center justify-center text-[#8c4058]">
              <FileText size={42} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MemoriesFeed({
  initialMemories,
  currentPerson,
  apiEndpoint = "/api/memories",
  heading = "Our Memories",
  pathBase = "/memories",
}: Readonly<{
  initialMemories: MemoryRecord[];
  currentPerson?: string;
  apiEndpoint?: string;
  heading?: string;
  pathBase?: string;
}>) {
  const [memories, setMemories] = useState(initialMemories);
  const [filter, setFilter] = useState("all");
  const [isLive, setIsLive] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [preview, setPreview] = useState<{
    media: MemoryMedia;
    title: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function refresh() {
      const response = await fetch(apiEndpoint, { cache: "no-store" });
      if (!response.ok || !isMounted) return;
      setMemories(await response.json());
      setLastSyncedAt(new Date());
    }

    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, 3000);

    function refreshOnFocus() {
      void refresh();
    }

    window.addEventListener("focus", refreshOnFocus);

    const channel = supabase
      .channel("memories-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "memories" },
        () => {
          void refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "memory_media" },
        () => {
          void refresh();
        },
      )
      .subscribe((status) => {
        if (isMounted) setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
      void supabase.removeChannel(channel);
    };
  }, [apiEndpoint]);

  const visibleMemories = useMemo(() => {
    if (filter === "all") return memories;
    return memories.filter((memory) => memory.memory_type === filter);
  }, [filter, memories]);

  const statusText = useMemo(() => {
    if (isLive) return "Live now";
    if (lastSyncedAt) return "Auto-syncing";
    return "Connecting";
  }, [isLive, lastSyncedAt]);

  return (
    <section className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#a1435e]">{heading}</p>

        </div>
        <p className="rounded-full bg-[#FFF7FA] px-3 py-2 text-xs font-semibold text-[#8c4058]">
          {statusText}
        </p>
      </div>

      <div className="mt-5 rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid min-w-0 flex-1 gap-2 text-sm font-semibold text-[#704153]">
            Filter memories
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[#FF8FAB]"
            >
              {filters.map((item) => {
                const count =
                  item.key === "all"
                    ? memories.length
                    : memories.filter((memory) => memory.memory_type === item.key)
                        .length;

                return (
                  <option key={item.key} value={item.key}>
                    {item.label} ({count})
                  </option>
                );
              })}
            </select>
          </label>
          <div className="rounded-2xl bg-white px-4 py-3 text-center">
            <p className="text-xs font-semibold text-[#a1435e]">Showing</p>
            <p className="mt-1 text-2xl font-bold text-[#FF8FAB]">
              {visibleMemories.length}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 columns-1 gap-4 md:columns-2">
        {visibleMemories.length > 0 ? (
          visibleMemories.map((memory) => (
            <article
              key={memory.id}
              className="mb-4 inline-block w-full break-inside-avoid overflow-hidden rounded-3xl border border-[#FFD6E8] bg-[#FFF7FA] align-top"
            >
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#a1435e]">
                    {memory.memory_type}
                  </p>
                  <p className="text-xs font-semibold text-[#a1435e]">
                    {formatDate(memory.created_at)}
                  </p>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-[#2d1b22]">
                  {memory.title}
                </h3>
                <p className="mt-2 text-xs font-semibold text-[#8c4058]">
                  {displayAuthor(memory.author_name, currentPerson)}
                </p>
                {memory.body ? (
                  <p className="mt-3 text-sm leading-6 text-[#765061]">
                    {memory.body}
                  </p>
                ) : null}
                {memory.location_text || memory.memory_date ? (
                  <p className="mt-3 text-xs font-semibold text-[#8c4058]">
                    {[memory.location_text, memory.memory_date]
                      .filter(Boolean)
                      .join(" - ")}
                  </p>
                ) : null}
                {memory.tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {memory.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#a1435e] ring-1 ring-[#FFD6E8]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <Interactions
                  targetType="memory"
                  targetId={memory.id}
                  path={`${pathBase}?item=${memory.id}`}
                  title={memory.title}
                />
              </div>

              {memory.media.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 border-t border-[#FFD6E8] p-4">
                  {memory.media.map((media, index) => (
                    <MediaTile
                      key={media.id}
                      media={media}
                      title={memory.title}
                      memoryId={memory.id}
                      pathBase={pathBase}
                      isPrimary={index === 0}
                      onPreview={(selectedMedia) =>
                        setPreview({ media: selectedMedia, title: memory.title })
                      }
                    />
                  ))}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-[#FFF7FA] px-4 py-4 text-sm text-[#765061]">
            No memories here yet.
          </p>
        )}
      </div>

      <PreviewOverlay
        media={preview?.media ?? null}
        title={preview?.title ?? ""}
        onClose={() => setPreview(null)}
      />
    </section>
  );
}
