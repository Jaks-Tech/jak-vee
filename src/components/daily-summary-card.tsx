import { Sparkles } from "lucide-react";
import type { DailySummaryRecord } from "@/lib/daily-summary";

export function DailySummaryCard({
  summary,
}: Readonly<{
  summary: DailySummaryRecord | null;
}>) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
      <div className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#a1435e]">
              AI Daily Summary
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#2d1b22]">
              Our day, in a nutshell.
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF7FA] px-4 py-3 text-sm font-semibold text-[#8c4058]">
            <Sparkles size={16} />
            Mmmgh..
          </span>
        </div>

        {summary ? (
          <>
            <p className="mt-3 text-xs font-semibold text-[#a1435e]">
              {summary.summary_date} - clears after 24 hours
            </p>
            <p className="mt-5 whitespace-pre-wrap rounded-3xl bg-[#FFF7FA] p-5 text-sm leading-6 text-[#674253]">
              {summary.summary}
            </p>
          </>
        ) : (
          <p className="mt-5 rounded-3xl bg-[#FFF7FA] p-5 text-sm leading-6 text-[#765061]">
            Coming up...</p>
        )}
      </div>
    </section>
  );
}
