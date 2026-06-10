"use client";

import Link from "next/link";
import { CalendarHeart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { AnniversaryRecord } from "@/lib/anniversaries";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function countdownText(event: AnniversaryRecord) {
  if (!event.next_occurrence_at) return "Saved special day";

  const diff = new Date(event.next_occurrence_at).getTime() - Date.now();
  if (diff <= 0) return "Today";

  const days = Math.ceil(diff / 86400000);
  if (days === 1) return "Tomorrow";
  return `${days} days away`;
}

export function RotatingSpecialDates({
  reminders,
}: Readonly<{
  reminders: AnniversaryRecord[];
}>) {
  const [index, setIndex] = useState(0);
  const visibleReminders = useMemo(
    () =>
      reminders.filter((reminder) => reminder.next_occurrence_at).length > 0
        ? reminders.filter((reminder) => reminder.next_occurrence_at)
        : reminders,
    [reminders],
  );
  const current = visibleReminders[index % Math.max(visibleReminders.length, 1)];

  useEffect(() => {
    if (visibleReminders.length <= 1) return;

    const interval = window.setInterval(() => {
      setIndex((currentIndex) => (currentIndex + 1) % visibleReminders.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [visibleReminders.length]);

  if (!current) {
    return (
      <Link
        href="/anniversaries"
        className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm"
      >
        <p className="text-sm font-semibold text-[#a1435e]">Special days</p>
        <h2 className="mt-3 text-2xl font-semibold text-[#2d1b22]">
          Set up your next reminder
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#765061]">
          Add anniversaries, dates, trips, birthdays, and surprises.
        </p>
      </Link>
    );
  }

  return (
    <Link
      href="/anniversaries"
      className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#a1435e]">Special days</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#2d1b22]">
            {current.title}
          </h2>
        </div>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF7FA] text-[#8c4058]">
          <CalendarHeart size={20} />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[#765061]">
        {current.event_type} - {formatDate(current.date_value)}
      </p>
      <p className="mt-4 inline-flex rounded-full bg-[#FFF7FA] px-4 py-2 text-xs font-semibold text-[#a1435e]">
        {countdownText(current)}
      </p>
    </Link>
  );
}
