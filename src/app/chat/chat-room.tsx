"use client";

import {
  ArrowUp,
  Bell,
  Heart,
  Lightbulb,
  MessageCircle,
  Reply,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Interactions } from "@/components/interactions";
import { supabase } from "@/lib/supabase";
import type { ChatMessageRecord } from "@/lib/chat";

const contexts = [
  { value: "general", label: "General" },
  { value: "memories", label: "Memories" },
  { value: "check-ins", label: "Check-ins" },
  { value: "notes", label: "Notes" },
  { value: "anniversaries", label: "Reminders" },
  { value: "links", label: "Links" },
  { value: "story", label: "Story" },
];

const messageTypes = [
  { value: "message", label: "Message" },
  { value: "direction", label: "Direction" },
  { value: "question", label: "Question" },
  { value: "idea", label: "Idea" },
  { value: "reminder", label: "Reminder" },
];

const quickDirections = [
  "Please check the memories page.",
  "Add this to our plans for today.",
  "Can you save this as a reminder?",
  "Let us talk about this tonight.",
];

type LocalChatMessage = ChatMessageRecord & {
  pending?: boolean;
  failed?: boolean;
};

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function displayAuthor(authorName: string, currentPerson?: string) {
  if (!currentPerson) return authorName;
  if (authorName === currentPerson) return "Me";
  if (authorName === "Jak" || authorName === "Vee") return "My baby";
  return authorName;
}

function iconFor(type: string) {
  if (type === "direction") return ArrowUp;
  if (type === "idea") return Lightbulb;
  if (type === "reminder") return Bell;
  if (type === "question") return Sparkles;
  return MessageCircle;
}

