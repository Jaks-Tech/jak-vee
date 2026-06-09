"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { createLoveNote } from "./actions";

export const noteTypes = [
  "Our to-do",
  "Words of affirmation",
  "Plans of the day",
  "Private note",
  "Reminder",
  "Prayer or wish",
  "Date idea",
];

export function NotesComposer() {
  const [selectedType, setSelectedType] = useState(noteTypes[0]);

  return (
    <form action={createLoveNote} className="mt-5 grid gap-3">
      <label className="grid gap-2 text-sm font-semibold text-[#704153]">
        Type
        <select
          name="note_type"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none focus:border-[#FF8FAB]"
        >
          {noteTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
      </label>

      {selectedType === "custom" ? (
        <input
          name="custom_type"
          required
          placeholder="Custom type, like Weekend plan"
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
        />
      ) : null}

      <input
        name="title"
        required
        placeholder="Title"
        className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
      />
      <textarea
        name="body"
        required
        aria-label="Write an entry"
        placeholder="Write the note, plan, affirmation, or reminder..."
        className="min-h-36 resize-none rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
      />

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <input
          name="scheduled_for"
          type="date"
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none"
        />
        <label className="inline-flex items-center gap-2 rounded-2xl bg-[#FFF7FA] px-4 py-3 text-sm font-semibold text-[#704153]">
          <input
            name="is_pinned"
            type="checkbox"
            className="h-4 w-4 accent-[#FF8FAB]"
          />
          Pin
        </label>
      </div>

      <button className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white">
        <Send size={16} />
        Save entry
      </button>
    </form>
  );
}
