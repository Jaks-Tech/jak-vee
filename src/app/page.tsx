import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CalendarHeart,
  Camera,
  HeartHandshake,
  Link2,
  MessageCircle,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { DailySummaryCard } from "@/components/daily-summary-card";
import { RotatingMemories } from "@/components/rotating-memories";
import { RotatingLoveNotes } from "@/components/rotating-love-notes";
import { LoveDropOverlay } from "@/components/love-drop-overlay";
import { LoveDropsHome } from "@/components/love-drops-home";
import { getAnniversaryReminders } from "@/lib/anniversaries";
import { getLatestDailySummary } from "@/lib/daily-summary";
import { getSharedLinks } from "@/lib/links";
import { getLoveDrop, getLoveDrops } from "@/lib/love-drops";
import { getRecentMemoryImages } from "@/lib/memories";
import { getLoveNotes } from "@/lib/notes";
import { getCoupleProfiles } from "@/lib/profiles";

const quickLinks = [
  {
    title: "Daily Check-ins",
    href: "/check-ins",
    icon: HeartHandshake,
  },
  {
    title: "Love Notes",
    href: "/notes",
    icon: NotebookPen,
  },
  {
    title: "Memories",
    href: "/memories",
    icon: Camera,
  },
  {
    title: "Special Dates",
    href: "/anniversaries",
    icon: CalendarHeart,
  },
  {
    title: "Favorites",
    href: "/links",
    icon: Link2,
  },
  {
    title: "Our Story",
    href: "/story",
    icon: BookOpen,
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
];

export default async function Home({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ loveDrop?: string }>;
}>) {
  const params = await searchParams;
  const [
    recentPhotos,
    loveNotes,
    profiles,
    reminders,
    sharedLinks,
    dailySummary,
    loveDrops,
  ] = await Promise.all([
    getRecentMemoryImages(40),
    getLoveNotes(),
    getCoupleProfiles(),
    getAnniversaryReminders(),
    getSharedLinks(),
    getLatestDailySummary(),
    getLoveDrops(),
  ]);
  const selectedLoveDrop = params.loveDrop
    ? await getLoveDrop(params.loveDrop)
    : null;
  const nextReminder = reminders.find((reminder) => reminder.next_occurrence_at);
  const favoriteLink = sharedLinks[0];

  return (
    <PageShell>
      <LoveDropOverlay drop={selectedLoveDrop} />
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">

          <h1 className="text-5xl font-semibold leading-tight text-[#25131a] sm:text-6xl">
            Our Little Beautiful Place
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-[#714657]">
            A soft private space for our memories, check-ins, love notes,
            favorite links, special dates, story, and everyday conversations.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#f47798]"
                >
                  <Icon size={17} />
                  {link.title}
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/80 bg-white/72 p-5 shadow-[0_24px_80px_rgba(255,143,171,0.22)] backdrop-blur">
          <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-[#FFD6E8]">
            <Image
              src="/jv-logo.png"
              alt="Jak and Vee logo"
              fill
              priority
              className="object-cover"
            />
          </div>

          <div className="mt-5 rounded-3xl bg-[#FFF7FA] p-5">
            <p className="text-sm font-semibold text-[#a1435e]">Today</p>
            <p className="mt-2 text-2xl font-semibold text-[#2d1b22]">
              Let&apos;s make today another beautiful chapter in our story.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {profiles.map((profile) => (
              <Link
                key={profile.person_name}
                href="/profiles"
                className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-[#FFD6E8]"
              >
                <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-[#FFD6E8]">
                  {profile.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
                      alt={`${profile.display_name} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-bold text-[#8c4058]">
                      {profile.person_name.slice(0, 1)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-center text-sm font-semibold text-[#8c4058]">
                  {profile.display_name}
                </p>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 pb-16 sm:px-8 md:grid-cols-2">
        <Link
          href="/anniversaries"
          className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-semibold text-[#a1435e]">Next special day</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#2d1b22]">
            {nextReminder?.title ?? "Set up your next reminder"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#765061]">
            {nextReminder
              ? `${nextReminder.event_type} - ${nextReminder.date_value}`
              : "Add anniversaries, dates, trips, birthdays, and surprises."}
          </p>
        </Link>

        <Link
          href="/links"
          className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-semibold text-[#a1435e]">Saved favorite</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#2d1b22]">
            {favoriteLink?.title ?? "Save a song, movie, or podcast"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#765061]">
            {favoriteLink
              ? `${favoriteLink.link_type}${favoriteLink.source_title ? ` - ${favoriteLink.source_title}` : ""}`
              : "Keep things you want each other to hear, watch, read, or visit."}
          </p>
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
        <div className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#a1435e]">
                Our memories
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#2d1b22]">
                The little memories that make up our big story.
              </h2>
            </div>

            <Link
              href="/memories"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF8FAB] px-4 py-3 text-sm font-semibold text-white shadow-sm"
            >
              View all memories
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-5">
            <RotatingMemories photos={recentPhotos} />
          </div>
        </div>
      </section>

      <LoveDropsHome drops={loveDrops} />

      <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">
        <div className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#a1435e]">
                Love notes
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#2d1b22]">
                Sweet words that keep us close.
              </h2>
            </div>

            <Link
              href="/notes"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF8FAB] px-4 py-3 text-sm font-semibold text-white shadow-sm"
            >
              View all notes
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-5">
            <RotatingLoveNotes notes={loveNotes} />
          </div>
        </div>
      </section>

      <DailySummaryCard summary={dailySummary} />
    </PageShell>
  );
}
