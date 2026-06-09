import { CalendarDays, Pin } from "lucide-react";
import type { LoveNoteRecord } from "@/lib/notes";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function displayAuthor(authorName: string, currentPerson?: string) {
  if (!currentPerson) return authorName;
  if (authorName === currentPerson) return `Me - ${authorName}`;
  if (authorName === "Jak" || authorName === "Vee") return `My baby - ${authorName}`;
  return authorName;
}

export function NotesFeed({
  notes,
  currentPerson,
}: Readonly<{
  notes: LoveNoteRecord[];
  currentPerson?: string;
}>) {
  if (notes.length === 0) {
    return (
      <div className="rounded-3xl border border-[#FFD6E8] bg-white p-6 text-sm leading-6 text-[#765061] shadow-sm">
        No saved entries yet. Add the first one for your board.
      </div>
    );
  }

  return (
    <div className="columns-1 gap-4 md:columns-2">
      {notes.map((note) => (
        <article
          key={note.id}
          className="mb-4 inline-block w-full break-inside-avoid rounded-3xl border border-[#FFD6E8] bg-white p-5 align-top shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#a1435e]">
              {note.note_type}
            </p>
            <p className="text-xs font-semibold text-[#a1435e]">
              {formatDate(note.created_at)}
            </p>
          </div>

          <h3 className="mt-2 text-xl font-semibold text-[#2d1b22]">
            {note.title}
          </h3>
          <p className="mt-2 text-xs font-semibold text-[#8c4058]">
            {displayAuthor(note.author_name, currentPerson)}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#674253]">
            {note.body}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {note.is_pinned ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF7FA] px-4 py-2 text-xs font-semibold text-[#8c4058]">
                <Pin size={14} />
                Pinned
              </span>
            ) : null}
            {note.scheduled_for ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF7FA] px-4 py-2 text-xs font-semibold text-[#8c4058]">
                <CalendarDays size={14} />
                {note.scheduled_for}
              </span>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
