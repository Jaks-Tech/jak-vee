import { BookOpen, Heart, Sparkles } from "lucide-react";
import { Interactions } from "@/components/interactions";
import type { StoryChapterRecord } from "@/lib/story";

function formatDate(date: string | null, createdAt: string) {
  const value = date ? `${date}T00:00:00` : createdAt;

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function displayAuthor(authorName: string, currentPerson?: string) {
  if (!currentPerson) return authorName;
  if (authorName === currentPerson) return `Me - ${authorName}`;
  if (authorName === "Jak" || authorName === "Vee") return `My baby - ${authorName}`;
  return authorName;
}

export function StoryFeed({
  chapters,
  currentPerson,
}: Readonly<{
  chapters: StoryChapterRecord[];
  currentPerson?: string;
}>) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-3xl border border-[#FFD6E8] bg-white p-6 text-sm leading-6 text-[#765061] shadow-sm">
        No chapters yet. Start with how everything began.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute bottom-0 left-6 top-0 hidden w-px bg-[#FFD6E8] sm:block" />
      <div className="grid gap-5">
        {chapters.map((chapter, index) => (
          <article
            key={chapter.id}
            className="relative grid gap-4 rounded-3xl border border-[#FFD6E8] bg-white p-5 shadow-sm sm:grid-cols-[auto_1fr]"
          >
            <div className="z-10 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD6E8] text-[#8c4058]">
              {chapter.is_favorite ? (
                <Heart size={20} fill="currentColor" />
              ) : (
                <BookOpen size={20} />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#a1435e]">
                  Chapter {index + 1} - {chapter.chapter_type}
                </p>
                <p className="text-xs font-semibold text-[#a1435e]">
                  {formatDate(chapter.chapter_date, chapter.created_at)}
                </p>
              </div>
              <h2 className="mt-2 text-xl font-semibold text-[#2d1b22]">
                {chapter.title}
              </h2>
              <p className="mt-2 text-xs font-semibold text-[#8c4058]">
                {displayAuthor(chapter.author_name, currentPerson)}
              </p>
              {chapter.body ? (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#765061]">
                  {chapter.body}
                </p>
              ) : null}
              {chapter.mood ? (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FFF7FA] px-4 py-2 text-xs font-semibold text-[#8c4058]">
                  <Sparkles size={14} />
                  {chapter.mood}
                </p>
              ) : null}
              <Interactions
                targetType="story_chapter"
                targetId={chapter.id}
                path={`/story?item=${chapter.id}`}
                title={chapter.title}
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
