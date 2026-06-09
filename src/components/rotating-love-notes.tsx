// src/components/rotating-love-notes.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type LoveNote = {
  id: string;
  title: string;
  body: string;
  author_name: string;
  note_type: string;
  created_at: string;
};

function shuffleNotes(notes: LoveNote[]) {
  return [...notes].sort(() => Math.random() - 0.5);
}

export function RotatingLoveNotes({ notes }: { notes: LoveNote[] }) {
  const [index, setIndex] = useState(0);

  const shuffledNotes = useMemo(() => shuffleNotes(notes), [notes]);

  useEffect(() => {
    if (shuffledNotes.length <= 3) return;

    const interval = setInterval(() => {
      setIndex((current) => (current + 3) % shuffledNotes.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [shuffledNotes.length]);

  const visibleNotes = Array.from(
    { length: Math.min(3, shuffledNotes.length) },
    (_, itemIndex) => shuffledNotes[(index + itemIndex) % shuffledNotes.length]
  );

  if (notes.length === 0) {
    return (
      <div className="col-span-full rounded-3xl border border-dashed border-[#FFD6E8] bg-[#FFF7FA] p-6 text-center text-sm text-[#765061]">
        No love notes yet. Share one on the Love Notes page.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibleNotes.map((note, idx) => {
        const bgColorClass = idx % 2 === 0 ? "bg-[#FFF7FA]" : "bg-[#FFE8F3]";

        return (
          <Link
            key={`${note.id}-${index}`}
            href="/notes"
            className={`rounded-3xl border border-[#FFD6E8] ${bgColorClass} p-5 transition duration-500 hover:-translate-y-1 hover:shadow-sm`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#a1435e]">
                {note.note_type}
              </p>
              <p className="text-xs font-semibold text-[#a1435e]">
                {new Date(note.created_at).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <h3 className="mt-3 text-lg font-semibold text-[#2d1b22]">
              {note.title}
            </h3>

            <p className="mt-2 text-xs font-semibold text-[#8c4058]">
              {note.author_name}
            </p>

            <p className="mt-3 line-clamp-3 text-sm leading-5 text-[#674253]">
              {note.body}
            </p>
          </Link>
        );
      })}
    </div>
  );
}