"use client";

import { useEffect, useMemo, useState } from "react";
import { dailyCheckIns } from "@/data/content";
import { supabase } from "@/lib/supabase";

export type LiveCheckIn = {
  id: string;
  checkin_type: string;
  title: string;
  body: string | null;
  mood: string | null;
  location_label: string | null;
  meet_time: string | null;
  is_custom: boolean;
  author_name: string;
  created_at: string;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function displayAuthor(authorName: string, currentPerson?: string) {
  if (!currentPerson) return authorName;
  if (authorName === currentPerson) return `Me · ${authorName}`;
  if (authorName === "Jak" || authorName === "Vee") {
    return `My baby · ${authorName}`;
  }
  return authorName;
}

function filterKeyFor(checkIn: LiveCheckIn) {
  return checkIn.checkin_type === "custom"
    ? `custom:${checkIn.title}`
    : checkIn.checkin_type;
}

export function CheckInsFeed({
  initialCheckIns,
  currentPerson,
}: Readonly<{
  initialCheckIns: LiveCheckIn[];
  currentPerson?: string;
}>) {
  const [checkIns, setCheckIns] = useState(initialCheckIns);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isLive, setIsLive] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function refresh() {
      const response = await fetch("/api/check-ins", { cache: "no-store" });
      if (!response.ok || !isMounted) return;
      setCheckIns(await response.json());
      setLastSyncedAt(new Date());
    }

    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, 2000);

    function refreshOnFocus() {
      void refresh();
    }

    window.addEventListener("focus", refreshOnFocus);

    const channel = supabase
      .channel("daily-checkins-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_checkins" },
        () => {
          void refresh();
        },
      )
      .subscribe((status) => {
        if (isMounted) setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
      void supabase.removeChannel(channel);
    };
  }, []);

  const filterGroups = useMemo(() => {
    const baseGroups = [
      { key: "all", title: "All", count: checkIns.length },
      ...dailyCheckIns.map((checkIn) => ({
        key: checkIn.type,
        title: checkIn.title,
        count: checkIns.filter((item) => item.checkin_type === checkIn.type)
          .length,
      })),
    ];

    const customGroups = Array.from(
      new Set(
        checkIns
          .filter((checkIn) => checkIn.checkin_type === "custom")
          .map((checkIn) => checkIn.title),
      ),
    ).map((title) => ({
      key: `custom:${title}`,
      title,
      count: checkIns.filter(
        (checkIn) =>
          checkIn.checkin_type === "custom" && checkIn.title === title,
      ).length,
    }));

    return [...baseGroups, ...customGroups];
  }, [checkIns]);

  const visibleCheckIns = useMemo(() => {
    if (selectedFilter === "all") return checkIns;
    return checkIns.filter((checkIn) => filterKeyFor(checkIn) === selectedFilter);
  }, [checkIns, selectedFilter]);

  const statusText = useMemo(() => {
    if (isLive) return "Live now";
    if (lastSyncedAt) return "Auto-syncing";
    return "Connecting live updates";
  }, [isLive, lastSyncedAt]);

  const selectedGroup =
    filterGroups.find((group) => group.key === selectedFilter) ?? filterGroups[0];

  return (
    <div className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#a1435e]">Our daily check-ins</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#2d1b22]">
            {selectedGroup?.title ?? "All"}
          </h2>
        </div>
        <p className="rounded-full bg-[#FFF7FA] px-3 py-2 text-xs font-semibold text-[#8c4058]">
          {statusText}
        </p>
      </div>

      <section className="mt-5 rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="grid min-w-0 flex-1 gap-2 text-sm font-semibold text-[#704153]">
            Filter check-ins
            <select
              value={selectedFilter}
              onChange={(event) => setSelectedFilter(event.target.value)}
              className="rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm font-normal outline-none focus:border-[#FF8FAB]"
            >
              {filterGroups.map((group) => (
                <option key={group.key} value={group.key}>
                  {group.title} ({group.count})
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl bg-white px-4 py-3 text-center">
            <p className="text-xs font-semibold text-[#a1435e]">Showing</p>
            <p className="mt-1 text-2xl font-bold text-[#FF8FAB]">
              {selectedGroup?.count ?? visibleCheckIns.length}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 border-t border-[#FFD6E8] pt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[#704153]">
            Preview starts here
          </p>
          <p className="text-xs font-semibold text-[#a1435e]">
            {visibleCheckIns.length} update{visibleCheckIns.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid gap-3">
          {visibleCheckIns.length > 0 ? (
            visibleCheckIns.map((checkIn) => (
              <article
                key={checkIn.id}
                className="rounded-2xl bg-[#FFF7FA] px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-[#a1435e]">
                      {displayAuthor(checkIn.author_name, currentPerson)}
                    </p>
                    <h3 className="mt-1 font-semibold text-[#2d1b22]">
                      {checkIn.title}
                    </h3>
                  </div>
                  <p className="text-xs font-semibold text-[#a1435e]">
                    {formatDate(checkIn.created_at)}
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#765061]">
                  {checkIn.body}
                </p>
                {checkIn.location_label || checkIn.meet_time || checkIn.mood ? (
                  <p className="mt-2 text-xs font-semibold text-[#8c4058]">
                    {[
                      checkIn.location_label,
                      checkIn.mood,
                      checkIn.meet_time ? formatDate(checkIn.meet_time) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                ) : null}
              </article>
            ))
          ) : (
            <p className="rounded-2xl bg-[#FFF7FA] px-4 py-4 text-sm text-[#765061]">
              Nothing here yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
