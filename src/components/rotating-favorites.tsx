"use client";

import Link from "next/link";
import { Link2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SharedLinkRecord } from "@/lib/links";

function displayType(item: SharedLinkRecord) {
  return `${item.link_type}${item.source_title ? ` - ${item.source_title}` : ""}`;
}

export function RotatingFavorites({
  links,
}: Readonly<{
  links: SharedLinkRecord[];
}>) {
  const [index, setIndex] = useState(0);
  const favorites = useMemo(
    () => (links.filter((link) => link.is_favorite).length > 0
      ? links.filter((link) => link.is_favorite)
      : links),
    [links],
  );
  const current = favorites[index % Math.max(favorites.length, 1)];

  useEffect(() => {
    if (favorites.length <= 1) return;

    const interval = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % favorites.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [favorites.length]);

  if (!current) {
    return (
      <Link
        href="/links"
        className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm"
      >
        <p className="text-sm font-semibold text-[#a1435e]">Saved favorites</p>
        <h2 className="mt-3 text-2xl font-semibold text-[#2d1b22]">
          Save a song, movie, or podcast
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#765061]">
          Keep things you want each other to hear, watch, read, or visit.
        </p>
      </Link>
    );
  }

  return (
    <Link
      href="/links"
      className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#a1435e]">Saved favorites</p>
          <h2 className="mt-3 break-words text-2xl font-semibold text-[#2d1b22]">
            {current.title}
          </h2>
        </div>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF7FA] text-[#8c4058]">
          <Link2 size={20} />
        </span>
      </div>
      <p className="mt-3 break-words text-sm leading-6 text-[#765061]">
        {displayType(current)}
      </p>
      {current.description ? (
        <p className="mt-3 line-clamp-2 break-words text-sm leading-6 text-[#765061]">
          {current.description}
        </p>
      ) : null}
    </Link>
  );
}
