"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { createStoryChapter } from "./actions";

const chapterTypes = [
  "How we started",
  "Milestone",
  "Memory",
  "Challenge",
  "Dream",
  "Promise",
  "Lesson",
  "Future plan",
  "Chapter",
  "Custom",
];

export function StoryComposer() {
  const [selectedType, setSelectedType] = useState("Chapter");

  return (
    <form action={createStoryChapter} className="mt-5 grid gap-3">
      <label className="grid gap-2 text-sm font-semibold text-[#704153]">
        Chapter type
        <select
          name="chapter_type"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none focus:border-[#FF8FAB]"
        >
          {chapterTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      {selectedType === "Custom" ? (
        <input
          name="custom_type"
          required
          placeholder="Custom chapter type"
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
        />
      ) : null}

      <input
        name="title"
        required
        placeholder="Chapter title"
        className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="chapter_date"
          type="date"
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none"
        />
        <input
          name="mood"
          placeholder="Mood or feeling"
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
        />
      </div>

      <textarea
        name="body"
        placeholder="Write this part of the story..."
        className="min-h-40 resize-none rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
      />

      <label className="inline-flex items-center gap-2 rounded-2xl bg-[#FFF7FA] px-4 py-3 text-sm font-semibold text-[#704153]">
        <input
          name="is_favorite"
          type="checkbox"
          className="h-4 w-4 accent-[#FF8FAB]"
        />
        Mark as favorite chapter
      </label>

      <button className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white">
        <Send size={16} />
        Save chapter
      </button>
    </form>
  );
}
