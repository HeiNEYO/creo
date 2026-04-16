"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

function initialsFromTitle(title: string): string {
  const t = title.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]!.slice(0, 1) + parts[1]!.slice(0, 1)).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

type CourseThumbnailProps = {
  title: string;
  thumbnailUrl: string | null;
  className?: string;
};

/** Miniature formation (URL externe ou initiales). */
export function CourseThumbnail({ title, thumbnailUrl, className }: CourseThumbnailProps) {
  const [broken, setBroken] = useState(false);
  const showImg = thumbnailUrl && !broken;

  return (
    <div
      className={cn(
        "relative flex size-full shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-creo-purple-pale to-creo-purple/20",
        className
      )}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- URLs arbitraires (workspace)
        <img
          src={thumbnailUrl!}
          alt=""
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="text-lg font-semibold tracking-tight text-creo-purple/50">
          {initialsFromTitle(title)}
        </span>
      )}
    </div>
  );
}
