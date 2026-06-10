"use client";

import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { MentionField } from "@/components/mention-field";
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
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [instruction, setInstruction] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftStatus, setDraftStatus] = useState("");

  async function draftWithAi() {
    const trimmed = instruction.trim();
    if (!trimmed) {
      setDraftStatus("Tell AI what you want to write first.");
      return;
    }

    setIsDrafting(true);
    setDraftStatus("Drafting...");

    const response = await fetch("/api/ai/note-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instruction: trimmed,
        noteType: selectedType,
      }),
    });

    if (!response.ok) {
      setDraftStatus("AI could not draft this. Try again.");
      setIsDrafting(false);
      return;
    }

    const data = await response.json();
    const draft = data?.draft;

    if (draft) {
      setTitle(String(draft.title ?? ""));
      setBody(String(draft.body ?? ""));
      if (noteTypes.includes(draft.noteType)) {
        setSelectedType(draft.noteType);
      }
      setDraftStatus(data.warning || "Draft added. You can edit it before saving.");
    } else {
      setDraftStatus("AI did not return a draft.");
    }

    setIsDrafting(false);
  }

  return (
    <form action={createLoveNote} className="mt-5 grid gap-3">
      <div className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] p-3">
        <div className="grid gap-3">
          <textarea
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Ask AI: write date ideas in Nairobi, plan my day, make a sweet affirmation, create our to-do list..."
            className="min-h-24 resize-none rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => void draftWithAi()}
              disabled={isDrafting}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#8c4058] ring-1 ring-[#FFD6E8] disabled:opacity-60"
            >
              <Sparkles size={15} />
              {isDrafting ? "Writing..." : "Write with AI"}
            </button>
            <p className="text-xs font-semibold text-[#8c4058]">
              Use @vee, @jak, or @both to notify someone.
            </p>
          </div>
          {draftStatus ? (
            <p className="rounded-2xl bg-white px-4 py-3 text-xs font-semibold text-[#8c4058]">
              {draftStatus}
            </p>
          ) : null}
        </div>
      </div>

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
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title"
        className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
      />
      <MentionField
        name="body"
        required
        aria-label="Write an entry"
        value={body}
        onChange={setBody}
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
