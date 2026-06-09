"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { Interactions } from "@/components/interactions";
import type { LoveDropRecord } from "@/lib/love-drops";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function LoveDropOverlay({
  drop,
}: Readonly<{
  drop: LoveDropRecord | null;
}>) {
  if (!drop) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d1b22]/75 p-4">
      <div className="relative grid max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl md:grid-cols-[0.95fr_1.05fr]">
        <Link
          href="/"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#a1435e] shadow-sm ring-1 ring-[#FFD6E8]"
          aria-label="Close love drop"
        >
          <X size={18} />
        </Link>

        <div className="min-h-72 bg-[#FFD6E8] md:min-h-[34rem]">
          {drop.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={drop.image_url}
              alt={drop.title}
              className="h-full max-h-[70vh] w-full object-cover md:max-h-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#FFF7FA] p-8 text-center text-[#8c4058]">
              A sweet surprise from Jak & Vee.
            </div>
          )}
        </div>

        <section className="p-6 sm:p-8">
          <p className="text-sm font-semibold text-[#a1435e]">
            {drop.time_label ? `${drop.time_label} love drop` : "Love drop"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#2d1b22]">
            {drop.title}
          </h2>
          <p className="mt-5 whitespace-pre-wrap text-lg leading-8 text-[#674253]">
            {drop.body}
          </p>
          <p className="mt-5 text-xs font-semibold text-[#a1435e]">
            {formatDate(drop.created_at)}
          </p>

          <Interactions
            targetType="love_drop"
            targetId={drop.id}
            path={`/?loveDrop=${drop.id}`}
            title={drop.title}
          />
        </section>
      </div>
    </div>
  );
}
