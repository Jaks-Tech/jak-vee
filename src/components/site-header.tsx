"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/data/content";
import type { CoupleProfile } from "@/lib/profiles";

function ProfileChip({
  currentPerson,
  currentProfile,
  compact = false,
}: Readonly<{
  currentPerson?: string;
  currentProfile?: CoupleProfile | null;
  compact?: boolean;
}>) {
  if (!currentPerson) return null;

  return (
    <Link
      href="/profiles"
      className={[
        "inline-flex items-center gap-2 rounded-full bg-white/85 text-[#8c4058] shadow-sm ring-1 ring-[#FF8FAB]/25",
        compact ? "p-1" : "px-2 py-1.5",
      ].join(" ")}
      aria-label={`Open ${currentPerson} profile`}
    >
      <span className="h-9 w-9 overflow-hidden rounded-full bg-[#FFD6E8]">
        {currentProfile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentProfile.avatar_url}
            alt={`${currentProfile.display_name} profile`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm font-bold">
            {currentPerson.slice(0, 1)}
          </span>
        )}
      </span>
      {!compact ? (
        <span className="pr-2 text-xs font-semibold">
          {currentProfile?.display_name ?? currentPerson}
        </span>
      ) : null}
    </Link>
  );
}

export function SiteHeader({
  currentPerson,
  currentProfile,
}: Readonly<{
  currentPerson?: string;
  currentProfile?: CoupleProfile | null;
}>) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
      <header className="sticky top-0 z-20 w-full border-b border-white/40 bg-[#FFF7FA]/75 backdrop-blur-2xl">
        <div className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="group flex items-center gap-3"
              aria-label="Jak and Vee home"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#FF8FAB] via-[#FFC2D1] to-[#FFE5EC] opacity-70 blur-md transition group-hover:opacity-100" />

                <Image
                  src="/jv-logo.png"
                  alt="Jak and Vee logo"
                  width={56}
                  height={56}
                  priority
                  className="relative h-14 w-14 rounded-full border-2 border-white bg-white object-cover shadow-lg shadow-[#FF8FAB]/20 ring-1 ring-[#FF8FAB]/25"
                />
              </div>

              <div className="leading-none">
                <p className="bg-gradient-to-r from-[#7f4357] to-[#FF8FAB] bg-clip-text text-xl font-black tracking-tight text-transparent">
                  J/V
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#9b5c70]">
                  Forever Us
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-4 lg:flex">
              <nav className="flex items-center rounded-full border border-white/70 bg-white/60 p-1 text-sm font-semibold text-[#7f4357] shadow-sm shadow-[#FF8FAB]/10">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-4 py-2 transition hover:bg-[#FFF0F5] hover:text-[#FF5C8A]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <form action="/api/logout" method="post">
                <button
                  type="submit"
                  aria-label="Log out"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/70 text-[#8c4058] shadow-sm shadow-[#FF8FAB]/10 transition hover:-translate-y-0.5 hover:bg-white hover:text-[#FF5C8A] hover:shadow-md"
                >
                  <LogOut size={17} />
                </button>
              </form>

              <ProfileChip
                currentPerson={currentPerson}
                currentProfile={currentProfile}
              />
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <ProfileChip
                currentPerson={currentPerson}
                currentProfile={currentProfile}
                compact
              />

              <button
                type="button"
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/75 text-[#8c4058] shadow-sm shadow-[#FF8FAB]/10 transition hover:bg-white hover:text-[#FF5C8A]"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {mobileOpen ? (
            <nav className="mt-4 overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-2 shadow-xl shadow-[#FF8FAB]/15 backdrop-blur-xl lg:hidden">
              <div className="grid gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-3xl px-4 py-3 text-sm font-bold text-[#7f4357] transition hover:bg-[#FFF0F5] hover:text-[#FF5C8A]"
                  >
                    {item.label}
                  </Link>
                ))}

                <Link
                  href="/profiles"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 rounded-3xl bg-gradient-to-r from-[#FFF0F5] to-[#FFE5EC] px-4 py-3 text-sm font-bold text-[#8c4058] ring-1 ring-[#FF8FAB]/20"
                >
                  Me: {currentProfile?.display_name ?? currentPerson}
                </Link>

                <form action="/api/logout" method="post">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-3xl px-4 py-3 text-sm font-bold text-[#7f4357] transition hover:bg-[#FFF0F5] hover:text-[#FF5C8A]"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </form>
              </div>
            </nav>
          ) : null}
        </div>
      </header>
  );
}
