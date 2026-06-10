"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { MentionField } from "@/components/mention-field";
import { createSharedLink } from "./actions";

const linkTypes = [
  "Song",
  "Movie",
  "Podcast",
  "Video",
  "Place",
  "Article",
  "Book",
  "Show",
  "Date idea",
  "Link",
  "Custom",
];

export function LinksComposer() {
  const [selectedType, setSelectedType] = useState("Song");
  const [description, setDescription] = useState("");

  return (
    <form action={createSharedLink} className="mt-5 grid gap-3">
      <label className="grid gap-2 text-sm font-semibold text-[#704153]">
        Type
        <select
          name="link_type"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none focus:border-[#FF8FAB]"
        >
          {linkTypes.map((type) => (
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
          placeholder="Custom type"
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
        />
      ) : null}

      <input
        name="title"
        required
        placeholder={
          selectedType === "Song"
            ? "Song title"
            : selectedType === "Movie"
              ? "Movie title"
              : selectedType === "Podcast"
                ? "Podcast title"
                : "Title"
        }
        className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
      />
      <input
        name="source_title"
        placeholder="Artist, creator, place, or source"
        className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
      />
      <input
        name="url"
        type="text"
        placeholder="Optional link"
        className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
      />
      <MentionField
        name="description"
        value={description}
        onChange={setDescription}
        placeholder="Why are we saving this?"
        className="min-h-28 resize-none rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
      />
      <label className="inline-flex items-center gap-2 rounded-2xl bg-[#FFF7FA] px-4 py-3 text-sm font-semibold text-[#704153]">
        <input
          name="is_favorite"
          type="checkbox"
          className="h-4 w-4 accent-[#FF8FAB]"
        />
        Favorite
      </label>

      <button className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white">
        <Send size={16} />
        Save
      </button>
    </form>
  );
}
