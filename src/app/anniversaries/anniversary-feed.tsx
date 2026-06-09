"use client";

import { CalendarHeart, Mail, Repeat, Timer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { AnniversaryRecord } from "@/lib/anniversaries";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function formatCountdown(target: string | null, now: Date) {
  if (!target) return "Completed";

  const diff = new Date(target).getTime() - now.getTime();
  if (diff <= 0) return "Today";

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function displayAuthor(authorName: string, currentPerson?: string) {
  if (!currentPerson) return authorName;
  if (authorName === currentPerson) return `Me - ${authorName}`;
  if (authorName === "Jak" || authorName === "Vee") return `My baby - ${authorName}`;
  return authorName;
}

export function AnniversaryFeed({
  events,
  currentPerson,
}: Readonly<{
  events: AnniversaryRecord[];
  currentPerson?: string;
}>) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const nextEvent = useMemo(
    () => events.find((event) => event.next_occurrence_at),
    [events],
  );

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-[#FFD6E8] bg-white p-6 text-sm leading-6 text-[#765061] shadow-sm">
        No reminders yet. Add your first special day.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {nextEvent ? (
        <article className="rounded-3xl border border-[#FF8FAB] bg-[#2d1b22] p-6 text-white shadow-sm">
          <p className="text-sm font-semibold text-[#FFD6E8]">Next reminder</p>
          <h2 className="mt-2 text-3xl font-semibold">{nextEvent.title}</h2>
          <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-[#8c4058]">
            <Timer size={18} />
            <span className="text-lg font-bold">
              {formatCountdown(nextEvent.next_occurrence_at, now)}
            </span>
          </div>
        </article>
      ) : null}

      <div className="columns-1 gap-4 md:columns-2">
        {events.map((event) => (
          <article
            key={event.id}
            className="mb-4 inline-block w-full break-inside-avoid rounded-3xl border border-[#FFD6E8] bg-white p-5 align-top shadow-sm"
          >
            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD6E8] text-[#8c4058]">
              <CalendarHeart size={20} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#a1435e]">
                {event.event_type}
              </p>
              <p className="text-xs font-semibold text-[#a1435e]">
                {event.event_time.slice(0, 5)}
              </p>
            </div>
            <h3 className="mt-2 text-xl font-semibold text-[#2d1b22]">
              {event.title}
            </h3>
            <p className="mt-2 text-xs font-semibold text-[#8c4058]">
              {displayAuthor(event.author_name, currentPerson)}
            </p>
            <p className="mt-3 text-sm leading-6 text-[#765061]">
              {formatDate(event.date_value)}
            </p>
            {event.notes ? (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#674253]">
                {event.notes}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF7FA] px-4 py-2 text-xs font-semibold text-[#8c4058]">
                <Timer size={14} />
                {formatCountdown(event.next_occurrence_at, now)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF7FA] px-4 py-2 text-xs font-semibold text-[#8c4058]">
                <Repeat size={14} />
                {event.reminder_rule}
              </span>
              {event.email_enabled ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF7FA] px-4 py-2 text-xs font-semibold text-[#8c4058]">
                  <Mail size={14} />
                  Email on
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
