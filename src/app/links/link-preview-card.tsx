"use client";

import { useEffect, useState } from "react";

type Preview = {
  title: string | null;
  description: string | null;
  image: string | null;
  site: string | null;
};

export function LinkPreviewCard({ url }: Readonly<{ url: string }>) {
  const [preview, setPreview] = useState<Preview | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadPreview() {
      const response = await fetch("/api/links/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok || !mounted) return;
      setPreview(await response.json());
    }

    void loadPreview();

    return () => {
      mounted = false;
    };
  }, [url]);

  if (!preview) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-4 block min-w-0 max-w-full overflow-hidden rounded-2xl border border-[#FFD6E8] bg-[#FFF7FA]"
    >
      {preview.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.image}
          alt={preview.title ?? "Link preview"}
          className="h-36 w-full object-cover"
        />
      ) : null}
      <div className="min-w-0 p-3">
        {preview.site ? (
          <p className="break-words text-xs font-semibold text-[#a1435e]">
            {preview.site}
          </p>
        ) : null}
        <p className="mt-1 line-clamp-2 min-w-0 break-words text-sm font-semibold text-[#2d1b22]">
          {preview.title}
        </p>
        {preview.description ? (
          <p className="mt-2 line-clamp-3 min-w-0 break-words text-xs leading-5 text-[#765061]">
            {preview.description}
          </p>
        ) : null}
      </div>
    </a>
  );
}
