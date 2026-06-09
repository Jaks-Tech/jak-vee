"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { createAnniversaryReminder } from "./actions";

const eventTypes = [
  "Anniversary",
  "Trip",
  "Special day",
  "Date",
  "Birthday",
  "Monthly celebration",
  "Surprise",
  "Promise",
  "Custom",
];

export function AnniversaryComposer() {
  const [eventType, setEventType] = useState("Anniversary");
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <form action={createAnniversaryReminder} className="mt-5 grid gap-3">
      <label className="grid gap-2 text-sm font-semibold text-[#704153]">
        Event type
        <select
          name="event_type"
          value={eventType}
          onChange={(event) => setEventType(event.target.value)}
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none focus:border-[#FF8FAB]"
        >
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      {eventType === "Custom" ? (
        <input
          name="custom_event_type"
          required
          placeholder="Custom event type"
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
        />
      ) : null}

      <input
        name="title"
        required
        placeholder="Event title"
        className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-[#704153]">
          Date
          <input
            name="date_value"
            type="date"
            required
            className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-[#704153]">
          Time
          <input
            name="event_time"
            type="time"
            defaultValue="09:00"
            className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-[#704153]">
        Repeat
        <select
          name="reminder_rule"
          defaultValue="yearly"
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none focus:border-[#FF8FAB]"
        >
          <option value="yearly">Every year</option>
          <option value="monthly">Every month</option>
          <option value="once">Only once</option>
        </select>
      </label>

      <textarea
        name="notes"
        placeholder="Notes about this day"
        className="min-h-28 resize-none rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
      />

      <label className="inline-flex items-center gap-2 rounded-2xl bg-[#FFF7FA] px-4 py-3 text-sm font-semibold text-[#704153]">
        <input
          name="email_enabled"
          type="checkbox"
          checked={emailEnabled}
          onChange={(event) => setEmailEnabled(event.target.checked)}
          className="h-4 w-4 accent-[#FF8FAB]"
        />
        Send email that day
      </label>

      {emailEnabled ? (
        <div className="grid gap-3 rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] p-3">
          <input
            name="email_recipients"
            required
            placeholder="Emails, separated by commas"
            className="rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
          />
          <input
            name="email_subject"
            placeholder="Email subject"
            className="rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
          />
          <textarea
            name="email_message"
            placeholder="Email message"
            className="min-h-24 resize-none rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
          />
        </div>
      ) : null}

      <button className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white">
        <Send size={16} />
        Save reminder
      </button>
    </form>
  );
}
