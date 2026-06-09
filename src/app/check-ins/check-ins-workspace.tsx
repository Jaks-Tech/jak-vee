"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { CheckInComposer } from "./check-in-composer";
import { CheckInsFeed, type LiveCheckIn } from "./check-ins-feed";

export function CheckInsWorkspace({
  initialCheckIns,
  currentPerson,
}: Readonly<{
  initialCheckIns: LiveCheckIn[];
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
            Add check-in
          </button>
        ) : null}
      </div>

      {isComposerOpen ? (
        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <CheckInComposer onClose={() => setIsComposerOpen(false)} />
          <CheckInsFeed
            initialCheckIns={initialCheckIns}
            currentPerson={currentPerson}
          />
        </section>
      ) : (
        <CheckInsFeed
          initialCheckIns={initialCheckIns}
          currentPerson={currentPerson}
        />
      )}
    </section>
  );
}
