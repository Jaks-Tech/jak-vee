"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { MemoryRecord } from "@/lib/memories";
import { MemoryComposer } from "./memory-composer";
import { MemoriesFeed } from "./memories-feed";

export function MemoriesWorkspace({
  initialMemories,
  currentPerson,
}: Readonly<{
  initialMemories: MemoryRecord[];
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
            Add memory
          </button>
        ) : null}
      </div>

      {isComposerOpen ? (
        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <MemoryComposer onClose={() => setIsComposerOpen(false)} />
          <MemoriesFeed
            initialMemories={initialMemories}
            currentPerson={currentPerson}
          />
        </section>
      ) : (
        <MemoriesFeed
          initialMemories={initialMemories}
          currentPerson={currentPerson}
        />
      )}
    </section>
  );
}
