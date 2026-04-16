"use client";

import Link from "next/link";

import { PayPalWordmark, StripeWordmark } from "@/components/dashboard/payment-brand-logos";
import { buttonVariants } from "@/components/ui/button-variants";
import { HelpInlineText } from "@/components/help/help-inline-text";
import type { HelpArticle, HelpBlock, HelpBody } from "@/lib/help/articles";
import { cn } from "@/lib/utils";

const cardClass =
  "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-none";

function formatBodyParagraphs(text: string) {
  return text.split(/\n\n+/).map((p, i) => (
    <p key={i} className="mb-3 text-sm leading-relaxed text-zinc-700 last:mb-0 dark:text-zinc-300">
      <HelpInlineText text={p.trim()} />
    </p>
  ));
}

function StepBadge({ num, badge }: { num: number; badge: "creo" | "stripe" }) {
  const bg =
    badge === "stripe"
      ? "bg-[#635BFF]"
      : "bg-creo-blue dark:bg-creo-blue";
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
        bg,
      )}
      aria-hidden
    >
      {num}
    </span>
  );
}

function BlockRenderer({ block }: { block: HelpBlock }) {
  switch (block.kind) {
    case "paragraphs":
      return <div className="space-y-1">{formatBodyParagraphs(block.text)}</div>;

    case "callout":
      return (
        <div className={cn(cardClass, "space-y-3 p-5 md:p-6")}>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{block.title}</h3>
          <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {block.items.map((item, i) => (
              <li key={i}>
                <HelpInlineText text={item} />
              </li>
            ))}
          </ul>
        </div>
      );

    case "sectionBrand":
      return (
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {block.brand === "stripe" ? <StripeWordmark /> : <PayPalWordmark />}
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{block.label}</span>
        </div>
      );

    case "numberedSteps":
      return (
        <ol className="space-y-3">
          {block.steps.map((step) => (
            <li key={step.num} className={cn(cardClass, "flex gap-4")}>
              <StepBadge num={step.num} badge={block.badge} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-900 dark:text-white">{step.title}</p>
                {step.text ? (
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    <HelpInlineText text={step.text} />
                  </p>
                ) : null}
                {step.bullets && step.bullets.length > 0 ? (
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {step.bullets.map((b, i) => (
                      <li key={i}>
                        <HelpInlineText text={b} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      );

    case "simpleCard":
      return (
        <div className={cn(cardClass, "p-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:p-6")}>
          <p>
            <HelpInlineText text={block.text} />
          </p>
        </div>
      );

    default:
      return null;
  }
}

function normalizeBody(body: HelpBody): HelpBlock[] {
  if (typeof body === "string") {
    return [{ kind: "paragraphs", text: body }];
  }
  return body;
}

export function HelpArticleBody({ article }: { article: HelpArticle }) {
  if (!article.body) {
    return null;
  }

  const blocks = normalizeBody(article.body);

  return (
    <div className="space-y-8">
      {article.subtitle ? (
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{article.subtitle}</p>
      ) : null}

      {article.backLink ? (
        <div>
          <Link href={article.backLink.href} className={cn(buttonVariants({ size: "sm" }))}>
            {article.backLink.label}
          </Link>
        </div>
      ) : null}

      <div className="space-y-8">
        {blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} />
        ))}
      </div>
    </div>
  );
}
