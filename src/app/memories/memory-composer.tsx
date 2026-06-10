"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, FileText, ImagePlus, Send, Sparkles, Video, X } from "lucide-react";
import { MentionField } from "@/components/mention-field";
import { createMemory } from "./actions";

const memoryKinds = [
  {
    value: "text",
    label: "Text",
    heading: "Write something.",
    titlePlaceholder: "Text title",
    bodyPlaceholder: "Write what you want to save...",
    needsBody: true,
  },
  {
    value: "photo",
    label: "Photos",
    heading: "Save a photo.",
    titlePlaceholder: "Photo title",
    bodyPlaceholder: "What is the story behind it?",
    preferredMedia: "photo",
  },
  {
    value: "video",
    label: "Videos",
    heading: "Save a video.",
    titlePlaceholder: "Video title",
    bodyPlaceholder: "What should we remember about this?",
    preferredMedia: "video",
  },
  {
    value: "memory",
    label: "Memories",
    heading: "Save a memory.",
    titlePlaceholder: "Memory title",
    bodyPlaceholder: "Tell the full memory...",
    showDate: true,
    showLocation: true,
    needsBody: true,
  },
  {
    value: "moment",
    label: "Moments",
    heading: "Save a moment.",
    titlePlaceholder: "Moment title",
    bodyPlaceholder: "What happened in this little moment?",
    showDate: true,
    needsBody: true,
  },
  {
    value: "date",
    label: "Dates",
    heading: "Save a date.",
    titlePlaceholder: "Date title",
    bodyPlaceholder: "What made this date special?",
    showDate: true,
    showLocation: true,
    needsBody: true,
  },
  {
    value: "trip",
    label: "Trips",
    heading: "Save a trip.",
    titlePlaceholder: "Trip title",
    bodyPlaceholder: "Where did you go and what happened?",
    showDate: true,
    showLocation: true,
    needsBody: true,
  },
  {
    value: "gift",
    label: "Gifts",
    heading: "Save a gift.",
    titlePlaceholder: "Gift title",
    bodyPlaceholder: "What was the gift and why did it matter?",
    showDate: true,
    needsBody: true,
  },
  {
    value: "place",
    label: "Places",
    heading: "Save a place.",
    titlePlaceholder: "Place name",
    bodyPlaceholder: "Why is this place special?",
    showLocation: true,
    needsBody: true,
  },
  {
    value: "song",
    label: "Songs",
    heading: "Save a song.",
    titlePlaceholder: "Song title",
    bodyPlaceholder: "What does this song mean to us?",
    needsBody: true,
  },
  {
    value: "anniversary",
    label: "Anniversaries",
    heading: "Save a special day.",
    titlePlaceholder: "Special day title",
    bodyPlaceholder: "What should we remember?",
    showDate: true,
    needsBody: true,
  },
  {
    value: "surprise",
    label: "Surprises",
    heading: "Save a surprise.",
    titlePlaceholder: "Surprise title",
    bodyPlaceholder: "What was the surprise?",
    showDate: true,
    needsBody: true,
  },
];

type AiSuggestion = {
  title: string;
  caption: string;
  story: string;
  memoryType: string;
  tags: string[];
};

function readFileAsImage(file: File) {
  return new Promise<string | null>((resolve) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSide = 768;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    image.src = url;
  });
}

function readFileAsVideoThumbnail(file: File) {
  return new Promise<string | null>((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, Math.max(0, video.duration / 4));
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      const maxSide = 768;
      const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    video.src = url;
  });
}

async function filePreviewForAi(file: File) {
  if (file.type.startsWith("image/")) return readFileAsImage(file);
  if (file.type.startsWith("video/")) return readFileAsVideoThumbnail(file);
  return null;
}

