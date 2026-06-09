"use client";

import Link from "next/link";
import { Lock, Plus } from "lucide-react";
import { useState } from "react";
import type { MemoryRecord } from "@/lib/memories";
import { createPrivateMemory } from "./actions";
import { MemoryComposer } from "./memory-composer";
import { MemoriesFeed } from "./memories-feed";

export function MemoriesWorkspace({
  initialMemories,
  currentPerson,
  privateMode = false,
}: Readonly<{
  initialMemories: MemoryRecord[];
  currentPerson?: string;
  privateMode?: boolean;
}>) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const feed = (
    <MemoriesFeed
      initialMemories={initialMemories}
      currentPerson={currentPerson}
      apiEndpoint={privateMode ? "/api/memories/private" : "/api/memories"}
      heading={privateMode ? "Private folder" : "Our Memories"}
      pathBase={privateMode ? "/memories/private" : "/memories"}
    />
  );

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap justify-end gap-3">
        {!privateMode ? (
          <Link
            href="/memories/private"
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#8c4058] shadow-sm ring-1 ring-[#FFD6E8]"
          >
            <Lock size={17} />
            Private folder
          </Link>
        ) : null}
        {!isComposerOpen ? (
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white shadow-sm"
          >
            <Plus size={17} />
            {privateMode ? "Add private memory" : "Add memory"}
          </button>
        ) : null}
      </div>

      {isComposerOpen ? (
        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <MemoryComposer
            onClose={() => setIsComposerOpen(false)}
            action={privateMode ? createPrivateMemory : undefined}
            privateMode={privateMode}
          />
          {feed}
        </section>
      ) : (
        feed
      )}
    </section>
  );
}
