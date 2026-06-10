"use client";

import {
  ComponentPropsWithoutRef,
  ElementType,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Mention = {
  handle: string;
  label: string;
  person: string;
};

type MentionFieldProps<T extends ElementType> = {
  as?: T;
  value: string;
  onChange: (value: string) => void;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "value" | "onChange">;

let cachedMentions: Mention[] | null = null;

function currentMentionQuery(value: string, cursor: number) {
  const beforeCursor = value.slice(0, cursor);
  const match = beforeCursor.match(/(^|\s)@([a-zA-Z0-9_.-]*)$/);
  if (!match) return null;

  return {
    query: match[2].toLowerCase(),
    start: beforeCursor.length - match[2].length - 1,
  };
}

export function MentionField<T extends ElementType = "textarea">({
  as,
  value,
  onChange,
  className,
  ...props
}: MentionFieldProps<T>) {
  const Component = (as ?? "textarea") as ElementType;
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [mentions, setMentions] = useState<Mention[]>(cachedMentions ?? []);
  const [queryInfo, setQueryInfo] = useState<{ query: string; start: number } | null>(null);

  useEffect(() => {
    if (cachedMentions) return;

    let mounted = true;
    async function loadMentions() {
      const response = await fetch("/api/mentions", { cache: "no-store" });
      if (!response.ok || !mounted) return;
      const nextMentions = (await response.json()) as Mention[];
      cachedMentions = nextMentions;
      setMentions(nextMentions);
    }

    void loadMentions();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleMentions = useMemo(() => {
    if (!queryInfo) return [];

    return mentions
      .filter(
        (mention) =>
          mention.handle.includes(queryInfo.query) ||
          mention.label.toLowerCase().includes(queryInfo.query),
      )
      .slice(0, 5);
  }, [mentions, queryInfo]);

  function updateQuery(nextValue: string) {
    const cursor = inputRef.current?.selectionStart ?? nextValue.length;
    setQueryInfo(currentMentionQuery(nextValue, cursor));
  }

  function selectMention(mention: Mention) {
    if (!queryInfo) return;

    const input = inputRef.current;
    const cursor = input?.selectionStart ?? value.length;
    const nextValue = `${value.slice(0, queryInfo.start)}@${mention.handle} ${value.slice(cursor)}`;
    onChange(nextValue);
    setQueryInfo(null);

    window.requestAnimationFrame(() => {
      const nextCursor = queryInfo.start + mention.handle.length + 2;
      input?.focus();
      input?.setSelectionRange(nextCursor, nextCursor);
    });
  }

  return (
    <div className="relative min-w-0">
      <Component
        {...props}
        ref={inputRef}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          onChange(event.target.value);
          updateQuery(event.target.value);
        }}
        onKeyUp={() => updateQuery(value)}
        onClick={() => updateQuery(value)}
        className={className}
      />

      {visibleMentions.length > 0 ? (
        <div className="absolute left-2 right-2 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-[#FFD6E8] bg-white shadow-lg">
          {visibleMentions.map((mention) => (
            <button
              key={`${mention.person}-${mention.handle}`}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selectMention(mention)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-[#FFF7FA]"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[#2d1b22]">
                  {mention.label}
                </span>
                <span className="text-xs font-semibold text-[#a1435e]">
                  @{mention.handle}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-[#8c4058]">
                {mention.person}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
