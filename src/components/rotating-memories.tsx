// src/components/rotating-memories.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type MemoryPhoto = {
  id: string;
  preview_url: string;
  caption: string | null;
  memory_title: string | null;
  created_at: string;
};

function shufflePhotos(photos: MemoryPhoto[]) {
  return [...photos].sort(() => Math.random() - 0.5);
}

export function RotatingMemories({ photos }: { photos: MemoryPhoto[] }) {
  const [index, setIndex] = useState(0);

  const shuffledPhotos = useMemo(() => shufflePhotos(photos), [photos]);

  useEffect(() => {
    if (shuffledPhotos.length <= 4) return;

    const interval = setInterval(() => {
      setIndex((current) => (current + 4) % shuffledPhotos.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [shuffledPhotos.length]);

  const visiblePhotos = Array.from(
    { length: Math.min(4, shuffledPhotos.length) },
    (_, itemIndex) => shuffledPhotos[(index + itemIndex) % shuffledPhotos.length]
  );

  if (photos.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#FFD6E8] bg-[#FFF7FA] p-6 text-center text-sm text-[#765061]">
        No memory photos are available yet. Add a photo in Memories to see it here.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {visiblePhotos.map((photo) => (
        <div
          key={`${photo.id}-${index}`}
          className="overflow-hidden rounded-3xl border border-[#FFD6E8] bg-[#FFF7FA] transition duration-500"
        >
          <Link
            href="/memories"
            className="block h-63 overflow-hidden rounded-3xl bg-[#FFD6E8]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.preview_url}
              alt={photo.caption || photo.memory_title || "Memory photo"}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          </Link>

          <div className="px-4 py-3">
            <p className="truncate text-sm font-semibold text-[#704153]">
              {photo.caption || photo.memory_title || "Untitled memory"}
            </p>
            <p className="mt-1 text-xs text-[#765061]">
              {new Date(photo.created_at).toLocaleDateString("en", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}