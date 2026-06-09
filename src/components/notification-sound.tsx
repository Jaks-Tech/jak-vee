"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const notificationTables = [
  "activity_events",
  "daily_checkins",
  "love_notes",
  "memories",
  "memory_media",
  "shared_links",
  "anniversaries",
  "story_chapters",
  "chat_messages",
  "couple_profiles",
];

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function playChime(context: AudioContext) {
  const now = context.currentTime;
  const gain = context.createGain();
  gain.connect(context.destination);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

  [660, 880].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.13);
    oscillator.connect(gain);
    oscillator.start(now + index * 0.13);
    oscillator.stop(now + 0.42 + index * 0.13);
  });
}

export function NotificationSound() {
  const [enabled, setEnabled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mountedAtRef = useRef(Date.now());
  const lastActivityIdRef = useRef<number | null>(null);

  useEffect(() => {
    setEnabled(window.localStorage.getItem("jak_vee_sound_enabled") === "true");
  }, []);

  useEffect(() => {
    if (!enabled) return;

    async function checkLatestActivity(shouldPlay: boolean) {
      const response = await fetch("/api/activity/latest", { cache: "no-store" });
      if (!response.ok) return;
      const latest = (await response.json()) as { id?: number } | null;
      if (!latest?.id) return;

      if (lastActivityIdRef.current === null) {
        lastActivityIdRef.current = latest.id;
        return;
      }

      if (latest.id > lastActivityIdRef.current) {
        lastActivityIdRef.current = latest.id;
        if (shouldPlay && audioContextRef.current) {
          void audioContextRef.current.resume().then(() => {
            if (audioContextRef.current) playChime(audioContextRef.current);
          });
        }
      }
    }

    void checkLatestActivity(false);
    const pollInterval = window.setInterval(() => {
      void checkLatestActivity(true);
    }, 4000);

    const channel = supabase.channel("jak-vee-global-notifications");

    notificationTables.forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          // Avoid a sound burst for events that arrive while the page is mounting.
          if (Date.now() - mountedAtRef.current < 1500) return;
          if (!audioContextRef.current) return;

          void audioContextRef.current.resume().then(() => {
            if (audioContextRef.current) playChime(audioContextRef.current);
          });
        },
      );
    });

    channel.subscribe((status) => {
      setIsReady(status === "SUBSCRIBED");
    });

    return () => {
      window.clearInterval(pollInterval);
      void supabase.removeChannel(channel);
    };
  }, [enabled]);

  async function enableSound() {
    const audioWindow = window as AudioWindow;
    const AudioContextClass =
      audioWindow.AudioContext || audioWindow.webkitAudioContext;
    if (!AudioContextClass) return;

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;

    await context.resume();
    playChime(context);
    window.localStorage.setItem("jak_vee_sound_enabled", "true");
    setEnabled(true);
  }

  function muteSound() {
    window.localStorage.setItem("jak_vee_sound_enabled", "false");
    setEnabled(false);
    setIsReady(false);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {enabled ? (
        <button
          type="button"
          onClick={muteSound}
          className="inline-flex items-center gap-2 rounded-full border border-[#FFD6E8] bg-white/95 px-4 py-3 text-xs font-semibold text-[#8c4058] shadow-sm"
        >
          <Bell size={15} />
          {isReady ? "Sound on" : "Sound ready"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void enableSound()}
          className="inline-flex items-center gap-2 rounded-full bg-[#FF8FAB] px-4 py-3 text-xs font-semibold text-white shadow-sm"
        >
          <BellOff size={15} />
          Enable sound
        </button>
      )}
    </div>
  );
}
