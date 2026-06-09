"use client";

import { CalendarHeart, Plus, X } from "lucide-react";
import { useState } from "react";
import type { AnniversaryRecord } from "@/lib/anniversaries";
import { AnniversaryComposer } from "./anniversary-composer";
import { AnniversaryFeed } from "./anniversary-feed";

export function AnniversaryWorkspace({
  events,
  currentPerson,
}: Readonly<{
  events: AnniversaryRecord[];
  currentPerson?: string;
}>) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <section className="grid gap-6">
      <div className="flex justify-end">
        {!isComposerOpen ? (
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white shadow-sm"
          >
            <Plus size={17} />
            Add reminder
          </button>
        ) : null}
      </div>

      {isComposerOpen ? (
        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD6E8] text-[#8c4058]">
                <CalendarHeart size={20} />
              </div>
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF7FA] text-[#a1435e]"
                aria-label="Close reminder form"
              >
                <X size={17} />
              </button>
            </div>
            <p className="text-sm font-semibold text-[#a1435e]">New reminder</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#2d1b22]">
              Set up a special day.
            </h2>
            <AnniversaryComposer />
          </div>

          <AnniversaryFeed events={events} currentPerson={currentPerson} />
        </section>
      ) : (
        <AnniversaryFeed events={events} currentPerson={currentPerson} />
      )}
    </section>
  );
}