export function MemoryComposer({
  onClose,
  action = createMemory,
  privateMode = false,
}: Readonly<{
  onClose?: () => void;
  action?: (formData: FormData) => void | Promise<void>;
  privateMode?: boolean;
}>) {
  const [selectedKind, setSelectedKind] = useState("moment");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [aiHint, setAiHint] = useState("");
  const [aiStatus, setAiStatus] = useState("");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => memoryKinds.find((kind) => kind.value === selectedKind) ?? memoryKinds[0],
    [selectedKind],
  );

  const Icon =
    selected.value === "video"
      ? Video
      : selected.value === "text"
        ? FileText
        : Camera;

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  async function suggestWithAi() {
    if (selectedFiles.length === 0 && !aiHint.trim()) {
      setAiStatus("Add a photo/video or write a small hint first.");
      return;
    }

    setIsSuggesting(true);
    setAiStatus("Reading the memory...");

    const images = (
      await Promise.all(
        selectedFiles
          .filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"))
          .slice(0, 4)
          .map(async (file) => ({
            name: file.name,
            dataUrl: await filePreviewForAi(file),
          })),
      )
    ).filter((item): item is { name: string; dataUrl: string } => Boolean(item.dataUrl));

    const response = await fetch("/api/ai/memory-caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images,
        fileNames: selectedFiles.map((file) => file.name),
        memoryType: selectedKind,
        hint: aiHint,
      }),
    });

    if (!response.ok) {
      setAiStatus("AI could not suggest this one. Try again.");
      setIsSuggesting(false);
      return;
    }

    const data = (await response.json()) as {
      suggestion?: AiSuggestion;
      warning?: string;
    };
    const suggestion = data.suggestion;

    if (suggestion) {
      setTitle(suggestion.title);
      setBody(suggestion.story);
      setCaption(suggestion.caption);
      setTags(suggestion.tags.map((tag) => `#${tag.replace(/^#/, "")}`).join(", "));
      if (memoryKinds.some((kind) => kind.value === suggestion.memoryType)) {
        setSelectedKind(suggestion.memoryType);
      }
      setAiStatus(data.warning || "AI suggestion added. You can edit it before saving.");
    } else {
      setAiStatus("AI did not return a suggestion.");
    }

    setIsSuggesting(false);
  }

  return (
    <form
      action={action}
      className="rounded-3xl border border-[#FFD6E8] bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#FFD6E8] text-[#8c4058]">
          <Icon size={20} />
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF7FA] text-[#a1435e]"
            aria-label="Close memory form"
          >
            <X size={17} />
          </button>
        ) : null}
      </div>
      <p className="text-sm font-semibold text-[#a1435e]">
        {privateMode ? "New private memory" : "New memory"}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-[#2d1b22]">
        {selected.heading}
      </h2>

      <div className="mt-5 grid gap-3">
        <label className="grid gap-2 text-sm font-semibold text-[#704153]">
          What are you saving?
          <select
            name="memory_type"
            value={selectedKind}
            onChange={(event) => setSelectedKind(event.target.value)}
            className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm font-normal outline-none focus:border-[#FF8FAB]"
          >
            {memoryKinds.map((kind) => (
              <option key={kind.value} value={kind.value}>
                {kind.label}
              </option>
            ))}
          </select>
        </label>

        <input
          name="title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={selected.titlePlaceholder}
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
        />

        <MentionField
          name="body"
          required={selected.needsBody}
          value={body}
          onChange={setBody}
          placeholder={selected.bodyPlaceholder}
          className="min-h-28 resize-none rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
        />

        <input
          name="tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="#date, #trip, #funny, #special"
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
        />

        {selected.showDate ? (
          <input
            name="memory_date"
            type="date"
            className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none"
          />
        ) : null}

        {selected.showLocation ? (
          <input
            name="location_text"
            placeholder="Place or location"
            className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
          />
        ) : null}

        <div className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[#704153]">
              Optional photos or videos
            </p>
            {selectedFiles.length > 0 ? (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#a1435e]">
                {selectedFiles.length} selected
              </span>
            ) : null}
          </div>
          <div className="grid gap-3">
            <input
              name="caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Caption for these attachments"
              className="rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
            />
            {selectedFiles.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}`}
                    className="overflow-hidden rounded-2xl border border-[#FFD6E8] bg-white"
                  >
                    <div className="relative aspect-square bg-[#FFD6E8]">
                      {file.type.startsWith("image/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewUrls[index]}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : file.type.startsWith("video/") ? (
                        <video
                          src={previewUrls[index]}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#8c4058]">
                          <FileText size={24} />
                        </div>
                      )}
                    </div>
                    <p className="truncate px-3 py-2 text-xs font-semibold text-[#704153]">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            <input
              name="media"
              type="file"
              ref={fileInputRef}
              multiple
              accept={
                selected.preferredMedia === "photo"
                  ? "image/*"
                  : selected.preferredMedia === "video"
                    ? "video/*"
                    : "image/*,video/*"
              }
              onChange={(event) =>
                setSelectedFiles(Array.from(event.currentTarget.files ?? []))
              }
              className="rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#FF8FAB] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            {selectedFiles.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedFiles([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#a1435e]"
              >
                <X size={15} />
                Clear files
              </button>
            ) : (
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#8c4058]">
                <ImagePlus size={14} />
                Add one or more photos/videos under this same title.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] p-3">
          <div className="grid gap-3">
            <input
              value={aiHint}
              onChange={(event) => setAiHint(event.target.value)}
              placeholder="Optional hint for AI, like where we were or what happened"
              className="rounded-2xl border border-[#FFD6E8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
            />
            <button
              type="button"
              onClick={() => void suggestWithAi()}
              disabled={isSuggesting}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#8c4058] ring-1 ring-[#FFD6E8] disabled:opacity-60"
            >
              <Sparkles size={15} />
              {isSuggesting ? "Suggesting..." : "Suggest with AI"}
            </button>
            {aiStatus ? (
              <p className="rounded-2xl bg-white px-4 py-3 text-xs font-semibold text-[#8c4058]">
                {aiStatus}
              </p>
            ) : null}
          </div>
        </div>

        <button className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white">
          <Send size={16} />
          {privateMode ? "Save privately" : "Save"}
        </button>
      </div>
    </form>
  );
}
