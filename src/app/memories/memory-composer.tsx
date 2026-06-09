"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, FileText, ImagePlus, Send, Video, X } from "lucide-react";
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

export function MemoryComposer({
  onClose,
}: Readonly<{
  onClose?: () => void;
}>) {
  const [selectedKind, setSelectedKind] = useState("moment");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
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

  return (
    <form
      action={createMemory}
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
      <p className="text-sm font-semibold text-[#a1435e]">New memory</p>
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
          placeholder={selected.titlePlaceholder}
          className="rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
        />

        <textarea
          name="body"
          required={selected.needsBody}
          placeholder={selected.bodyPlaceholder}
          className="min-h-28 resize-none rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA] px-4 py-3 text-sm outline-none placeholder:text-[#9c6b7b]"
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

        <button className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FF8FAB] px-5 py-3 text-sm font-semibold text-white">
          <Send size={16} />
          Save
        </button>
      </div>
    </form>
  );
}
