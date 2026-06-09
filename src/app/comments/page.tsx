import { Send } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { commentThreads } from "@/data/content";

export default function CommentsPage() {
  return (
    <PageShell>
      <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-[#a1435e]">Comments everywhere</p>
          <h1 className="mt-2 text-4xl font-semibold text-[#2d1b22]">
            Replies attached to every part of the web space.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#765061]">
            Comment on a memory, a picture, a note, a shared link, or a single
            chat message without losing the original context.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {commentThreads.map((thread) => (
            <article
              key={thread.title}
              className="rounded-3xl border border-[#FFD6E8] bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#a1435e]">
                {thread.target}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-[#2d1b22]">
                {thread.title}
              </h2>
              <div className="mt-4 grid gap-2">
                {thread.comments.map((comment) => (
                  <p
                    key={comment}
                    className="rounded-2xl bg-[#FFF7FA] px-4 py-3 text-sm leading-6 text-[#674253]"
                  >
                    {comment}
                  </p>
                ))}
              </div>
              <div className="mt-4 flex gap-2 rounded-full border border-[#FFD6E8] bg-[#FFF7FA] p-2">
                <input
                  aria-label={`Comment on ${thread.title}`}
                  placeholder="Add a comment..."
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#9c6b7b]"
                />
                <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF8FAB] text-white">
                  <Send size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
