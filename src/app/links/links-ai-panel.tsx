"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

type Suggestion = {
  title: string;
  type: string;
  source: string;
  url: string;
  description: string;
};

export function LinksAiPanel({
  onRefreshSaved,
}: Readonly<{
  onRefreshSaved?: () => Promise<void>;
}>) {
  const [type, setType] = useState("Movie");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const [savingUrl, setSavingUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function suggest() {
    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      const response = await fetch("/api/ai/link-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, query }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "AI suggestions failed.");
      } else {
        setSuggestions(data.suggestions ?? []);
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function saveSuggestion(item: Suggestion) {
    setSavingUrl(item.url);
    setError("");

    const response = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link_type: item.type,
        title: item.title,
        source_title: item.source,
        url: item.url,
        description: item.description,
        is_favorite: true,
      }),
    });

    if (response.ok) {
      setSavedUrls((current) => new Set(current).add(item.url));
    } else {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Saving failed.");
    }

    setSavingUrl("");
  }

  async function clearAndShowSaved() {
    setSuggestions([]);
    setSavedUrls(new Set());
    setError("");
    await onRefreshSaved?.();
  }

  const savedCount = savedUrls.size;

  return (
    <section className="rounded-3xl border border-[#FFD6E8] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#a1435e]">Search suggestions</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#2d1b22]">
            Titles...
          </h2>
        </div>
        <Sparkles className="text-[#FF8FAB]" size={22} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[12rem_1fr_auto]">
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none"
        >
          <option>Song</option>
          <option>Movie</option>
          <option>Podcast</option>
          <option>Video</option>
          <option>Book</option>
          <option>Date idea</option>
        </select>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Example: cozy romantic movie for the weekend"
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
        />
        <button
          type="button"
          onClick={() => void suggest()}
          disabled={loading || !query.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-[#FFF7FA] px-4 py-3 text-sm font-semibold text-[#a1435e]">
          {error}
        </p>
      ) : null}

      {suggestions.length > 0 && savedCount > 0 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FFF7FA] px-4 py-3">
          <p className="text-sm font-semibold text-[#8c4058]">
            {savedCount} saved from this search.
          </p>
          <button
            type="button"
            onClick={() => void clearAndShowSaved()}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#8c4058] ring-1 ring-[#FFD6E8]"
          >
            Clear and show saved
          </button>
        </div>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {suggestions.map((item) => (
            <article
              key={`${item.title}-${item.url}`}
              className="rounded-3xl border border-[#FFD6E8] bg-[#FFF7FA] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#a1435e]">
                {item.type}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-[#2d1b22]">
                {item.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[#8c4058]">
                {item.source}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#765061]">
                {item.description}
              </p>
              <button
                type="button"
                onClick={() => void saveSuggestion(item)}
                disabled={savingUrl === item.url || savedUrls.has(item.url)}
                className={[
                  "mt-4 rounded-full px-4 py-2 text-sm font-semibold",
                  savedUrls.has(item.url)
                    ? "bg-[#FF8FAB] text-white"
                    : "bg-white text-[#8c4058]",
                ].join(" ")}
              >
                {savedUrls.has(item.url)
                  ? "Saved"
                  : savingUrl === item.url
                    ? "Saving..."
                    : "Save this"}
              </button>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