export function ChatRoom({
  initialMessages,
  currentPerson,
}: Readonly<{
  initialMessages: ChatMessageRecord[];
  currentPerson?: string;
}>) {
  const [messages, setMessages] = useState<LocalChatMessage[]>(initialMessages);
  const [contextFilter, setContextFilter] = useState("all");
  const [contextType, setContextType] = useState("general");
  const [messageType, setMessageType] = useState("message");
  const [contextTitle, setContextTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("Auto-syncing");
  const [sendError, setSendError] = useState("");
  const [replyTo, setReplyTo] = useState<LocalChatMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    const response = await fetch("/api/chat", { cache: "no-store" });
    if (!response.ok) return;
    const nextMessages = (await response.json()) as ChatMessageRecord[];
    setMessages((current) => {
      const pending = current.filter((message) => message.pending);
      return [...nextMessages, ...pending];
    });
    setStatus("Auto-syncing");
  }

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 2500);

    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_messages" },
        () => void refresh(),
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === "SUBSCRIBED") setStatus("Live now");
      });

    return () => {
      window.clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const visibleMessages = useMemo(() => {
    if (contextFilter === "all") return messages;
    return messages.filter((message) => message.context_type === contextFilter);
  }, [contextFilter, messages]);

  async function sendCurrentMessage(
    event?: FormEvent<HTMLFormElement>,
    quickBody?: string,
    quickType?: ChatMessageRecord["message_type"],
  ) {
    event?.preventDefault();
    const trimmed = (quickBody ?? body).trim();
    if (!trimmed || isSending) return;
    const typeToSend = quickType ?? (messageType as ChatMessageRecord["message_type"]);

    const temporaryId = `pending-${crypto.randomUUID()}`;
    const optimisticMessage: LocalChatMessage = {
      id: temporaryId,
      body: trimmed,
      author_name: currentPerson ?? "Jak & Vee",
      message_type: typeToSend,
      context_type: contextType,
      context_title: contextTitle || null,
      is_direction: typeToSend === "direction",
      reply_to_id: replyTo?.id ?? null,
      created_at: new Date().toISOString(),
      pending: true,
    };

    setSendError("");
    setMessages((current) => [...current, optimisticMessage]);
    setBody("");
    setContextTitle("");
    setReplyTo(null);
    setIsSending(true);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: trimmed,
        message_type: typeToSend,
        context_type: contextType,
        context_title: contextTitle,
        reply_to_id: replyTo?.id,
      }),
    });

    if (response.ok) {
      const saved = await response.json();
      setMessages((current) =>
        current.map((message) => (message.id === temporaryId ? saved : message)),
      );
      setMessageType("message");
    } else {
      setSendError("Message was not sent. Try again.");
      setMessages((current) =>
        current.map((message) =>
          message.id === temporaryId
            ? { ...message, pending: false, failed: true }
            : message,
        ),
      );
    }

    setIsSending(false);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendCurrentMessage();
    }
  }

  return (
    <div className="rounded-[2rem] border border-[#FFD6E8] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#a1435e]">Private chat</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#2d1b22] sm:text-4xl">
            Talk, plan, and give directions.
          </h1>
        </div>
        <p className="rounded-full bg-[#FFF7FA] px-3 py-2 text-xs font-semibold text-[#8c4058]">
          {status}
        </p>
      </div>

      <div className="mb-4 grid gap-3 rounded-3xl border border-[#FFD6E8] bg-[#FFF7FA] p-3">
        <label className="grid gap-2 text-sm font-semibold text-[#704153]">
          Filter conversation
          <select
            value={contextFilter}
            onChange={(event) => setContextFilter(event.target.value)}
            className="rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm font-normal outline-none"
          >
            <option value="all">All conversations</option>
            {contexts.map((context) => (
              <option key={context.value} value={context.value}>
                {context.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="max-h-[58vh] min-h-96 overflow-y-auto rounded-3xl bg-[#FFF7FA] p-3">
        <div className="grid gap-3">
          {visibleMessages.length > 0 ? (
            visibleMessages.map((message) => {
              const isMine = message.author_name === currentPerson;
              const Icon = iconFor(message.message_type);
              const repliedMessage = message.reply_to_id
                ? messages.find((item) => item.id === message.reply_to_id)
                : null;

              return (
                <article
                  key={message.id}
                  className={[
                    "max-w-[88%] rounded-3xl p-4 shadow-sm ring-1 ring-[#FFD6E8]",
                    isMine
                      ? "ml-auto bg-[#FF8FAB] text-white"
                      : "mr-auto bg-white text-[#5e3d4b]",
                    message.failed ? "opacity-75 ring-red-300" : "",
                    message.pending ? "opacity-80" : "",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "inline-flex h-7 w-7 items-center justify-center rounded-full",
                        isMine ? "bg-white/20" : "bg-[#FFD6E8] text-[#8c4058]",
                      ].join(" ")}
                    >
                      <Icon size={14} />
                    </span>
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      {displayAuthor(message.author_name, currentPerson)}
                    </p>
                    <span className="text-xs opacity-80">{formatTime(message.created_at)}</span>
                    {message.pending ? <span className="text-xs opacity-80">Sending</span> : null}
                    {message.failed ? <span className="text-xs opacity-80">Failed</span> : null}
                  </div>
                  {repliedMessage ? (
                    <div
                      className={[
                        "mt-3 rounded-2xl border-l-4 px-3 py-2 text-xs leading-5",
                        isMine
                          ? "border-white/70 bg-white/15"
                          : "border-[#FF8FAB] bg-[#FFF7FA] text-[#8c4058]",
                      ].join(" ")}
                    >
                      <span className="font-semibold">
                        Replying to {displayAuthor(repliedMessage.author_name, currentPerson)}
                      </span>
                      <br />
                      {repliedMessage.body}
                    </div>
                  ) : null}
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                    {message.body}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        isMine ? "bg-white/20" : "bg-[#FFF7FA] text-[#8c4058]",
                      ].join(" ")}
                    >
                      {message.context_type}
                    </span>
                    {message.context_title ? (
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          isMine ? "bg-white/20" : "bg-[#FFF7FA] text-[#8c4058]",
                        ].join(" ")}
                      >
                        {message.context_title}
                      </span>
                    ) : null}
                  </div>
                  {!message.pending && !message.failed ? (
                    <Interactions
                      targetType="chat_message"
                      targetId={message.id}
                      path={`/chat?item=${message.id}`}
                      title={message.context_title || message.context_type}
                      compact
                    />
                  ) : null}
                  {!message.pending && !message.failed ? (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTo(message);
                        setBody("");
                      }}
                      className={[
                        "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold",
                        isMine ? "bg-white/20" : "bg-[#FFF7FA] text-[#8c4058]",
                      ].join(" ")}
                    >
                      <Reply size={13} />
                      Reply
                    </button>
                  ) : null}
                </article>
              );
            })
          ) : (
            <p className="rounded-2xl bg-white px-4 py-4 text-sm text-[#765061]">
              No messages here yet.
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={(event) => void sendCurrentMessage(event)} className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            value={contextType}
            onChange={(event) => setContextType(event.target.value)}
            className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none"
          >
            {contexts.map((context) => (
              <option key={context.value} value={context.value}>
                {context.label}
              </option>
            ))}
          </select>
          <select
            value={messageType}
            onChange={(event) => setMessageType(event.target.value)}
            className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none"
          >
            {messageTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <input
            value={contextTitle}
            onChange={(event) => setContextTitle(event.target.value)}
            placeholder="Optional topic"
            className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {quickDirections.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => {
                setMessageType("direction");
                void sendCurrentMessage(undefined, text, "direction");
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#FFF7FA] px-3 py-2 text-xs font-semibold text-[#8c4058]"
            >
              <Heart size={13} />
              {text}
            </button>
          ))}
        </div>

        {replyTo ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#a1435e]">
                Replying to {displayAuthor(replyTo.author_name, currentPerson)}
              </p>
              <p className="truncate text-sm text-[#765061]">{replyTo.body}</p>
            </div>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#a1435e]"
              aria-label="Cancel reply"
            >
              <X size={15} />
            </button>
          </div>
        ) : null}

        <div className="flex gap-2 rounded-3xl border border-[#FFD6E8] bg-[#FFF7FA] p-2">
          <textarea
            aria-label="Write a private chat message"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Send a message, direction, idea, or question..."
            rows={2}
            className="min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#9c6b7b]"
          />
          <button
            disabled={isSending || !body.trim()}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF8FAB] text-white disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={17} />
          </button>
        </div>
        {sendError ? (
          <p className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#a1435e]">
            {sendError}
          </p>
        ) : null}
      </form>
    </div>
  );
}
