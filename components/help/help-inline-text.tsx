"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

function splitBold(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
    const m = part.match(/^\*\*(.+)\*\*$/);
    if (m) {
      return (
        <strong key={j} className="font-semibold text-zinc-900 dark:text-white">
          {m[1]}
        </strong>
      );
    }
    return part;
  });
}

function splitCode(text: string): React.ReactNode[] {
  return text.split(/(`[^`]+`)/g).map((part, j) => {
    const m = part.match(/^`([^`]+)`$/);
    if (m) {
      return (
        <code
          key={j}
          className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] text-zinc-800 dark:bg-white/10 dark:text-zinc-200"
        >
          {m[1]}
        </code>
      );
    }
    return <span key={j}>{splitBold(part)}</span>;
  });
}

type LinkSeg = { type: "text"; value: string } | { type: "link"; label: string; href: string };

function splitMarkdownLinks(text: string): LinkSeg[] {
  const out: LinkSeg[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push({ type: "text", value: text.slice(last, m.index) });
    }
    out.push({ type: "link", label: m[1]!, href: m[2]! });
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    out.push({ type: "text", value: text.slice(last) });
  }
  if (out.length === 0) {
    out.push({ type: "text", value: text });
  }
  return out;
}

/**
 * Gras ** **, liens [texte](url), code `inline`.
 */
export function HelpInlineText({
  text,
  className,
  linkClassName,
}: {
  text: string;
  className?: string;
  linkClassName?: string;
}) {
  const linkCn = cn(
    "font-medium text-creo-blue underline underline-offset-2 hover:opacity-90 dark:text-creo-blue-readable",
    linkClassName,
  );

  return (
    <span className={className}>
      {splitMarkdownLinks(text).map((seg, i) => {
        if (seg.type === "link") {
          const isExternal = /^https?:\/\//i.test(seg.href);
          if (isExternal) {
            return (
              <a key={i} href={seg.href} className={linkCn} target="_blank" rel="noreferrer">
                {seg.label}
              </a>
            );
          }
          return (
            <Link key={i} href={seg.href} className={linkCn}>
              {seg.label}
            </Link>
          );
        }
        return <span key={i}>{splitCode(seg.value)}</span>;
      })}
    </span>
  );
}
