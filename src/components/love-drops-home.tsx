import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { LoveDropRecord } from "@/lib/love-drops";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function LoveDropsHome({
  drops,
}: Readonly<{
  drops: LoveDropRecord[];
}>) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
      <div className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#a1435e]">
              <Sparkles size={15} />
              Love drops
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#2d1b22]">
              Little surprises sent through the day.
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {drops.length > 0 ? (
            drops.slice(0, 6).map((drop) => (
              <Link
                key={drop.id}
                href={`/?loveDrop=${drop.id}`}
                className="grid overflow-hidden rounded-3xl border border-[#FFD6E8] bg-[#FFF7FA] transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="aspect-[4/3] bg-[#FFD6E8]">
                  {drop.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={drop.image_url}
                      alt={drop.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-[#a1435e]">
                    {drop.time_label ?? "sweet"} - {formatDate(drop.created_at)}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[#2d1b22]">
                    {drop.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#765061]">
                    {drop.body}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="rounded-2xl bg-[#FFF7FA] px-4 py-4 text-sm text-[#765061] md:col-span-3">
              No love drops yet. The first one will appear after the scheduled run or admin test.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
