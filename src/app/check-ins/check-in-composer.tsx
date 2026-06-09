"use client";

import { useMemo, useState } from "react";
import { Send, X } from "lucide-react";
import { dailyCheckIns } from "@/data/content";
import { createCheckIn } from "./actions";

const promptOptions = [
  ...dailyCheckIns.map((item) => ({
    ...item,
    key: item.title,
  })),
  {
    title: "Custom check-in",
    detail: "Create something that fits today.",
    type: "custom",
    key: "custom",
  },
];

export function CheckInComposer({
  onClose,
}: Readonly<{
  onClose?: () => void;
}>) {
  const [selectedKey, setSelectedKey] = useState("");

  const selected = useMemo(
    () => promptOptions.find((item) => item.key === selectedKey),
    [selectedKey],
  );

  return (
    <section className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm">
      {onClose ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF7FA] text-[#a1435e]"
            aria-label="Close check-in form"
          >
            <X size={17} />
          </button>
        </div>
      ) : null}
      <div className="grid gap-3">
        <label className="grid gap-2 text-sm font-semibold text-[#704153]">
          Choose a check-in
          <select
            value={selectedKey}
            onChange={(event) => setSelectedKey(event.target.value)}
            className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none focus:border-[#FF8FAB]"
          >
            <option value="">Pick what you want to update...</option>
            {promptOptions.map((item) => (
              <option key={item.key} value={item.key}>
                {item.title}
              </option>
            ))}
          </select>
        </label>

        {selected ? (
          <form action={createCheckIn} className="mt-3 grid gap-3">
            <input
              type="hidden"
              name="checkin_type"
              value={selected.type}
            />
            <input
              type="hidden"
              name="is_custom"
              value={selected.type === "custom" ? "true" : "false"}
            />
            {selected.type !== "custom" ? (
              <>
                <input type="hidden" name="title" value={selected.title} />
                <input type="hidden" name="prompt_key" value={selected.title} />
                <div className="rounded-2xl bg-[#FFF7FA] px-4 py-3">
                  <h2 className="font-semibold text-[#2d1b22]">
                    {selected.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[#765061]">
                    {selected.detail}
                  </p>
                </div>
              </>
            ) : (
              <input
                name="title"
                required
                placeholder="Title"
                className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
              />
            )}

            <textarea
              name="body"
              required
              placeholder="Write your update..."
              className="min-h-32 resize-none rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
            />

            {selected.type === "location" ? (
              <input
                name="location_label"
                placeholder="Where are you?"
                className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
              />
            ) : null}

            {selected.type === "meet_time" ? (
              <input
                name="meet_time"
                type="datetime-local"
                className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none"
              />
            ) : null}

            {(selected.type === "evening" || selected.type === "mood") ? (
              <input
                name="mood"
                placeholder="Mood or feeling"
                className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
              />
            ) : null}

            <button className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white">
              <Send size={16} />
              Save check-in
            </button>
          </form>
        ) : (
          <p className="rounded-2xl bg-[#FFF7FA] px-4 py-4 text-sm text-[#765061]">
            Choose a check-in.
          </p>
        )}
      </div>
    </section>
  );
}
