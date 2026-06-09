"use client";

import { NotebookPen, Plus, X } from "lucide-react";
import { useState } from "react";
import type { LoveNoteRecord } from "@/lib/notes";
import { NotesComposer } from "./notes-composer";
import { NotesFeed } from "./notes-feed";

export function NotesWorkspace({
  notes,
  currentPerson,
}: Readonly<{
  notes: LoveNoteRecord[];
  currentPerson?: string;
}>) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [overview, setOverview] = useState<string | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  function sanitizeMarkdown(input: string) {
    if (!input) return "";
    let s = input;
    // Remove $$ math blocks
    s = s.replace(/\$\$[\s\S]*?\$\$/g, "");
    // Remove inline $
    s = s.replace(/\$/g, "");
    // Remove markdown headings (e.g. ### Heading)
    s = s.replace(/^#{1,6}\s*/gm, "");
    // Remove bold/italic markers
    s = s.replace(/\*\*(.*?)\*\*/g, "$1");
    s = s.replace(/__(.*?)__/g, "$1");
    s = s.replace(/\*(.*?)\*/g, "$1");
    s = s.replace(/_(.*?)_/g, "$1");
    // Remove backticks
    s = s.replace(/`{1,3}(.*?)`{1,3}/g, "$1");
    // Remove leftover list markers at line starts
    s = s.replace(/^\s*[-*+]\s+/gm, "");
    // Collapse multiple blank lines
    s = s.replace(/\n{3,}/g, "\n\n");
    return s.trim();
  }

  return (
    <section className="grid gap-6">
      <div className="flex justify-end items-center gap-2">
        {!isComposerOpen ? (
          <>
            <button
              type="button"
              onClick={() => setIsComposerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white shadow-sm"
            >
              <Plus size={17} />
              Add entry
            </button>

            <button
              type="button"
              onClick={async () => {
                setOverviewError(null);
                setIsLoadingOverview(true);
                try {
                  const payload = notes.map((n) => `${n.title}: ${n.body}`);
                  const res = await fetch("/api/notes/overview", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ notes: payload }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    setOverviewError(data?.error || "Failed to generate overview");
                    setOverview(null);
                  } else {
                    const raw = data.summary ?? "";
                    const cleaned = sanitizeMarkdown(String(raw));
                    setOverview(cleaned || null);
                  }
                } catch (err) {
                  setOverviewError("Network error");
                  setOverview(null);
                } finally {
                  setIsLoadingOverview(false);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#FFD6E8] bg-white px-4 py-2 text-sm font-semibold text-[#704153]"
            >
              <NotebookPen size={16} />
              {isLoadingOverview ? "Generating..." : "Get overview"}
            </button>
          </>
        ) : null}
      </div>

      {isComposerOpen ? (
        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD6E8] text-[#8c4058]">
                <NotebookPen size={20} />
              </div>
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF7FA] text-[#a1435e]"
                aria-label="Close entry form"
              >
                <X size={17} />
              </button>
            </div>
            <p className="text-sm font-semibold text-[#a1435e]">New entry</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#2d1b22]">
              Save something for us.
            </h2>
            <NotesComposer />
          </div>

          <NotesFeed notes={notes} currentPerson={currentPerson} />
        </section>
      ) : (
        <NotesFeed notes={notes} currentPerson={currentPerson} />
      )}

      {overview ? (
        <section className="mt-6 rounded-3xl border border-[#E6D3D9] bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-[#a1435e]">Overview</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#674253]">{overview}</p>
        </section>
      ) : null}

      {overviewError ? (
        <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">{overviewError}</p>
      ) : null}
    </section>
  );
}
