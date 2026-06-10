"use client";

import { Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { MentionField } from "@/components/mention-field";

type CommentRecord = {
  id: string;
  author_name: string;
  body: string | null;
  created_at: string;
};

type InteractionState = {
  likes: number;
  liked: boolean;
  shares: number;
  comments: CommentRecord[];
  shareUrl?: string;
};

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function fallbackState(): InteractionState {
  return { likes: 0, liked: false, shares: 0, comments: [] };
}

export function Interactions({
  targetType,
  targetId,
  path,
  title,
  compact = false,
}: Readonly<{
  targetType: string;
  targetId: string;
  path: string;
  title: string;
  compact?: boolean;
}>) {
  const [state, setState] = useState<InteractionState>(fallbackState);
  const [commentOpen, setCommentOpen] = useState(false);
  const [body, setBody] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const endpoint = useMemo(
    () => `/api/interactions/${targetType}/${targetId}`,
    [targetId, targetType],
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok || !mounted) return;
      setState(await response.json());
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [endpoint]);

  async function postAction(payload: Record<string, unknown>) {
    setIsBusy(true);
    setNotice("");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const nextState = (await response.json()) as InteractionState;
      setState(nextState);
      setIsBusy(false);
      return nextState;
    }

    setNotice("That did not save. Please try again.");
    setIsBusy(false);
    return null;
  }

  async function toggleLike() {
    await postAction({ action: "like" });
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    const nextState = await postAction({
      action: "comment",
      body: trimmed,
      path,
      title,
    });

    if (nextState) {
      setBody("");
      setCommentOpen(true);
    }
  }

  async function shareItem() {
    const nextState = await postAction({ action: "share", path, title });
    const shareUrl = nextState?.shareUrl;
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setNotice("Link copied.");
    } catch {
      setNotice(shareUrl);
    }
  }

  return (
    <div
      className={[
        "mt-4 border-t border-[#FFD6E8] pt-4",
        compact ? "text-xs" : "text-sm",
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void toggleLike()}
          disabled={isBusy}
          className={[
            "inline-flex min-w-0 items-center gap-1.5 rounded-full px-3 py-2 font-semibold transition",
            state.liked
              ? "bg-[#FF8FAB] text-white"
              : "bg-white text-[#8c4058] ring-1 ring-[#FFD6E8]",
          ].join(" ")}
        >
          <Heart size={15} fill={state.liked ? "currentColor" : "none"} />
          {state.likes}
        </button>

        <button
          type="button"
          onClick={() => setCommentOpen((open) => !open)}
          className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-white px-3 py-2 font-semibold text-[#8c4058] ring-1 ring-[#FFD6E8]"
        >
          <MessageCircle size={15} />
          {state.comments.length}
        </button>

        <button
          type="button"
          onClick={() => void shareItem()}
          disabled={isBusy}
          className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-white px-3 py-2 font-semibold text-[#8c4058] ring-1 ring-[#FFD6E8]"
        >
          <Share2 size={15} />
          Share {state.shares > 0 ? state.shares : ""}
        </button>
      </div>

      {notice ? (
        <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-[#a1435e] ring-1 ring-[#FFD6E8]">
          {notice}
        </p>
      ) : null}

      {commentOpen ? (
        <div className="mt-4 grid gap-3">
          {state.comments.length > 0 ? (
            <div className="grid gap-2">
              {state.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl bg-white px-3 py-2 text-[#674253] ring-1 ring-[#FFD6E8]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-[#a1435e]">
                      {comment.author_name}
                    </p>
                    <p className="text-[11px] font-semibold text-[#a1435e]">
                      {formatTime(comment.created_at)}
                    </p>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap leading-5">
                    {comment.body}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-[#8c4058] ring-1 ring-[#FFD6E8]">
              No comments yet.
            </p>
          )}

          <form onSubmit={(event) => void addComment(event)} className="flex gap-2">
            <MentionField
              as="input"
              value={body}
              onChange={setBody}
              placeholder="Write a comment or mention @vee..."
              className="min-w-0 flex-1 rounded-full border border-[#FFD6E8] bg-white px-4 py-2 text-sm outline-none placeholder:text-[#9c6b7b] focus:border-[#FF8FAB]"
            />
            <button
              disabled={isBusy || !body.trim()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF8FAB] text-white disabled:opacity-50"
              aria-label="Send comment"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
